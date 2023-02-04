import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: "/danmaku",
        name: "Danmaku",
        meta: {
            title: "弹幕姬"
        },
        component: () => import('@/pages/danmaku/index.vue')
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

export default routes;
