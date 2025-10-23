import { createApp } from 'vue'
import {
  Quasar,
  Notify,
  QForm,
  QCard,
  QCardSection,    
  QCardActions,     
  QPage,           
  QPageContainer,
  QToolbarTitle,
  QToolbar,
  QFooter,
  QLayout,
  QAvatar,
  QHeader,
  QBanner,
  QSelect,
  QInput,
  QIcon,
  QBtn,
  QDialog,
  QSpinnerIos,
  QSpinner,
  QBadge,
  QSeparator,
} from 'quasar'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
import 'quasar/dist/quasar.css'
import App from './App.vue'
import router from './router/routes.js'

const myApp = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

myApp.use(router)
myApp.use(pinia)

myApp.use(Quasar, {
  components: {
    QForm,
    QCard,
    QCardSection,  
    QCardActions,    
    QPage,           
    QPageContainer,
    QToolbarTitle,
    QToolbar,
    QFooter,
    QLayout,
    QAvatar,
    QHeader,
  QBanner,
    QSelect,
    QInput,
    QIcon,
    QBtn,
    QDialog,
    QSpinnerIos,
    QSpinner,
    QBadge,
    QSeparator,
  },
  plugins: { Notify },
})

myApp.mount('#app')