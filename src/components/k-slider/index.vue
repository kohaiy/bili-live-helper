<template>
  <div class="k-slider">
    <div
      :class="`k-slider-track ${isMoving ? 'is-moving' : ''}`"
      @mousedown="handleMouseDown"
    >
      <div class="k-slider-bar" :style="barStyle"></div>
      <div class="k-slider-btn" :style="btnStyle"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, defineEmits, ref, withDefaults } from "vue";
const props = withDefaults(
  defineProps<{
    modelValue?: number;
    max?: number;
  }>(),
  {
    modelValue: 0,
    max: 100,
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: number): void;
}>();

const process = computed(() => ((props.modelValue ?? 0) * 100) / props.max);
const barStyle = computed(() => ({
  right: `${100 - process.value}%`,
}));
const btnStyle = computed(() => ({
  left: `${process.value}%`,
}));

const isMoving = ref(false);
const trackInfo = {
  x: 0,
  width: 0,
};
const handleMouseDown = (e: MouseEvent) => {
  const trackEl = e.currentTarget as HTMLElement;
  trackInfo.x = trackEl.getBoundingClientRect().x;
  trackInfo.width = trackEl.getBoundingClientRect().width;
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
  const percent = calcPercent(e.clientX);
  emit("update:modelValue", percent * props.max);
};

const handleMouseMove = (e: MouseEvent) => {
  isMoving.value = true;
  const percent = calcPercent(e.clientX);
  emit("update:modelValue", percent * props.max);
};

const handleMouseUp = () => {
  isMoving.value = false;
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
};

const calcPercent = (x: number) => {
  const percent = (x - trackInfo.x) / trackInfo.width;
  if (percent < 0) {
    return 0;
  } else if (percent > 1) {
    return 1;
  }
  return percent;
};
</script>

<style lang="scss">
.k-slider {
  --slider-height: 20px;
  --track-height: 10px;
  --btn-width: 12px;
  --btn-height: 14px;
  --track-bg-color: rgb(174, 174, 174);
  --bar-bg-color: rgb(84, 174, 252);
  --btn-bg-color: rgb(13, 105, 244);
  position: relative;
  width: 100%;
  height: var(--slider-height);
  overflow: visible;
  .k-slider-track {
    position: absolute;
    left: 0;
    right: 0;
    /* top: math.div($slider-height - $track-height, 2); */
    top: calc((var(--slider-height) - var(--track-height)) / 2);
    height: var(--track-height);
    cursor: pointer;
    user-select: none;
    background-color: var(--track-bg-color);
    .k-slider-bar,
    .k-slider-btn {
      position: absolute;
      transition: all 0.3s;
    }
    .k-slider-bar {
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background-color: var(--bar-bg-color);
    }
    .k-slider-btn {
      position: absolute;
      z-index: 100;
      top: calc((var(--track-height) - var(--btn-height)) / 2);
      width: var(--btn-width);
      height: var(--btn-height);
      transform: translateX(-50%);
      background-color: var(--btn-bg-color);
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
      -webkit-app-region: no-drag;
    }
    &.is-moving {
      .k-slider-bar,
      .k-slider-btn {
        transition-duration: 0ms;
      }
    }
  }
}
</style>
