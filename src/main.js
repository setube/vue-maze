import App from './App.vue'
import { createApp } from 'vue'
import '@arco-design/web-vue/dist/arco.css';

const app = createApp(App);

app.config.productionTip = false;

app.mount('#app');

