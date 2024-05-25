/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../store'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import api from './api.plugin'
import clipboard from './clipboard.plugin'
import keycloakPlugin from './keycloak.plugin'

const {
    VITE_APP_KEYCLOAK_URL,
    VITE_APP_KEYCLOAK_REALM,
    VITE_APP_KEYCLOAK_CLIENT_ID,
} = import.meta.env

pinia.use(piniaPluginPersistedstate)

export function registerPlugins(app) {
    app.use(keycloakPlugin, {
        keycloakConfig: {
            url: VITE_APP_KEYCLOAK_URL,
            realm: VITE_APP_KEYCLOAK_REALM,
            clientId: VITE_APP_KEYCLOAK_CLIENT_ID
        },
        onLoad: 'check-sso',
        checkLoginIframe: true,
        silentCheckSsoRedirectUri: `${location.origin}/silent-check-sso.html`
    })
        .use(pinia)
        .use(vuetify)
        .use(api)
    app.provide('clipboard', clipboard)
}
