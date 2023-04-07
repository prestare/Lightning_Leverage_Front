import { createApp } from 'vue'

import App from './App.vue'
import './theme/index.scss';
import './assets/main.css'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import Web3 from 'web3'
const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')
app.config.globalProperties.Web3 = Web3
