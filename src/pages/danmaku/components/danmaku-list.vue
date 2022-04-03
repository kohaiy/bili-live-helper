<template>
  <div class="danmaku-list" ref="list$" @scroll="handleListScroll">
    <div class="danmaku-list__inner">
      <danmaku-item v-for="msg in danmakuList" :key="msg.id" :data="msg" />
    </div>
    <div class="to-bottom" :class="{ 'is-hidden': isToBottom }" title="到底部" @click="handleToBottom">
      <span v-if="unreadTotal" class="unread">
        {{
          unreadTotal > 99 ? '∞' : unreadTotal
        }}
      </span>
      <icon-notification v-else/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, watch } from 'vue';
import { danmakuList, onDanmuMsg } from '../useDanmaku';
import DanmakuItem from './danmaku-item.vue';

const list$ = ref<HTMLDivElement>();
const isToBottom = ref(true);
const unreadTotal = ref(0);
let isAutoToBottom = false;

onDanmuMsg(() => {
  if (!isToBottom.value) unreadTotal.value += 1;
});

const scrollToBottom = () => {
  nextTick(() => {
    if (list$.value) {
      const { scrollHeight, offsetHeight } = list$.value;
      list$.value.scrollTo({
        top: scrollHeight - offsetHeight,
        behavior: 'smooth',
      });
    }
  });
}
const handleToBottom = () => {
  isToBottom.value = true;
  unreadTotal.value = 0;
  scrollToBottom();
};

watch(danmakuList, () => {
  if (isToBottom.value) {
    isAutoToBottom = true;
    scrollToBottom();
    setTimeout(() => {
      isAutoToBottom = false;
    }, 200);
  }
});

const handleListScroll = () => {
  if (isAutoToBottom) return;
  if (!list$.value) return;
  const { scrollHeight, scrollTop, clientHeight } = list$.value;
  isToBottom.value = scrollHeight - scrollTop - clientHeight <= 10;
  if (isToBottom.value) {
    unreadTotal.value = 0;
  }
};
</script>

<style lang="scss" scoped>
.danmaku-list {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;

  .danmaku-list__inner {
    padding: 10px 20px 40px;
  }

  .to-bottom {
    position: fixed;
    right: 20px;
    bottom: 10px;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    font-size: 16px;
    border-radius: 8px 8px 0 8px;
    background-color: #3a8ee6;
    cursor: pointer;
    opacity: 1;
    transform-origin: bottom right;
    transform: scale(1);
    transition: all 0.3s;

    &.is-hidden {
      transform: scale(0);
      opacity: 0;
    }

    .unread {
      font-size: 14px;
    }
  }
}
</style>