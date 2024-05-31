<template>
    <v-container fluid v-show="loaded" class="pa-0">
        <div v-if="loaded && !reviews?.length">
            <v-text-field variant="outlined" v-model="store.url" hide-details="auto" persistent-hint label="Web Store Reviews URL">
                <template v-slot:append-inner>
                    <v-btn @click="submitHandler" text="add" flat variant="tonal" :loading="loading" />
                </template>
            </v-text-field>
        </div>
        <div class="w-100 d-flex align-center justify-center" v-if="app && reviews?.length && !hideShare">
            <social-share rounded />
        </div>
        <v-window ref="windowRef" v-if="app && reviews?.length" show-arrows="hover" continuous v-model="windows" @mouseenter="hovering = true" @mouseleave="hovering = false">
            <v-window-item v-for="(review, index) of reviews.filter(reviewFilter)" :key="review._id">
                <rating-card v-if="Math.abs(windows - index) <= 2" :active="windows === index" :review="review" :app="app" :progress="reviewReadTimer" :rotate="(windows || 1) * 10" :duration="duration" />
                <div style="position: relative; top: -64px; height: 0" class="text-caption text-center">{{ `${windows + 1} of ${app.totalReviews || reviews.length}` }}</div>
            </v-window-item>
            <!-- pausedAtLeastOnce hides the message on first load -->
            <div v-show="pausedAtLeastOnce">
                <v-sheet rounded="xl" class="message text-h4 animate animate__animated pa-4" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)" :class="(hovering && !play) ? 'animate__fadeIn' : 'animate__fadeOut'">{{ play ? 'playing' : 'paused' }}</v-sheet>
            </div>
        </v-window>
        <v-container v-if="app && reviews?.length && !hideFooter" class="d-flex flex-column align-center justify-center mt-n16 animate__animated animate__bounceInDown">
            <div class="title d-flex align-center" @click="openAppStore" style="cursor: pointer">
                <v-avatar size="64" class="app-logo">
                    <v-img :src="app.logo?.replace('s60', 's128')" alt="app icon" />
                </v-avatar>
                <div class="text-h6">{{ app.name }}</div>
            </div>
            <div class="subtitle d-flex align-center mt-n2">
                <div class="ml-2 d-flex align-center">{{ app.score }}<v-icon icon="star" color="yellow" /></div>
                <div class="ml-2">({{ app.ratings }} ratings)</div>
                <div class="ml-2">
                    <NumberAnimation :to="app.users" :format="num => parseInt(num)" />+ users
                </div>
            </div>
        </v-container>
    </v-container>
</template>
<style scoped>
.v-sheet {
    background-color: rgba(255, 255, 255, 0.8);
}
</style>
<script setup>
import 'animate.css'
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance, watch } from 'vue'
import { useAppStore } from '../store/app'
import { v5 as uuidv5 } from 'uuid'
import NumberAnimation from "vue-number-animation"
import { until } from 'async'
import Swal from 'sweetalert2'

import { getAppFromDB } from '../plugins/indexedDb.plugin'
import RatingCard from './RatingCard.vue'
import SocialShare from './SocialShare.vue'

const emit = defineEmits(['message'])
const play = ref(true)
const windowRef = ref()
const props = defineProps({
    auth: Object,
    hideCounter: Boolean,
    hideShare: Boolean,
    hideFooter: Boolean
})
const progressBarTickInterval = ref()
const reviewReadTimer = ref(0)
const pausedAtLeastOnce = ref(false)
const { $api } = getCurrentInstance().appContext.config.globalProperties
const store = useAppStore()
const uuid = computed(() => store.url && uuidv5(store.url, uuidv5.URL))
const app = ref()
const loading = ref(false)
const loaded = ref(false)
const reviews = ref([])
const windows = ref()
const hovering = ref(false)
const animationendEventListenerAdded = ref(false)
const filteredReviews = computed(() => reviews.value?.filter(reviewFilter))
const limit = ref(20)
const duration = ref(0)
async function submitHandler() {
    try {
        if (!props.auth?.token) {
            emit('message', 'Please login to add reviews.')
            return
        }
        loading.value = true

        const job = await $api.postApp({ auth: props.auth, url: encodeURIComponent(store.url) })
        store.jobs[job.uuid] = job

        showSwal()
    } catch (error) {
        console.error(error)
        if (/429/.test(error.response?.status)) {
            console.log('Too many requests. Please try again later.')
        }
    } finally {
        loading.value = false
    }
}
/**
const test = async function() {
    store.url = `https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj/reviews`
    showSwal({ t: 1000 })
}
test()
*/
function showSwal({ t = 2000 } = {}) {
    let timerInterval


    Swal.fire({
        title: `Your app has been added!`,
        html: `<p class="mb-4">The ass 🕳️<span class="ml-n5">🕳️</span> are being wiped from ${app.value?.name || 'your'} reviews.</p>
        <p style="display: none">I will close in <b></b> seconds.</p>`,
        icon: 'success',
        // footer: `<div id="swal-footer"></div>`,
        timer: t,
        didOpen: async () => {
            await until(
                async () => {
                    try {
                        const status = await $api.getStatus({ uuid: uuid.value })
                        return status?.reviews
                    } catch (error) {
                        console.log(error)
                    }
                },
                async () => await new Promise(resolve => setTimeout(resolve, 1000))
            )

            Swal.showLoading()
            let timer = Swal.getPopup().querySelector("b")
            timerInterval = setInterval(() => {
                timer.textContent = `${(Swal.getTimerLeft() / 1000).toFixed(2)}`
                timer.style.display = 'inline-block'
            }, 100)
        },
        willClose: () => {
            clearInterval(timerInterval)
        }
    }).then(async (result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
            console.log("I was closed by the timer")
            loadReviews(store.url, uuid.value)
        }
    })
}
function reviewFilter(review) {
    return review.rating >= 4
}
function openAppStore() {
    console.log(app.value)
    window.open(app.value.url, '_blank', 'noopener', 'noreferrer')
}
const loadReviews = async (url, uuid, index = 0) => {
    loading.value = true

    try {
        let done = false
        while (!done) {
            const iterator = $api.chunkedReviewsIterator(url, uuid, index, limit.value, store)
            const chunk = await iterator.next()

            if (!chunk.done) {
                if (chunk.value === 'reset') {
                    reviews.value = []
                    index = 0
                } else if (chunk.value) {
                    reviews.value.push(...chunk.value)
                    index += limit.value
                    await until(
                        callback => callback(null, windows?.value && windows.value >= filteredReviewsLength.value - 10),
                        async () => await new Promise(resolve => setTimeout(resolve, 1000))
                    )
                }
            } else {
                done = true
            }
        }

        loading.value = false
    } catch (err) {
        console.error(err)
        loading.value = false
    }
}
async function setApp() {
    if (!uuid.value) return
    app.value = await getAppFromDB(uuid.value)
}
function handleKeydown(event) {
    if (event.key === 'ArrowRight') {
        windows.value += 1
    } else if (event.key === 'ArrowLeft') {
        windows.value -= 1
    }
    resetTimeout()
}
const filteredReviewsLength = computed(() => filteredReviews.value?.length || 0)
function resetTimeout(d = 5000) {
    const wordsInNextReview = (filteredReviews.value[(windows?.value || 0) + 1]?.review.match(/\b\w+\b/g) || [])?.length
    const nextDuration = Math.min(Math.max(wordsInNextReview * 200, 2000) || d, 11000)
    // console.log(`${windows?.value} ${wordsInNextReview} words, ${nextDuration/1000}s`, filteredReviews.value[(windows?.value || 0) + 1]?.review)

    duration.value = d
    const tick = d / 100
    let ticks = 0
    if (progressBarTickInterval.value) clearInterval(progressBarTickInterval.value)
    progressBarTickInterval.value = setInterval(() => {
        reviewReadTimer.value = ticks < 5 ? 0 : (1 - (d - ticks * tick) / d) * 100
        ticks += 1
    }, tick)
    setTimeout(() => {
        if (play.value && !hovering.value) {
            windows.value += windows.value === filteredReviewsLength.value - 1 ? -(filteredReviewsLength.value - 1) : 1
        }
        clearInterval(progressBarTickInterval.value)
        resetTimeout(nextDuration)
    }, d)
}
onMounted(() => {
    setApp()
    if (document.location.search.includes('url')) {
        store.url = decodeURIComponent(new URLSearchParams(document.location.search).get('url'))
        loadReviews(store.url, uuid.value)
    } else if (document.location.pathname === '/nim') {
        store.url = 'https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj/reviews'
        loadReviews(store.url, uuid.value)
    }
    resetTimeout()
    document.ondblclick = e => {
        play.value = !play.value
        if (!pausedAtLeastOnce.value && !play.value) {
            pausedAtLeastOnce.value = true
        }
    }
    document.addEventListener('keydown', handleKeydown)
    watch(() => uuid.value, setApp)
    watch(reviews.value, reviews => {
        if (reviews?.length && !app.value) {
            setApp()
        }
    })
    setTimeout(() => {
        loaded.value = true
    }, 1000)
})
onBeforeUnmount(() => {
    if (progressBarTickInterval.value) clearInterval(progressBarTickInterval.value)
    document.removeEventListener('keydown', handleKeydown)
})
</script>
