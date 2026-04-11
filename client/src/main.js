import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';

import MyPreset from '@/layout/custom';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import { createPinia } from 'pinia';
import { useUserStore } from '@/stores/user';

import '@/assets/tailwind.css';
import '@/assets/styles.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(PrimeVue, {
    theme: {
        preset: MyPreset
    }
});
app.use(ToastService);
app.use(ConfirmationService);

const userStore = useUserStore();
userStore.loadUser();

app.mount('#app');
