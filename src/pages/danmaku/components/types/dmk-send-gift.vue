<template>
  <div class="dmk-send-gift" :class="{ flash: !!numIncreate }">
    <span>感谢</span>
    <span class="uname">{{ data.uname }}</span>
    <span class="action">{{ data.gift?.action }}</span>
    <span class="gift-name">{{ data.gift?.giftName }}</span>
    <span class="gift-img">
      <span class="gift-img__inner" :class="`gift-${data.gift?.giftId}`"></span>
    </span>
    <span class="num">x{{ data.gift?.num }}</span>
    <div class="num-increate" :class="{ visible: !!numIncreate }">+{{
      numIncreate
    }}</div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, watch, ref, nextTick } from 'vue';
import { MsgBody } from '@/utils/danmaku.util';

const props = defineProps<{
  data: MsgBody;
}>();

const numIncreate = ref(0);
let timer: NodeJS.Timeout;
let cacheIncreate = 0;

watch(() => props.data.gift!.num, (nV, oV) => {
  numIncreate.value = 0;
  cacheIncreate += nV - oV;
  timer && clearTimeout(timer);
  timer = setTimeout(() => {
    numIncreate.value = cacheIncreate;
    cacheIncreate = 0;
  }, 200);
});

</script>

<style lang="scss" scoped>
.dmk-send-gift {
  position: relative;
  font-size: 12px;
  color: #999999;

  &.flash {
    animation: flash 2s alternate;

    @keyframes flash {
      0%, 50%, 100% {
        background-color: transparent;
      }
      25%, 75% {
        background-color: rgb(247, 181, 0, .2);
      }
    }
  }

  .uname {
    margin-left: 2px;
    color: #cccccc;
  }

  .action {
    margin: 0 2px;
  }

  .gift-name {
    font-size: 14px;
    font-weight: bold;
    color: #f7b500;
  }

  .gift-img {
    position: relative;
    display: inline-block;
    width: 30px;
    height: 20px;
    vertical-align: bottom;
    .gift-img__inner {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      display: block;
      height: 30px;
      background-position: center bottom;
      background-size: cover;
    }
  }

  .num {
    margin-left: 2px;
    color: #f7b500;
  }

  .num-increate {
    position: absolute;
    right: 10px;
    bottom: 0;
    font-size: 16px;
    color: #f7b500;
    opacity: 0;
    
    &.visible {
      animation: hint 3s alternate;

      @keyframes hint {
        0% {
          opacity: 0;
          transform: translateY(50%);
        }
        16% {
          opacity: 1;
          transform: translateY(0);
        }
        // 50% {
        //   opacity: 1;
        //   transform: translateY(-50%);
        // }
        100% {
          opacity: 0;
          transform: translateY(-100%);
        }
      }
    }
  }
}
</style>