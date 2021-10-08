import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./theme/common.scss";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import IpcRendererUtil from "./utils/ipc-renderer.util";
import useConfig from "./utils/config";

IpcRendererUtil.initial();

useConfig();

createApp(App)
  .use(ElementPlus, { size: "mini" })
  .use(store)
  .use(router)
  .mount("#app");
