<template>
  <div class="setting-container">
    <div class="setting-header" v-if="title">
      <h2 class="setting-title">{{ title }}</h2>
    </div>
    <slot />
    <div class="setting-footer">
      <a-button type="primary" @click="$emit('confirm')" v-if="!hideConfirmBtn">保存</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

defineProps<{
  title?: string;
  hideConfirmBtn?: boolean;
}>();
</script>

<style lang="scss" scoped>
.setting-container {
  position: relative;
  padding: 20px 20px 40px 10px;

  .setting-header {
    margin-bottom: 20px;

    .setting-title {
      display: inline-block;
      padding-right: 20px;
      font-size: 18px;
      color: #303133;
      border-bottom: 2px solid #409eff;
    }
  }

  .setting-footer {
    position: sticky;
    bottom: 0;
    right: 0;
    left: 0;
    margin-top: 20px;
    padding: 10px 0;
    text-align: right;
    background-color: #fff;
  }
}
</style>