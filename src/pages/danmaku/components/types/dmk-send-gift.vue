<template>
  <div class="dmk-send-gift">
    <span>感谢</span>
    <span class="uname">{{ data.uname }}</span>
    <span class="action">{{ data.gift?.action }}</span>
    <span class="gift-name">{{ data.gift?.giftName }}</span>
    <span class="gift-img">
      <span class="gift-img__inner" :class="`gift-${data.gift?.giftId}`"></span>
    </span>
    <span class="num">x{{ data.gift?.num }}</span>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import { MsgBody } from '@/utils/danmaku.util';

defineProps<{
  data: MsgBody;
}>();
</script>

<style lang="scss" scoped>
.dmk-send-gift {
  font-size: 12px;
  color: #999999;

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
}
</style>