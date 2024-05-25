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
                    <v-rating v-model="rating" half-increments density="compact" class="ml-2" active-color="yellow" color="yellow-darken-1" />
                    <v-avatar size="64" class="app-logo">
                        <v-img :src="app.logo.replace('s60', 's128')" alt="app icon" />
                    </v-avatar>
                </div>
                <v-sheet rounded="xl" color="grey-lighten-4" height="120" class="mt-4">
                    <v-textarea ref="textareaRef" class="text-pre-wrap text-truncate pa-2" :model-value="review.review" no-resize rounded="xl" variant="solo" flat hide-details />
                </v-sheet>
            </v-card-text>
        </v-card>
    </v-container>
</template>
<style scoped>
.app-logo {
    position: absolute;
    right: -32px;
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

:deep() .v-input--density-default {
    --v-input-padding-top: unset;
}

:deep() .v-textarea .v-field--variant-solo {
    background-color: rgba(255, 255, 255, 0);
}

:deep() .v-textarea textarea {
    max-height: 110px;
    border-radius: 16px;
    padding-bottom: 0;
    padding-top: 0;
    padding-left: 8px;
    padding-right: 8px;
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
    review: Object,
    app: Object
})
onMounted(() => {
    const duration = Math.random() * (3 - 1) + 1
    const textareaEl = textareaRef.value.$el.querySelector('textarea')
    let currentRating = 0

    textareaEl.classList.add('animate', 'animate__animated', 'animate__slideInRight')

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
