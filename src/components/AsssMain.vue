<template>
    <v-container fluid>
        <div v-if="!store.added[uuid] && !embed">
            <v-text-field variant="outlined" v-model="store.url" hide-details="auto" persistent-hint label="Web Store Reviews URL">
                <template v-slot:append-inner>
                    <v-btn @click="submitHandler" text="add" flat variant="tonal" :loading="loading" />
                </template>
            </v-text-field>
        </div>
        <v-window ref="windowRef" v-else show-arrows="hover" continuous v-model="windows" @mouseenter="hovering = true" @mouseleave="hovering = false">
            <v-window-item v-for="(review, index) of app.reviews.filter(reviewFilter)" :key="index">
                <rating-card :review="review" :app="app" />
            </v-window-item>
            <v-sheet rounded="xl" class="message text-h4 animate animate__animated pa-4" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)" :class="playStateUpdated || (hovering && !play) ? 'animate__fadeIn' : 'animate__fadeOut'">{{ play ? 'playing' : 'paused' }}</v-sheet>
        </v-window>
        <v-container class="d-flex flex-column align-center justify-center mt-n16 animate__animated animate__bounceInUp">
            <div class="title d-flex align-center">
                <v-avatar size="64" class="app-logo">
                    <v-img :src="app.logo.replace('s60', 's128')" alt="app icon" />
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
const { $api } = getCurrentInstance().appContext.config.globalProperties
const store = useAppStore()
const uuid = computed(() => store.url && uuidv5(store.url, uuidv5.URL))
const app = computed(() => uuid.value && store.added[uuid.value])
const loading = ref(false)
const windows = ref()
const playStateUpdated = ref(false)
const hovering = ref(false)
const animationendEventListenerAdded = ref(false)
const unfilteredReviews = computed(() => app.value.reviews.filter(reviewFilter)?.length || 0)
const interval = ref()
const embed = ref(false)
async function submitHandler() {
    try {
        loading.value = true

        const { appData, reviews } = await $api.asss({ auth: props.auth, url: encodeURIComponent(store.url) })
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
onMounted(() => {
    if (document.location.search.includes('embed')) {
        embed.value = true
    }
    if (document.location.search.includes('url')) {
        store.url = decodeURIComponent(new URLSearchParams(document.location.search).get('url'))
        submitHandler()
    }
    interval.value = setInterval(() => {
        if (play.value) {
            windows.value += windows.value === unfilteredReviews.value - 1 ? -(unfilteredReviews.value - 1) : 1
            console.log(`windows: ${windows.value} of ${unfilteredReviews.value}`)
        }
    }, 11000)
    addMessageEventListener()
    document.ondblclick = e => {
        play.value = !play.value
        playStateUpdated.value = true
    }
    watch(() => store.added, addMessageEventListener)
})
onBeforeUnmount(() => {
    clearInterval(interval.value)
})
</script>
