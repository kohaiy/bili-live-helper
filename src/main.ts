import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./theme/common.scss";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import IpcRendererUtil from "./utils/ipc-renderer.util";
import useConfig from "./utils/config";
import AsyncQueue from '@ktools/async-queue';

const queue = AsyncQueue.create();
const sleep = (t: number) => new Promise(r => setTimeout(r, t));
queue.push(async () => {
  console.log(1);
  await sleep(10000);
  return 1;
});
queue.push(async () => {
  console.log(2);
  await sleep(1000);
  return 2;
});
queue.push(async () => {
  console.log(3);
  await sleep(1000);
  return 3;
});
console.log(queue);


IpcRendererUtil.initial();

useConfig();

createApp(App)
  .use(ElementPlus, { size: "mini" })
  .use(store)
  .use(router)
  .mount("#app");
