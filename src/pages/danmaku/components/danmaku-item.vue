<template>
  <label class="danmaku-item" :class="{ 'is-operating': isOperating }" @contextmenu="handleRightClick">
    <component :is="danmakuType" :data="data" v-if="danmakuType" />
    <input type="checkbox" />
    <div class="time">{{ mapTime(data.time) }}</div>
  </label>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { MsgBody } from '@/utils/danmaku.util';
import DmkInteractWord from './types/dmk-interact-word.vue';
import DmkDanmuMsg from './types/dmk-danmu-msg.vue';
import DmkSendGift from './types/dmk-send-gift.vue';
import IpcRendererUtil from '@/utils/ipc-renderer.util';
import { sendNotify } from '@/utils/notify.util';

const props = defineProps<{
  data: MsgBody;
}>();

const isOperating = ref(false);

const danmakuType = computed(() => {
  const typeMap = {
    ENTER_ROOM: DmkInteractWord,
    FOLLOW_ROOM: DmkInteractWord,
    SHARE_ROOM: DmkInteractWord,
    DANMU_MSG: DmkDanmuMsg,
    SEND_GIFT: DmkSendGift,
  };
  if (Object.keys(typeMap).includes(props.data.type)) {
    return typeMap[props.data.type as keyof typeof typeMap];
  }
  return null;
});

const handleRightClick = async () => {
  const menu = [
    {
      label: '访问TA的空间', key: 'space', callback: () => {
        IpcRendererUtil.send('open-url', 'https://space.bilibili.com/' + props.data.uid)
      }
    },
    { label: '特别关注(TODO)', key: 'follow', callback: () => { } },
    { label: '拉黑(TODO)', key: 'black', callback: () => { } },
    {
      label: 'DEBUG', key: 'debug', callback: () => {
        console.log('------DEBUG-------');
        console.log({ ...props.data });
        console.log('------DEBUG-------');
        sendNotify({
          content: `## 测试通知
- 测试通知
- 测试通知`,
        })
      }
    },
  ];
  isOperating.value = true;
  const res: any = await IpcRendererUtil.send('show-context-menu', {
    menu,
    data: props.data,
  });
  isOperating.value = false;
  if (res?.key) {
    menu.find(item => item.key === res.key)?.callback?.();
  }
};

const mapTime = (time: number) => new Date(time).toLocaleTimeString();
</script>

<style lang="scss" scoped>
.danmaku-item {
  position: relative;
  display: block;

  +.danmaku-item {
    margin-top: 8px;
  }

  &.is-operating {
    user-select: none;
    background: linear-gradient(to right, rgba(255, 255, 0, .2), rgba(0, 0, 0, 0));
  }

  &:empty {
    margin-top: 0;
  }

  .time {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.2);
    opacity: 0;
    pointer-events: none;
  }

  input[type='checkbox'] {
    display: none;

    &:checked {
      +.time {
        opacity: 1;
      }
    }
  }
}
</style>
