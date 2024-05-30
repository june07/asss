<template>
    <v-menu v-model="menu" @update:model-value="value => !value && $emit('closed')">
        <template v-slot:activator="{ props: menu }">
            <v-tooltip text="Copied" v-model="tooltips.share" location="top" :open-on-hover="false">
                <template v-slot:activator="{ props: tooltip }">
                    <v-btn :icon="icon ? 'share' : undefined" :class="buttonClass" :prepend-icon="!icon ? 'share' : undefined" v-bind="mergeProps(menu, tooltip)" :variant="variant" :size="size" :color="color" :rounded="rounded" :density="density" :text="text" />
                </template>
            </v-tooltip>
        </template>
        <v-list class="rounded-xl">
            <v-list-item v-for="shareType in shareTypes" :key="shareType.network" density="compact">
                <ShareNetwork :url="url" :network="shareType.network" :title="title" :description="description" :quote="quote" :hashtags="hashtags" :twitterUser="twitterUser" class="d-flex">
                    <v-icon class="mr-2" :color="shareType.color">
                        <v-icon v-if="shareType.icon" size="x-small" :icon="shareType.icon" />
                        <v-img v-else src="/asss.svg" class="mr-2" height="32" width="32"></v-img>
                    </v-icon>
                    <div>{{ shareType.title }}</div>
                </ShareNetwork>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
<style scoped>
a {
    text-decoration: none !important;
}
</style>
<script setup>
import { ref, mergeProps, watch, onMounted } from 'vue'
import { ShareNetwork } from 'vue-social-sharing'

const menu = ref()
const tooltips = ref({
    share: false
})
const props = defineProps({
    url: {
        type: String,
        default: 'https://asss.june07.com'
    },
    text: {
        type: String,
        default: 'share'
    },
    size: String,
    density: String,
    icon: String,
    color: String,
    rounded: Boolean,
    variant: {
        type: String,
        default: 'text'
    },
    title: {
        type: String,
        default: 'AssS'
    },
    description: String,
    quote: String,
    hashtags: String,
    disabled: Array,
    buttonClass: String,
    modelValue: Boolean
})
const twitterUser = "june07"
const shareTypes = [
    {
        network: "email",
        title: "Email",
        color: "#333333",
    },
    {
        network: "facebook",
        title: "Facebook",
        color: "#1877f2",
    },
    {
        network: "sms",
        title: "SMS",
        color: "#333333",
    },
    {
        network: "twitter",
        title: "Twitter",
        color: "#1da1f2",
    },
    {
        network: "whatsapp",
        title: "Whatsapp",
        color: "#25d366",
    },
    {
        network: "linkedin",
        title: "LinkedIn",
        color: "#0a66c2",
    },
    {
        network: "messenger",
        title: "Messenger",
        color: "#0084ff",
    },
    {
        network: "pinterest",
        title: "Pinterest",
        color: "#bd081c",
        media: "media URL of an image describing the content.",
    },
    {
        network: "telegram",
        title: "Telegram",
        color: "#0088cc",
    },
    {
        network: "tumblr",
        title: "Tumblr",
        color: "#36465d",
    },
    {
        network: "viber",
        title: "Viber",
        color: "#59267c",
    },
    {
        network: "vk",
        title: "VK",
        color: "#4a76a8",
        media: "media URL of an image describing the content.",
    },
    {
        network: "weibo",
        title: "Weibo",
        color: "#e6162d",
        media: "media URL of an image describing the content.",
    },
    {
        network: "wordpress",
        title: "Wordpress",
        color: "#21759b",
        media: "media URL of an image describing the content.",
    },
    {
        network: "baidu",
        title: "Baidu",
        color: "#3385ff",
    },
    {
        network: "buffer",
        title: "Buffer",
        color: "#333333",
    },
    {
        network: "evernote",
        title: "EverNote",
        color: "#2dbe60",
    },
    {
        network: "flipboard",
        title: "FlipBoard",
        color: "#E12828",
    },
    {
        network: "hackernews",
        title: "HackerNews",
        color: "#ff6600",
    },
    {
        network: "instapaper",
        title: "InstaPaper",
        color: "#333333",
    },
    {
        network: "line",
        title: "Line",
        color: "#00b900",
    },
    {
        network: "odnoklassniki",
        title: "Odnoklassniki",
        color: "#ed812b",
    },
    {
        network: "reddit",
        title: "Reddit",
        color: "#ff4500",
    },
    {
        network: "skype",
        title: "Skype",
        color: "#00aff0",
    },
    {
        network: "stumbleupon",
        title: "StumbleUpon",
        color: "#eb4924",
    },
    {
        network: "xing",
        title: "Xing",
        color: "#006567",
    },
    {
        network: "yammer",
        title: "Yammer",
        color: "#0072c6",
    },
]
    .filter(shareType => !props.disabled?.includes(shareType.network))
    .filter(shareType => !(shareType.network === 'tab' && props.url !== document.location.href))

onMounted(() => {
    watch(() => props.modelValue, modelValue => {
        menu.value = modelValue
    })
})
</script>
