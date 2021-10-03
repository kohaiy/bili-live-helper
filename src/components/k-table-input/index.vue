<template>
  <div class="k-table-input">
    <el-input placeholder="Press Enter to add..."/>
    <el-table :data="modelValue">
      <el-table-column prop="id" label="Date"/>
      <el-table-column prop="name" label="Name"/>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref, nextTick } from 'vue';

const props = defineProps<{
  modelValue: Record<string, any>[];
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', payload: any[]): void;
}>();
</script>