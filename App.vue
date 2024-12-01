<template>
    <v-app>
        <v-main>
            <v-container class="h-100 d-flex justify-center pa-0">
                <FAQ v-if="isValidRoute && /\/faq/.test(route.path)" />
                <asss-main v-else-if="authLoaded && isValidRoute" :auth="auth" :hideFooter="hideFooter" :hideShare="hideShare" :hideCounter="hideCounter" @message="messageHandler" @signin="signin" />
                <div v-else-if="!isValidRoute" class="text-h1 h-100 d-flex align-center">
                    404
                </div>
            </v-container>
        </v-main>
        <v-snackbar text :timeout="-1" v-model="snackbar.active" style="opacity: 0.9" @click="snackbarCloseHandler">
            <v-row>
                <v-col cols="1" class="d-flex align-center justify-center">
                    <v-icon :icon="snackbar.icon" :color="snackbar.iconColor" />
                </v-col>
                <v-col cols="10" class="d-flex align-center justify-center">
                    <span v-if="error">{{ snackbar.message }}</span>
                    <span v-else @click="reload" class="font-weight-light" v-bind:class="smAndDown ? 'caption' : ''" style="cursor: pointer">App update available.</span>
                </v-col>
                <v-col cols="1" class="d-flex align-center justify-center">
                    <v-btn variant="plain" :size="smAndDown ? 'x-small' : ''" @click="snackbarCloseHandler"> x </v-btn>
                </v-col>
            </v-row>
        </v-snackbar>
    </v-app>
</template>
<style scoped>
</style>
<script setup>
import { ref, getCurrentInstance, onMounted, computed, provide } from "vue"
import { useDisplay } from "vuetify/lib/framework.mjs";

import AsssMain from "./src/components/AsssMain.vue"
import FAQ from './src/components/FAQ.vue'

const isIframed = ref(false)
const { smAndDown } = useDisplay()
const route = ref({})
const auth = ref()
const { $api, $keycloak } = getCurrentInstance().appContext.config.globalProperties
const signin = () => $keycloak.value.login({ redirectUri: route.value.params?.get('redirect') || window.location.origin })
const signup = () => $keycloak.value.login({ redirectUri: route.value.params?.get('redirect') || window.location.origin, action: 'register' })
const version = ref()
const snackbarDefault = {
    active: false,
    icon: 'info',
    message: undefined,
}
const snackbar = ref({ ...snackbarDefault })
const lastBuild = ref()
const versionCheckIntervalId = ref()
const buildInfo = ref()
const authLoaded = ref(false)
const hideFooter = computed(() => !(!route.value.params?.get('hideFooter') || ['0', 0, 'false', false].includes(route.value.params?.get('hideFooter'))))
const hideCounter = computed(() => !(!route.value.params?.get('hideCounter') || ['0', 0, 'false', false].includes(route.value.params?.get('hideCounter'))))
const hideShare = computed(() => !(!route.value.params?.get('hideShare') || ['0', 0, 'false', false].includes(route.value.params?.get('hideShare'))))
const isValidRoute = computed(() => !isLoaded.value || new RegExp(/\/(|(app|faq).*)$/).test(route.value.path))
const isLoaded = ref(false)

const checkVersion = async () => {
    buildInfo.value = await $api.buildInfo()

    if (!buildInfo.value?.build_date) {
        return
    }
    version.value = buildInfo.value.commit_sha
    if (lastBuild.value && lastBuild.value?.build_date !== buildInfo.value.build_date) {
        snackbar.value.active = true
        // TODO: put some extra check here...
        resetLocalStorage.value = true
    } else {
        lastBuild.value = buildInfo.value
    }
}
function snackbarCloseHandler() {
    snackbar.value.active = false
    setTimeout(() => {
        snackbar.value = { ...snackbarDefault }
        if (error) {
            error.value = false
        }
    })
}
function messageHandler(message) {
    snackbar.value = {
        ...snackbarDefault,
        active: true,
        message,
    }
}
function reload() {
    const url = new URL(window.location.href)
    url.searchParams.set('cache', Date.now())
    window.location.href = url.toString()
}
async function doAuth(redirect) {
    await $keycloak.value.isLoaded
    authLoaded.value = true
    if ($keycloak.value.isAuthenticated) {
        auth.value = {
            token: $keycloak.value.token,
            preferred_username: $keycloak.value.tokenParsed.preferred_username,
        }
        if (redirect) {
            window.location.href = redirect
        }
    }
}
checkVersion()
versionCheckIntervalId.value = setInterval(checkVersion, 60000)
doAuth()
onMounted(() => {
    isIframed.value = window !== window.top
    if (isIframed.value) {
        document.querySelector('html').style.overflow = 'hidden'
    }
    route.value.path = window.location.pathname
    route.value.params = new URLSearchParams(window.location.search)

    if (/\/install/.test(route.value.path)) {
        doAuth()
    } else if (/\/signup/.test(route.value.path)) {
        signup()
    } else if (/\/signin/.test(route.value.path)) {
        signin()
    }

    setTimeout(() => isLoaded.value = true, 3000)
})
provide('isIframed', isIframed)
</script>
