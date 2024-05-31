// indexedDB.js
import { openDB } from 'idb'

const dbName = 'asss'
const appsStoreName = 'apps'
const reviewsStoreName = 'reviews'

async function initDB() {
    return openDB(dbName, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(appsStoreName)) {
                const idbStore = db.createObjectStore(appsStoreName, { keyPath: '_id' })
                idbStore.createIndex('appId', '_id', { unique: true })
                idbStore.createIndex('uuid', 'uuid', { unique: true })
            }
            if (!db.objectStoreNames.contains(reviewsStoreName)) {
                const idbStore = db.createObjectStore(reviewsStoreName, { keyPath: '_id' })
                idbStore.createIndex('appOId', 'appOId', { unique: false })
            }
        },
    })
}

export async function getReviewsFromDB(_id, limit, offset) {
    const db = await initDB()
    const tx = db.transaction(reviewsStoreName, 'readonly')
    const storeReviews = tx.objectStore(reviewsStoreName)
    const index = storeReviews.index('appOId')
    let count = 0
    let skipped = 0
    let reviews = []

    try {
        // Create a cursor to iterate over the reviews
        let cursor = await index.openCursor(IDBKeyRange.only(_id))

        while (cursor) {
            if (skipped < offset) {
                skipped += 1
            } else {
                const review = cursor.value
                // Check if the review ID is in the exclude list
                reviews.push(review)
                count++
                if (count >= limit) {
                    break
                }
            }
            cursor = await cursor.continue()
        }
        return reviews
    } catch (error) {
        console.error(error)
    }
}
export async function getAppFromDB(uuid) {
    const db = await initDB()
    const tx = db.transaction(appsStoreName, 'readonly')
    const storeApp = tx.objectStore(appsStoreName)
    const index = await storeApp.index('uuid')
    const app = await index.get(uuid)
    return app
}

export async function addReviewsToDB(_id, url, uuid, data) {
    const { appData: app, reviews } = data
    const db = await initDB()
    const tx = db.transaction([appsStoreName, reviewsStoreName], 'readwrite')
    const storeApp = tx.objectStore(appsStoreName)
    const storeReviews = tx.objectStore(reviewsStoreName)

    // Fetch existing app data to merge reviews
    const existingApp = await storeApp.get(_id) || {}
    const updatedApp = {
        ...existingApp,
        ...app,
        url
    }

    await storeApp.put({ ...updatedApp, uuid })
    await Promise.all(reviews.map(review => storeReviews.put(review)))

    const count = await storeReviews.count()
    await tx.done
    return count
}

export async function clearDB() {
    const db = await initDB()
    return db.clear(appsStoreName)
}
