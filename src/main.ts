import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';
import "./style.css"
import router from "./router";
import App from './App.vue'
import './samples/node-api'
import IpcRendererUtil from './utils/ipc-renderer.util';
import useConfig from './utils/config';

IpcRendererUtil.initial();
useConfig();

createApp(App)
  .use(router)
  .use(ArcoVue, {})
  .use(ArcoVueIcon)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
