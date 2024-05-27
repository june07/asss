import { defineStore } from "pinia"

export const useAppStore = defineStore("app", {
    state: () => ({
        url: undefined,
        added: {},
        jobs: {}
    }),
    persist: true,
})
