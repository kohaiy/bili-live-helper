<template>
  <label class="danmaku-item" @click.right="handleRightClick">
    <component :is="danmakuType" :data="data" />
    <input type="checkbox" />
    <div class="time">{{ mapTime(data.time) }}</div>
  </label>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue';
import { MsgBody } from '@/utils/danmaku.util';
import DmkInteractWord from './types/dmk-interact-word.vue';
import DmkDanmuMsg from './types/dmk-danmu-msg.vue';
import DmkSendGift from './types/dmk-send-gift.vue';

const props = defineProps<{
  data: MsgBody;
}>();

const danmakuType = computed(() => {
  const typeMap = {
    ENTER_ROOM: DmkInteractWord,
    FOLLOW_ROOM: DmkInteractWord,
    SHARE_ROOM: DmkInteractWord,
    DANMU_MSG: DmkDanmuMsg,
    SEND_GIFT: DmkSendGift,
  };
  if (Object.keys(typeMap).includes(props.data.type)) {
    return typeMap[props.data.type as (keyof typeof typeMap)];
  }
  return null;
});

const handleRightClick = () => {
  console.log(props.data);
};

const mapTime = (time: number) => new Date(time).toLocaleTimeString();

</script>

<style lang="scss" scoped>
.danmaku-item {
  position: relative;
  display: block;
  + .danmaku-item {
    margin-top: 8px;
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

  input[type="checkbox"] {
    display: none;
    &:checked {
      + .time {
        opacity: 1;
      }
    }
  }
}
</style>