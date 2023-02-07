<template>
    <span class="danmaku-rich-msg">
        <span v-for="(slice, index) in richText" :key="index">
            <img :src="slice.url" alt="" v-if="slice.url">
            <template v-else>{{ slice }}</template>
        </span>
    </span>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
    msg: string;
    emotes: Record<string, {
        width: number;
        height: number;
        url: string;
    }>;
}>();

const richText = computed(() => {
    // 对 msg 按 [] 进行切割
    return props.msg.replace(/(\[[^\]]+\])/g, '\n$1\n').trim().split('\n')
        .map(msg => props.emotes[msg] || msg);
})
</script>

<style lang="scss" scoped>
.danmaku-rich-msg {
    img {
        max-width: 24px;
        max-height: 24px;
        vertical-align: bottom;
    }
}
</style>