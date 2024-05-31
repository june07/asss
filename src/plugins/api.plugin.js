import axios from "axios"
import { getReviewsFromDB, addReviewsToDB } from './indexedDb.plugin'
import { setupCache, buildWebStorage } from 'axios-cache-interceptor'

const {
    MODE,
    VITE_APP_API_SERVER,
} = import.meta.env

const axiosInstance = axios.create({
    headers: {
        "x-application": "asss",
    },
    withCredentials: true
})

setupCache(axiosInstance, {
    storage: buildWebStorage(localStorage, 'axios-cache')
})

const apiService = () => {
    const request = async (passedOptions) => {
        const { auth, data, method, url, responseType, cache = false } = passedOptions
        const defaultOptions = {
            url,
            method: method || 'GET',
            responseType: responseType || 'json',
            cache
        }
        let options = {
            ...defaultOptions,
            headers: auth ? {
                ...defaultOptions.headers,
                'Authorization': `Bearer ${auth.token}`
            } : defaultOptions.headers
        }
        if (data) {
            options.data = data
        }

        try {
            const response = await axiosInstance(options)
            return options.returnResponse ? response : response.data
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data)
                console.log(error.response.status)
                console.log(error.response.headers)
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request)
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message)
            }
            console.log(error.config)
            throw error
        }
    }
    const cacheless = {
        postApp: async ({ auth, url }) => await request({ auth, method: 'POST', url: `${VITE_APP_API_SERVER}/v1/asss?url=${url}` }),
        getStatus: async ({ uuid }) => await request({ url: `${VITE_APP_API_SERVER}/v1/asss/status/${uuid}` }),
        getReviews: async ({ url, limit, offset = 0 }) => await request({ url: `${VITE_APP_API_SERVER}/v1/asss?url=${url}&limit=${limit || 10}&offset=${offset}` }),
    }
    const getReviewsCount = async ({ url }) => await request({ returnResponse: true, url: `${VITE_APP_API_SERVER}/v1/asss/count?url=${url}`, cache: true })
    async function reFetchAllFromMongo(url, uuid, offset, limit, store) {
        const data = await cacheless.getReviews({ url, limit, offset })
        if (data.reviews && data.reviews.length > 0) {
            const count = await addReviewsToDB(data.appData._id, url, uuid, data)

            if (reviewsCount === count) {
                store.appIdsToUUIDs[data.appData._id] = uuid
            }
            return data.reviews
        }
    }
    let reviewsInDB = 0
    let reviewsCount

    return {
        request,
        buildInfo: async () => {
            if (MODE !== 'production' && !/dev\./.test(window.location.host)) {
                return
            }
            try {
                const { data } = await axiosInstance.get(`${window.origin}/build-info.json`, {
                    headers: {
                        'Cache-Control': 'no-store, max-age=0',
                    },
                })
                return data
            } catch (error) {
                console.log(error)
            }
        },
        ...cacheless,
        chunkedReviewsIterator: async function* (url, uuid, offset = 0, limit = 10, store) {
            let moreAvailable = true

            if (!reviewsCount) {
                getReviewsCount({ url }).then(({ count }) => {
                    reviewsCount = count
                })
            }

            while (moreAvailable) {
                const _id = Object.entries(store.appIdsToUUIDs).find(([_id, storedUUID]) => storedUUID === uuid)?.[0]

                if (_id) {
                    const reviewsFromDB = await getReviewsFromDB(_id, limit, offset)

                    if (reviewsFromDB.length > 0) {
                        reviewsInDB += reviewsFromDB.length
                        yield reviewsFromDB
                    } else {
                        /** check mongo to make sure the count has not changed and if it has read the updates excluding all we already have.
                         * But include the reviews that might be old... based on the timestamp
                         */
                        if (reviewsCount > reviewsInDB) {
                            delete store.appIdsToUUIDs[_id]
                            yield 'reset'
                        }
                        return
                    }
                } else {
                    const reviews = await reFetchAllFromMongo(url, uuid, offset, limit, store)

                    if (reviews?.length) {
                        yield reviews
                    }
                    moreAvailable = false
                    return
                }
            }
        }
    }
}

export default {
    async install(app) {
        app.config.globalProperties.$api = apiService()
    }
}