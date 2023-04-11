<template>
  <div class="danmaku-header">
    <!-- 右侧操作按钮 -->
    <div class="operates">
      <div
        class="btn"
        v-if="danmakuList.length"
        title="清屏"
        @click="handleClearDanmaku"
      >
        <icon-loop />
      </div>
      <div
        class="btn on-top"
        :class="{ 'is-active': isOnTop }"
        title="置顶"
        @click="handleOnTopChange"
      >
        <icon-pushpin />
      </div>
      <div
        class="btn lock"
        :class="{ 'is-active': isLocked }"
        title="锁定"
        @click="handleLockChange"
      >
        <icon-lock v-if="isLocked" />
        <icon-unlock v-else />
      </div>
      <div class="btn close" title="关闭" @click="handleClose">
        <icon-close-circle />
      </div>
    </div>
    <!-- up 信息统计 -->
    <div class="up-stat-info">
      <span class="stat-item" v-for="item in statList" :key="item.key">
        <span class="label">{{ item.label }}</span>
        <span class="value">{{ item.value }}</span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, ref, watchEffect } from "vue";
import { getCurrentWindow } from "@electron/remote";
import {
  popularTotal,
  followerTotal,
  danmakuList,
  watchedTotal,
} from "../useDanmaku";
import BiliApi from "@/apis/bili.api";
import { config } from "@/utils/config";

const props = defineProps<{
  isLocked: boolean;
}>();

const emit = defineEmits<{
  (event: "update:isLocked", isLocked: boolean): void;
}>();

const statMap: Record<string, Ref<number>> = {
  popularTotal,
  followerTotal,
  watchedTotal,
};

const defaultHeaderStats: {
  key: string;
  label: string;
  show: boolean;
}[] = [
  { key: "watchedTotal", label: "看过：", show: true },
  { key: "popularTotal", label: "人气：", show: true },
  { key: "followerTotal", label: "粉丝：", show: true },
];

const statList = computed(() => {
  return (config.value.basic?.headerStats ?? defaultHeaderStats)
    .filter(({ show }) => show)
    .map(({ key, label }) => ({ value: statMap[key], key, label }));
});

const isOnTop = ref(true);

const getFollower = async () => {
  if (config.value.basic?.uid) {
    const { follower } = await BiliApi.getUpInfo(config.value.basic?.uid);
    followerTotal.value = follower;
  }
};
watchEffect(() => getFollower());
setInterval(() => getFollower(), 60 * 1000);

const handleClearDanmaku = () => {
  danmakuList.value = [];
};

const handleClose = () => {
  getCurrentWindow().close();
};
const handleOnTopChange = () => {
  isOnTop.value = !isOnTop.value;
  getCurrentWindow().setAlwaysOnTop(isOnTop.value);
};
const handleLockChange = () => {
  emit("update:isLocked", !props.isLocked);
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
    height: 40px;
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
