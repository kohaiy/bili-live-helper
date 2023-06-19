<template>
  <div class="setting" v-if="isLoaded">
    <a-tabs position="left" type="capsule" destroy-on-hide>
      <a-tab-pane key="basic">
        <template #title>
          <span>
            <icon-settings /> 基础
          </span>
        </template>
        <basic-setting />
      </a-tab-pane>
      <a-tab-pane key="danmaku">
        <template #title>
          <span>
            <icon-align-left /> 弹幕
          </span>
        </template>
        <danmaku-setting />
      </a-tab-pane>
      <a-tab-pane key="music">
        <template #title>
          <span>
            <icon-music /> 点歌
          </span>
        </template>
        <music-setting />
      </a-tab-pane>
      <a-tab-pane key="account">
        <template #title>
          <span>
            <icon-user /> 账号
          </span>
        </template>
        <bili-account />
      </a-tab-pane>
      <a-tab-pane key="auto-reply">
        <template #title>
          <span>
            <icon-message /> 回复
          </span>
        </template>
        <auto-reply-setting />
      </a-tab-pane>
      <a-tab-pane key="others">
        <template #title>
          <span>
            <icon-apps /> 其他
          </span>
        </template>
        <other-setting />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import BasicSetting from "./pages/basic-setting.vue";
import DanmakuSetting from './pages/danmaku-setting.vue';
import MusicSetting from "./pages/music-setting.vue";
import OtherSetting from "./pages/other-setting.vue";
import biliAccount from './pages/bili-account.vue';
import { isLoaded } from '@/utils/config';
import AutoReplySetting from './pages/auto-reply-setting.vue';

</script>

<style lang="scss" scoped>
.setting {
  width: 100%;
  height: 100vh;
}
</style>

<style lang="scss">
.setting {
  .arco-tabs {
    width: 100%;
    height: 100%;

    .arco-tabs-content-list {
      height: 100%;

      .arco-tabs-pane {
        height: 100%;
        overflow: auto;
      }
    }

    .arco-tabs-nav-type-capsule .arco-tabs-nav-tab {
      justify-content: flex-start;

      .arco-tabs-nav-tab-list {
        min-height: 100%;
      }
    }
  }
}
</style>