<template>
    <div>
    </div>
</template>
<script lang="ts" setup>
import { ipcRenderer } from "electron";
import { Notification } from '@arco-design/web-vue';
import { h } from 'vue';

ipcRenderer.on('notify', (event, payload) => {
    const type: 'info' | 'error' | 'warning' | 'success' = payload.type || 'info';
    const duration = payload.duration ?? (type === 'error' ? 7000 : 5000);

    Notification[type]?.({
        ...payload,
        position: "topLeft",
        content: () => h('div', {},
            payload.content.split('\n').map((msg: string) => h('p', {}, msg))),
        duration,
    })
});

</script>