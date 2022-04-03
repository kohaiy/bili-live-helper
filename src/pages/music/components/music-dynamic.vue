<template>
  <div class="music-dynamic" :style="`--line-height: ${LINE_HEIGHT}px;`">
    <div class="music-dynamic__inner" :style="innerStyle">
      <div
        class="music-dynamic-item"
        v-for="(item, index) in dynamicList"
        :key="index"
      >
        <KWalkingText :text="item" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from "vue";
import { nextSong, songList } from "../useMusic";
import KWalkingText from "@/components/k-walking-text/index.vue";
const LINE_HEIGHT = 20;

const currentIndex = ref(0);
const isRestart = ref(false);

const dynamicList = computed(() => {
  const list = [
    "-",
  ];
  if (songList.value.length) {
    list.push(`播放列表 ${songList.value.length} 首`);
  } else {
    list.push("播放列表为空");
  }
  if (nextSong.value) {
    const { name, artistsString } = nextSong.value;
    list.push(`下一首 ${name} - ${artistsString}`);
  }
  list.push("-");
  return list;
});

watchEffect((onInvalidate) => {
  const timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % dynamicList.value.length;
    if (currentIndex.value === 0) {
      isRestart.value = true;
      setTimeout(() => {
        isRestart.value = false;
      }, 500);
    }
  }, 5000);
  onInvalidate(() => {
    clearInterval(timer);
  });
});

const innerStyle = computed(() => {
  const index = currentIndex.value;
  return {
    transform: `translateY(-${index * LINE_HEIGHT}px)`,
    transitionDuration: isRestart.value ? "0s" : "",
  };
});
</script>

<style lang="scss">
.music-dynamic {
  margin-top: 4px;
  margin-left: -24px;
  height: var(--line-height);
  font-size: 12px;
  color: rgb(64, 172, 254);
  overflow: hidden;

  .music-dynamic__inner {
    transition: all 0.5s;

    .music-dynamic-item {
      height: var(--line-height);
      line-height: var(--line-height);
      text-align: center;
      word-break: keep-all;
      white-space: nowrap;
    }
  }
}
</style>
