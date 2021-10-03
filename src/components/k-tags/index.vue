<template>
  <div class="k-tags">
    <el-input v-model="inputValue" @keyup.enter="handleInputConfirm" placeholder="按 ENTER 添加"></el-input>
    <el-tag
      :key="tag"
      v-for="tag in modelValue"
      closable
      :disable-transitions="false"
      @close="handleRemove(tag)"
    >{{ tag[labelKey] }}</el-tag>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref, withDefaults } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: any[];
  labelKey?: string;
}>(), {
  labelKey: 'name'
});

const emit = defineEmits<{
  (event: 'update:modelValue', payload: any[]): void;
  (event: 'add', payload: string): void;
}>();
const inputValue = ref('');

const handleRemove = (item: any) => {
  emit('update:modelValue', props.modelValue.filter(it => it !== item));
};

const handleInputConfirm = () => {
  if (inputValue.value) {
    emit('update:modelValue', [...props.modelValue, inputValue.value]);
    emit('add', inputValue.value);
    inputValue.value = '';
  }
};
</script>