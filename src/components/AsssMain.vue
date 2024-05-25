<template>
    <v-container fluid>
        <div v-if="!store.added[uuid]">
            <v-text-field variant="outlined" v-model="store.url" hide-details="auto" persistent-hint label="Web Store Reviews URL">
                <template v-slot:append-inner>
                    <v-btn @click="submitHandler" text="add" flat variant="tonal" :loading="loading" />
                </template>
            </v-text-field>
        </div>
        <v-window ref="windowRef" v-else show-arrows="hover" continuous v-model="windows">
            <v-window-item v-for="(review, index) of reviews.filter(reviewFilter)" :key="index">
                <rating-card :review="review" />
            </v-window-item>
        </v-window>
    </v-container>
</template>
<style scoped>
.labels {
    width: 50px;
    margin-top: 45px;
    margin-left: 10px;
    position: absolute;
    transform: rotate(45deg);
}

:deep() img[data-dz-thumbnail] {
    width: -webkit-fill-available;
}
</style>
<script setup>
import 'animate.css'
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useAppStore } from '../store/app'
import { v5 as uuidv5 } from 'uuid'

import RatingCard from './RatingCard.vue'

const windowRef = ref()
const props = defineProps({
    auth: Object
})
const { $api } = getCurrentInstance().appContext.config.globalProperties
const store = useAppStore()
const uuid = computed(() => store.url &&uuidv5(store.url, uuidv5.URL))
const reviews = computed(() => uuid.value && store.added[uuid.value]?.reviews || [])
const loading = ref(false)
const windows = ref()

async function submitHandler() {
    try {
        loading.value = true

        const reviews = await $api.asss({ auth: props.auth, url: encodeURIComponent(store.url) })
        if (reviews.length) {
            store.added[uuid.value] = {
                url: store.url,
                reviews
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
onMounted(() => {
    setInterval(() => {
        windows.value += windows.value === reviews.length - 1 ? -reviews.length : 1
    }, 11000)
})
</script>
