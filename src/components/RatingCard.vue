<template>
    <v-container class="d-flex align-center justify-center">
        <v-card :class="smAndDown ? 'mobile' : ''" width="500" height="250" rounded="xl" style="margin-top: 64px; overflow: visible" elevation="24" class="mb-16">
            <v-img class="rounded-circle animate animate__animated animate__slideInDown" :src="review.reviewer.profileImage.replace('s48-w48-h48', 's128-w128-h128')" alt="User's profile image" />
            <v-card-title :class="smAndDown ? 'text-h6' : 'text-h5'" class="d-flex justify-start font-weight-light text-start">{{ review.reviewer.name }}</v-card-title>
            <v-card-subtitle class="text-caption mt-n4">
                {{ new Date(review.reviewedOn).toDateString() }}
            </v-card-subtitle>
            <v-card-text class="text-body-1 pt-1">
                <div class="d-flex align-center">{{ review.rating }} out of 5
                    <v-rating v-model="rating" half-increments density="compact" class="ml-2" active-color="yellow" color="yellow-accent-2" />
                    <v-avatar size="64" class="app-logo">
                        <v-img :src="app.logo.replace('s60', 's128')" alt="app icon" />
                    </v-avatar>
                </div>
                <v-sheet rounded="xl" color="grey-lighten-4" height="120" class="mt-4">
                    <p ref="reviewRef" class="text-grey-darken-2 review-text text-pre-wrap pa-2 animate animate__animated animate__slideInRight">{{ review.review }}</p>
                </v-sheet>
            </v-card-text>
            <!-- <v-progress-circular style="position: absolute; bottom: 8px; right: 8px;" :model-value="progress" width="1" :rotate="rotate" /> -->
        </v-card>
    </v-container>
</template>
<style scoped>
.app-logo {
    position: absolute;
    right: -32px;
}

p.review-text {
    max-height: 110px;
    overflow: auto;
}

.rounded-circle {
    position: absolute;
    top: -64px;
    right: 64px;
    width: 128px;
    height: 128px;
    border-radius: 50%;
    z-index: 999;
}

:deep() .highlight {
    animation: highlightWord linear forwards;
}

@keyframes highlightWord {
    0% {
        color: inherit;
    }

    100% {
        color: black;
        font-weight: bolder;
    }
}
</style>
<script setup>
import 'animate.css'
import { ref, onMounted, computed } from 'vue'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()
const rating = ref(0)
const props = defineProps({
    review: Object,
    app: Object,
    progress: Number,
    rotate: Number,
    duration: Number,
})
const reviewRef = ref()
const durationMinusAnimationTime = computed(() => props.duration - 300)

function highlightWords() {
    const reviewContainer = reviewRef.value
    reviewContainer.innerHTML = props.review.review.match(/\b\w+\b/g).map(word => `<span>${word}</span>`).join(' ')

    const words = reviewContainer.querySelectorAll('span')
    const wordDuration = durationMinusAnimationTime.value / words.length

    words.forEach((word, index) => {
        word.style.animationDelay = `${index * wordDuration}ms`
        word.style.animationDuration = `${wordDuration}ms`
        word.classList.add('highlight')
    })
}
onMounted(() => {
    const duration = Math.random() * (3 - 1) + 1
    let currentRating = 0

    // simple function to count with an easing function from currentRating to props.review.rating
    function count() {
        if (currentRating < props.review.rating) {
            currentRating += 0.5
            rating.value = currentRating
            setTimeout(count, duration / props.review.rating * 200)
        }
    }
    count()
    highlightWords()
})
</script>
