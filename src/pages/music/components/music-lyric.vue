<template>
  <div class="music-lyric" :style="`--line-height: ${LINE_HEIGHT}px;`">
    <div class="music-lyric__inner" :style="innerStyle">
      <div class="music-lyric-item" v-for="item in lyric" :key="item.time">
        {{ item.text }}
      </div>
      <div class="music-lyric-item" v-if="!lyric.length">
        暂无歌词
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, computed, watch, ref } from "vue";

const LINE_HEIGHT = 20;

const props = defineProps<{
  lyric: { time: number; text: string }[];
  currentTime: number;
}>();

const isRestart = ref(false);

watch(
  () => props.lyric,
  () => {
    isRestart.value = true;

    setTimeout(() => {
      isRestart.value = false;
    }, 500);
  }
);

const innerStyle = computed(() => {
  const { lyric, currentTime } = props;
  let index = lyric.findIndex(({ time }) => time > currentTime);
  if (index === -1) {
    index = lyric.length - 1;
  } else if (index > 0) {
    index -= 1;
  } else {
    index = 0;
  }
  return {
    transform: `translateY(-${index * LINE_HEIGHT}px)`,
    transitionDuration: isRestart.value ? "0s" : "",
  };
});
</script>

<style lang="scss" scoped>
.music-lyric {
  position: relative;
  height: calc(var(--line-height) * 2);
  /* padding-top: calc(var(--line-height) * 1); */
  text-align: center;
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: block;
    height: calc(var(--line-height) * 1);
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.5) 10%,
      rgba(255, 255, 255, 1) 100%
    );
  }
  .music-lyric__inner {
    /* position: relative; */
    /* z-index: -1; */
    transition: all 0.8s;
  }
  .music-lyric-item {
    line-height: var(--line-height);
    word-break: keep-all;
    white-space: nowrap;
  }
}
</style>
