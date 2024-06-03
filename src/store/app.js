import { defineStore } from "pinia"

export const useAppStore = defineStore("app", {
    state: () => ({
        url: 'https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj/reviews',
        appIdsToUUIDs: {},
        jobs: {},
        faq: {},
    }),
    persist: true,
})
