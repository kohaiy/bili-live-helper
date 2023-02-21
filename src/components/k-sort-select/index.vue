<template>
    <div></div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
    modelValue: { key: string; label: string; }[];
    options: { key: string; label: string; }[];
}>();

// const uncheck = computed(() => {
//     const checkedKeys = props.modelValue.map(({ key }) => key);
//     return props.options.filter()
// })
</script>