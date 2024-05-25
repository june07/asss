<template>
    <div style="cursor: pointer">
        <v-menu>
            <template v-slot:activator="{ props }">
                <div v-bind="props" class="text-uppercase ml-2 text-deep-purple-darken-2" :class="updated ? 'animate__animated animate__lightSpeedInLeft' : ''">{{ store.outputFormat }}</div>
            </template>
            <v-list style="min-width: 250px;" lines="three" label="output formats" density="compact" hide-details flat placeholder="format" :items="outputFormats" item-props @update:selected="updateHandler" @click.prevent="linkHandler">
                <template v-slot:prepend="{ item }">
                    <div style="width: 140px" class="d-flex align-center text-uppercase text-h2 mr-2" :class="item.value === store.outputFormat ? 'text-deep-purple-darken-2 font-weight-bold' : ''">{{ item.value }}</div>
                </template>
                <template v-slot:subtitle="{ item }">
                    <div class="mb-2">
                        <a :href="item.href" target="_blank" rel="noopener noreferrer">{{ item.href }}</a>
                    </div>
                </template>
            </v-list>
        </v-menu>
    </div>
</template>
<style scoped>
:deep() .v-overlay__content {
    border-radius: 24px !important;
}

:deep() .v-overlay__content .v-list {
    background-color: rgba(255, 255, 255, 0.9) !important;
}

</style>
<script setup>
import 'animate.css'
import { ref } from 'vue'
import { useAppStore } from '../store/app'

const emit = defineEmits(['update'])
const store = useAppStore()
const updated = ref()
const outputFormats = [{
    value: 'avif',
    title: 'AV1 Image File Format',
    href: 'https://aomediacodec.github.io/av1-avif/'
}, {
    value: 'gif',
    title: 'Graphics Interchange Format',
    href: 'https://www.w3.org/Graphics/GIF/'
}, {
    value: 'heif',
    title: 'High Efficiency Image File Format',
    href: 'https://en.wikipedia.org/wiki/High_Efficiency_Image_File_Format'
}, {
    value: 'jp2',
    title: 'JPEG 2000',
    href: 'https://jpeg.org/jpeg2000'
}, {
    value: 'jxl',
    title: 'JPEG XL',
    href: 'https://jpeg.org/jpegxl'
}, {
    value: 'jpeg',
    title: 'Joint Photographic Experts Group',
    href: 'https://jpeg.org/jpeg'
}, {
    value: 'png',
    title: 'Portable Network Graphics',
    href: 'https://www.w3.org/TR/png/'
}, {
    value: 'raw',
    title: 'Raw',
    href: 'https://en.wikipedia.org/wiki/Raw_image_format'
}, {
    value: 'tiff',
    title: 'Tagged Image File Format',
    href: 'https://www.w3.org/TR/tiff/'
}, {
    value: 'webp',
    title: 'WebP',
    href: 'https://developers.google.com/speed/hrefp/'
}]
function updateHandler(format) {
    if (format.length && format[0] !== store.outputFormat) {
        store.outputFormat = format[0]
        emit('update')
        updated.value = true
        setTimeout(() => updated.value = false, 1000)
    }
}
function linkHandler(event) {
    const { target } = event

    // if the target is an anchor tag then open it in a new tab
    if (target.tagName === 'A') {
        window.open(target.href, '_blank', 'noopener,noreferrer')
    }
}
</script>