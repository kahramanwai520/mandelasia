import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/loader.css'
import VueTelInput from 'vue-tel-input';
import 'vue-tel-input/vue-tel-input.css';

createApp(App).use(VueTelInput).use(router).mount('#app')
