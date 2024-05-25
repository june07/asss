import { defineStore } from "pinia"

export const useAppStore = defineStore("app", {
    state: () => ({
        url: undefined,
        added: {}
    }),
    persist: true,
})
