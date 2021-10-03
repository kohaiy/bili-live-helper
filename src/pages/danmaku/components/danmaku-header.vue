<template>
  <div class="danmaku-header">
    <!-- 右侧操作按钮 -->
    <div class="operates">
      <div class="btn" v-if="danmakuList.length" title="清屏" @click="handleClearDanmuku">
        <i class="el-icon-toilet-paper"></i>
      </div>
      <div
        class="btn on-top"
        :class="{ 'is-active': isOnTop }"
        title="置顶"
        @click="handleOnTopChange"
      >
        <i class="el-icon-aim"></i>
      </div>
      <div class="btn lock" :class="{ 'is-active': isLocked }" title="锁定" @click="handleLockChange">
        <i :class="`el-icon-${isLocked ? 'lock' : 'unlock'}`"></i>
      </div>
      <div class="btn close" title="关闭" @click="handleClose">
        <i class="el-icon-circle-close"></i>
      </div>
    </div>
    <!-- up 信息统计 -->
    <div class="up-stat-info">
      <span class="stat-item">
        <span class="label">人气：</span>
        <span class="value">{{ popularTotal }}</span>
      </span>
      <span class="stat-item">
        <span class="label">粉丝：</span>
        <span class="value">{{ followerTotal }}</span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, watchEffect } from 'vue';
import { remote } from 'electron';
import { popularTotal, followerTotal, danmakuList } from '../useDanmaku';
import BiliApi from '@/apis/bili.api';
import { config } from '@/utils/config';

const props = defineProps<{
  isLocked: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:isLocked', isLocked: boolean): void;
}>();

const isOnTop = ref(true);

const getFollower = async () => {
  if (config.value.basic?.uid) {
    const { follower } = await BiliApi.getUpInfo(config.value.basic?.uid);
    followerTotal.value = follower;
  }
};
watchEffect(() => getFollower());
setInterval(() => getFollower(), 60 * 1000);

const handleClearDanmuku = () => {
  danmakuList.value = [];
};

const handleClose = () => {
  remote.getCurrentWindow().close();
}
const handleOnTopChange = () => {
  isOnTop.value = !isOnTop.value;
  remote.getCurrentWindow().setAlwaysOnTop(isOnTop.value);
}
const handleLockChange = () => {
  emit('update:isLocked', !props.isLocked);
};
</script>

<style lang="scss" scoped>
.danmaku-header {
  -webkit-app-region: drag;
  .operates {
    position: absolute;
    top: 10px;
    right: 20px;
    display: flex;
    align-items: center;
    -webkit-app-region: no-drag;

    .btn {
      font-size: 18px;
      color: #cccccc;
      cursor: pointer;

      &:hover {
        color: #ffffff;
      }

      &.is-active {
        color: #5aacea;
      }

      + .btn {
        margin-left: 10px;
      }

      &.close {
        color: #f56565;
      }
    }
  }

  .up-stat-info {
    padding: 10px 20px;
    border-bottom: 1px solid #333333;
    user-select: none;

    .stat-item {
      + .stat-item {
        margin-left: 10px;
      }

      .label {
        font-size: 12px;
        color: #999999;
      }

      .value {
        font-size: 16px;
        color: #ffffff;
      }
    }
  }
}
</style>