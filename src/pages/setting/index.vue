<template>
  <div class="setting">
    <a-tabs position="left" type="capsule">
      <a-tab-pane key="1">
        <template #title>
          <span>
            <icon-settings /> 基础
          </span>
        </template>
        <basic-setting />
      </a-tab-pane>
      <a-tab-pane key="2">
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
      <a-tab-pane key="3">
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
import BasicSetting from "./components/basic-setting.vue";
import MusicSetting from "./components/music-setting.vue";
import OtherSetting from "./components/other-setting.vue";
import biliAccount from './components/bili-account.vue';

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