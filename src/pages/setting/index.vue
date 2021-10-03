<template>
  <div class="setting">
    <el-tabs tab-position="left">
      <el-tab-pane>
        <template #label>
          <span>
            <i class="el-icon-setting"></i> 基础
          </span>
        </template>
        <basic-setting />
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
          <span>
            <i class="el-icon-headset"></i> 点歌
          </span>
        </template>
        <music-setting />
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
          <span>
            <i class="el-icon-s-operation"></i> 其他
          </span>
        </template>
        <other-setting />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import BasicSetting from "./components/basic-setting.vue";
import MusicSetting from "./components/music-setting.vue";
import OtherSetting from "./components/other-setting.vue";
</script>

<style lang="scss" scoped>
.setting {
  width: 100%;
  height: 100vh;
}
</style>

<style lang="scss">
.setting {
  .el-tabs {
    width: 100%;
    height: 100%;
    .el-tabs__content {
      height: 100%;
      .el-tab-pane {
        height: 100%;
      }
    }
  }
}
</style>