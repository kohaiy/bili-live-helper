// import { createApp } from "vue";
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';
import "./theme/common.scss";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import IpcRendererUtil from "./utils/ipc-renderer.util";
import useConfig from "./utils/config";

IpcRendererUtil.initial();

useConfig();

createApp(App)
  .use(ArcoVue, {})
  .use(ArcoVueIcon)
  .use(store)
  .use(router)
  .mount("#app");
