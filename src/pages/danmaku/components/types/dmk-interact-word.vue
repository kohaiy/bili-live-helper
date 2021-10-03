<template>
  <div class="dmk-interact-word">
    <span v-if="data.type === 'ENTER_ROOM'" class="enter">欢迎 {{ data.uname }} 进入直播间</span>
    <span v-else-if="data.type === 'FOLLOW_ROOM'" class="follow">感谢 {{ data.uname }} 的关注</span>
    <span v-else-if="data.type === 'SHARE_ROOM'" class="follow">感谢 {{ data.uname }} 分享直播间</span>
  </div>
</template>

<script lang="ts" setup>
import { MsgBody } from '@/utils/danmaku.util';
import { defineProps } from 'vue';

defineProps<{
  data: MsgBody;
}>();
</script>

<style lang="scss" scoped>
.dmk-interact-word {
  font-size: 12px;
  color: #999999;

  .follow {
    color: #f7b500;
  }
}
</style>
