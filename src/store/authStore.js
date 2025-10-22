import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
    const token = ref("")
    const user = ref(null)
    const isAuthenticated = ref(false)

    // Actions
    function setToken(tk) {
        token.value = tk
        isAuthenticated.value = !!tk
    }

    function setUser(userData) {
        user.value = userData
    }

    function setAuth(tokenValue, userData) {
        setToken(tokenValue)
        setUser(userData)
    }

    function clearAuth() {
        token.value = ""
        user.value = null
        isAuthenticated.value = false
    }

    return {
        token, isAuthenticated, user, setToken, setUser, setAuth, clearAuth,
    }
}, {
    persist: true
})