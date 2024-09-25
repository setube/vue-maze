import App from './App.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useMainStore } from '@/plugins/store';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

const store = useMainStore();
app.config.globalProperties.$store = store;

app.mount('#app');