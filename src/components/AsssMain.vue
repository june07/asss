<template>
    <v-container fluid>
        <div v-if="!store.added[uuid] && !embed">
            <v-text-field variant="outlined" v-model="store.url" hide-details="auto" persistent-hint label="Web Store Reviews URL">
                <template v-slot:append-inner>
                    <v-btn @click="submitHandler" text="add" flat variant="tonal" :loading="loading" />
                </template>
            </v-text-field>
        </div>
        <v-window ref="windowRef" v-if="app?.reviews" show-arrows="hover" continuous v-model="windows" @mouseenter="hovering = true" @mouseleave="hovering = false">
            <v-window-item v-for="(review, index) of app.reviews.filter(reviewFilter)" :key="index">
                <rating-card :review="review" :app="app" />
                <div style="position: relative; top: -64px; height: 0" class="text-caption text-center">{{ `${windows + 1} of ${app.reviews.filter(reviewFilter)?.length}` }}</div>
            </v-window-item>
            <!-- pausedAtLeastOnce hides the message on first load -->
            <div v-show="pausedAtLeastOnce">
                <v-sheet rounded="xl" class="message text-h4 animate animate__animated pa-4" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)" :class="playStateUpdated || (hovering && !play) ? 'animate__fadeIn' : 'animate__fadeOut'">{{ play ? 'playing' : 'paused' }}</v-sheet>
            </div>
        </v-window>
        <v-container v-if="app?.reviews" class="d-flex flex-column align-center justify-center mt-n16 animate__animated animate__bounceInDown">
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

import RatingCard from './RatingCard.vue'

const play = ref(true)
const windowRef = ref()
const props = defineProps({
    auth: Object
})
const pausedAtLeastOnce = ref(false)
const { $api } = getCurrentInstance().appContext.config.globalProperties
const store = useAppStore()
const uuid = computed(() => store.url && uuidv5(store.url, uuidv5.URL))
const app = computed(() => uuid.value && store.added[uuid.value])
const loading = ref(false)
const windows = ref()
const playStateUpdated = ref(false)
const hovering = ref(false)
const animationendEventListenerAdded = ref(false)
const unfilteredReviews = computed(() => app.value?.reviews?.filter(reviewFilter).length || 0)
const interval = ref()
const embed = ref(false)
async function submitHandler(options) {
    const { publicEndpoint } = options

    try {
        loading.value = true

        const { appData, reviews } = publicEndpoint ? await $api.asssPublic({ url: encodeURIComponent(store.url) }) : await $api.asss({ auth: props.auth, url: encodeURIComponent(store.url) })
        if (reviews.length) {
            store.added[uuid.value] = {
                url: store.url,
                reviews,
                ...appData
            }
        }
    } catch (error) {
        console.error(error)
        if (/429/.test(error.response.status)) {
            console.log('Too many requests. Please try again later.')
        }
    } finally {
        loading.value = false
    }
}
function reviewFilter(review) {
    return review.rating >= 4
}
function addMessageEventListener() {
    if (animationendEventListenerAdded.value) return
    const el = document.querySelector('.message')
    if (!el) return
    el.addEventListener('animationend', () => {
        playStateUpdated.value = false
    })
    animationendEventListenerAdded.value = true
}
function openAppStore() {
    window.open(app.value.url, '_blank', 'noopener', 'noreferrer')
}
onMounted(() => {
    if (document.location.search.includes('embed')) {
        embed.value = true
    }
    if (document.location.search.includes('url')) {
        store.url = decodeURIComponent(new URLSearchParams(document.location.search).get('url'))
        submitHandler({ publicEndpoint: true })
    }
    interval.value = setInterval(() => {
        if (play.value && !hovering.value) {
            windows.value += windows.value === unfilteredReviews.value - 1 ? -(unfilteredReviews.value - 1) : 1
        }
    }, 5000)
    addMessageEventListener()
    document.ondblclick = e => {
        play.value = !play.value
        playStateUpdated.value = true
        if (!pausedAtLeastOnce.value && !play.value) {
            pausedAtLeastOnce.value = true
        }
    }
    watch(() => store.added, addMessageEventListener)
})
onBeforeUnmount(() => {
    clearInterval(interval.value)
})
</script>
