<template>
    <v-container class="d-flex align-center justify-center">
        <v-card :class="smAndDown ? 'mobile' : ''" width="500" height="250" rounded="xl" style="margin-top: 64px; overflow: visible" elevation="24" class="mb-16">
            <v-img class="rounded-circle animate animate__animated animate__slideInDown" :src="review.reviewer.profileImage.replace('s48-w48-h48', 's128-w128-h128')" alt="User's profile image" />
            <v-card-title :class="smAndDown ? 'text-h6' : 'text-h5'" class="d-flex justify-start font-weight-light text-start">{{ review.reviewer.name }}</v-card-title>
            <v-card-subtitle class="text-caption mt-n4">
                {{ new Date(review.reviewedOn).toDateString() }}
            </v-card-subtitle>
            <v-card-text class="text-body-1">
                <div class="d-flex align-center">{{ review.rating }} out of 5
                    <v-rating v-model="rating" half-increments density="compact" class="ml-2" />
                </div>
                <v-textarea ref="textareaRef" style="max-height: 130px" class="text-pre-wrap text-truncate" :model-value="review.review" no-resize rounded="xl" variant="solo" flat hide-details />
            </v-card-text>
        </v-card>
    </v-container>
</template>
<style scoped>
.rounded-circle {
    position: absolute;
    top: -64px;
    right: 64px;
    width: 128px;
    height: 128px;
    border-radius: 50%;
    z-index: 999;
}
</style>
<script setup>
import 'animate.css'
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

const textareaRef = ref()
const { smAndDown } = useDisplay()
const rating = ref(0)
const props = defineProps({
    review: Object
})
onMounted(() => {
    const duration = Math.random() * (3 - 1) + 1
    let currentRating = 0

    textareaRef.value.$el.querySelector('textarea').classList.add('animate', 'animate__animated', 'animate__slideInRight')

    // simple function to count with an easing function from currentRating to props.review.rating
    function count() {
        if (currentRating < props.review.rating) {
            currentRating += 0.5
            rating.value = currentRating
            setTimeout(count, duration / props.review.rating * 200)
        }
    }
    count()
})
</script>
