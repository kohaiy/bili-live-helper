<template>
  <setting-container title="基础设置" @confirm="handleSave">
    <div class="basic-setting">
      <a-form :model="form" :rules="rules" ref="form$" layout="vertical" label-suffix=" :">
        <a-form-item label="UP UID" field="uid" :rules="rules.uid">
          <a-auto-complete v-model="form.uid" :data="uidList" :filter-option="handleUidQuery" @select="handleUidSelect">
            <template #option="{ data }">
              <div>{{ data.label }}({{ data.value }})</div>
            </template>
          </a-auto-complete>
        </a-form-item>
        <a-form-item label="弹幕列表上限">
          <a-input v-model="form.msgsLimit" />
        </a-form-item>
        <a-form-item label="自动清除入场提示">
          <a-row align="center">
            <a-col :span="12">
              <a-switch v-model="form.autoClearEnter" />
            </a-col>
            <a-col :span="12" v-show="form.autoClearEnter">
              <a-input v-model="form.clearEnterBefore">
                <template #append>秒前</template>
              </a-input>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="合并相同礼物">
          <a-row align="center">
            <a-col :span="12">
              <a-switch v-model="form.comboSameGift" />
            </a-col>
            <a-col :span="12" v-show="form.comboSameGift">
              <a-input v-model="form.comboGiftIn">
                <template #append>秒内</template>
              </a-input>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="语音播报">
          <a-switch v-model="form.broadcast" />
        </a-form-item>
      </a-form>
    </div>
  </setting-container>
</template>

<script lang="ts" setup>
import { Config, config, saveConfig } from '@/utils/config';
import { FilterOption, Form, Message } from '@arco-design/web-vue';
import { computed, ref } from 'vue';
import SettingContainer from './setting-container.vue';

const form = ref({
  uid: String(config.value.basic?.uid ?? ''),
  msgsLimit: String(config.value.basic?.msgsLimit ?? ''),
  clearEnterBefore: String(config.value.basic?.clearEnterBefore ?? ''),
  comboGiftIn: String(config.value.basic?.comboGiftIn ?? ''),
  autoClearEnter: config.value.basic?.autoClearEnter ?? false,
  comboSameGift: config.value.basic?.comboSameGift ?? false,
  broadcast: config.value.basic?.broadcast ?? false,
}
)
const form$ = ref<InstanceType<typeof Form>>();

const rules = {
  uid: [
    { required: true, message: '请输入' }
  ],
};

const handleSave = async () => {
  form$.value?.validate(async (errors) => {
    console.log(errors);
    if (!errors) {
      const { uid, msgsLimit, clearEnterBefore, comboGiftIn } = form.value;

      config.value.basic = {
        ...config.value.basic,
        ...form.value,
        uid: uid ? +uid : undefined,
        msgsLimit: msgsLimit ? +msgsLimit : undefined,
        clearEnterBefore: clearEnterBefore ? +clearEnterBefore : undefined,
        comboGiftIn: comboGiftIn ? +comboGiftIn : undefined,
      };
      const res = await saveConfig();
      if (res) {
        console.log('handleSave');
        Message.success('保存成功');
      }
    }
  });
};

const uidList = computed(() => (config.value.history?.uidList ?? []).map(({ id, name }) => ({
  value: id,
  label: name,
})))

const handleUidQuery: FilterOption = (qs, option) => {
  return option.value?.toString().startsWith(qs.toString()) ?? false;
};

const handleUidSelect = (value: string) => {
  form.value.uid = value;
};
</script>

<style lang="scss" scoped>

</style>
