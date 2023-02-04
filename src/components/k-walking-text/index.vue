<template>
  <div
    ref="el"
    class="k-walking-text"
    :style="
      `--width: ${containerWidth}px; --scroll-width: ${scrollWidth}px; --scroll-left: ${scrollLeft}px;`
    "
  >
    <!-- <div style="line-height: 0; color: transparent;"><slot /></div> -->
    <div class="k-walking-text__inner">
      <slot v-if="$slots.default" />
      <template v-else>{{ text }}</template>
    </div>
  </div>
</template>
<!-- TODO 滚动有点问题 -->
<script lang="ts" setup>
import { ref, watch, watchEffect, defineProps } from "vue";

const props = defineProps<{
  text?: string;
}>();

const el = ref<HTMLDivElement>();
const containerWidth = ref(0);
const scrollWidth = ref(0);
const scrollLeft = ref(0);

const updateScrollLeft = () => {
  let delta = containerWidth.value - scrollWidth.value;
  if (delta < 0) {
    // delta -= 32;
  } else {
    delta = 0;
  }
  scrollLeft.value = scrollLeft.value === 0 ? delta : 0;
};

const updateWidth = () => {
  if (el.value) {
    scrollWidth.value = el.value.scrollWidth;
    containerWidth.value = el.value.clientWidth;
    updateScrollLeft();
  }
};

watchEffect((onInvalidate) => {
  const timer = setInterval(() => {
    updateScrollLeft();
  }, 5000);
  onInvalidate(() => {
    clearInterval(timer);
  });
});

watch(el, updateWidth);
watch(() => props.text, updateWidth);
// onMounted(updateWidth);
</script>

<style lang="scss">
.k-walking-text {
  width: 100%;
  overflow: hidden;

  .k-walking-text__inner {
    position: relative;
    display: inline-block;
    min-width: 100%;
    white-space: nowrap;
    /* width: var(--scroll-width); */
    /* animation: walking 5s ease-in-out infinite; */
    transition: all 5s;
    transform: translateX(calc(var(--scroll-left)));

    @keyframes walking {
      0% {
        left: 0;
        transform: translateX(0);
      }
      50% {
        left: calc(var(--width));
        transform: translateX(-100%);
        color: var(--color, #000);
      }
      100% {
        left: 0;
        transform: translateX(0);
      }
    }
  }
}
</style>
