import { defineStore } from "pinia"

export const useAppStore = defineStore("app", {
    state: () => ({
        url: undefined,
        appIdsToUUIDs: {},
        jobs: {}
    }),
    persist: true,
})
