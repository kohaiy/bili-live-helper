import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Danmaku from "@/pages/danmaku/index.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/danmaku",
    name: "Danmaku",
    meta: {
      title: "弹幕姬"
    },
    component: Danmaku
  },
  {
    path: "/music",
    name: "Music",
    meta: {
      title: "点歌姬"
    },
    component: () => import("@/pages/music/index.vue")
  },
  {
    path: "/setting",
    name: "Setting",
    meta: {
      title: "控制面板"
    },
    component: () => import("@/pages/setting/index.vue")
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string)
    ? `bili直播助手 - ${to.meta.title as string}`
    : "bili直播助手";
  next();
});

export default router;
