<template>
  <Draggable
    class="sortable-tag"
    :model-value="modelValue"
    @update:modelValue="handleUpdate($event)"
    handle=".handle"
    item-key="id"
  >
    <template #item="{ element }">
      <div class="sortable-tag-item" :class="{ 'is-show': element.show }">
        <div class="handle"><icon-drag-dot /></div>
        <div class="tag" @click="handleChangeLabel(element)">
          {{ element.label }}{{ `<${textMap[element.key]}>` }}
        </div>
        <div class="icon-show" @click="handleShowChange(element)">
          <icon-eye v-if="element.show" />
          <icon-eye-invisible v-else />
        </div>
      </div>
    </template>
  </Draggable>
</template>
<script lang="ts" setup>
import { Input, Modal } from "@arco-design/web-vue";
import { h, ref } from "vue";
import Draggable from "vuedraggable";

const textMap: Record<string, string> = {
  watchedTotal: "看过",
  popularTotal: "人气",
  followerTotal: "粉丝",
};

const props = defineProps<{
  modelValue: any[];
}>();

const emits = defineEmits<{
  (event: "update:modelValue", val: any): void;
}>();

const handleUpdate = (val: any) => {
  emits("update:modelValue", val);
};

const handleShowChange = (item: any) => {
  item.show = !item.show;
  emits("update:modelValue", props.modelValue);
};

let labelValue = "";
const ModalContent = () => ({
  setup() {
    const modelValue = ref(labelValue);

    return () =>
      h("div", {}, [
        h(Input, {
          modelValue: modelValue.value,
          "onUpdate:modelValue": (val: string) => {
            modelValue.value = val;
            labelValue = val;
          },
        }),
      ]);
  },
});
const handleChangeLabel = (item: any) => {
  labelValue = item.label;
  Modal.info({
    title: "修改标签文字",
    content: () => h(ModalContent()),
    onOk: () => {
      item.label = labelValue;
      emits("update:modelValue", props.modelValue);
    },
  });
};
</script>

<style lang="scss" scoped>
.sortable-tag {
  margin: -6px;
  .sortable-tag-item {
    display: inline-flex;
    margin: 6px;
    line-height: 24px;
    padding: 0 8px;
    border-radius: 4px;
    font-size: 12px;
    color: var(--color-neutral-4);
    border: 1px solid var(--color-neutral-3);
    background-color: var(--color-neutral-2);

    &.is-show {
      color: rgb(var(--arcoblue-6));
      border: 1px solid rgb(var(--arcoblue-6));
      background-color: rgb(var(--arcoblue-1));
    }

    .handle {
      margin-right: 4px;
      font-size: 16px;
      cursor: move;
    }

    .icon-show {
      margin-left: 4px;
      font-size: 16px;
      cursor: pointer;
    }
  }
}
</style>
