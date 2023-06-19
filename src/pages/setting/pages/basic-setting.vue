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
      </a-form>
    </div>
  </setting-container>
</template>

<script lang="ts" setup>
import { config, saveConfig } from '@/utils/config';
import { FilterOption, Form, Message } from '@arco-design/web-vue';
import { computed, ref, watch } from 'vue';
import SettingContainer from '../components/setting-container.vue';

const form = ref<{
  uid: string;
  msgsLimit: string;
  clearEnterBefore: string;
  comboGiftIn: string;
  autoClearEnter: boolean;
  comboSameGift: boolean;
  broadcast: boolean;
  broadcaseVoiceOrigin: "SYS" | "TENCENT";
  broadcaseVoiceTencentTTS: {
    secretId: string;
    secretKey: string;
  };
}>({
  uid: String(config.value.basic?.uid ?? ''),
  msgsLimit: String(config.value.basic?.msgsLimit ?? ''),
  clearEnterBefore: String(config.value.basic?.clearEnterBefore ?? ''),
  comboGiftIn: String(config.value.basic?.comboGiftIn ?? ''),
  autoClearEnter: config.value.basic?.autoClearEnter ?? false,
  comboSameGift: config.value.basic?.comboSameGift ?? false,
  broadcast: config.value.basic?.broadcast ?? false,
  broadcaseVoiceOrigin: config.value.basic?.broadcaseVoiceOrigin ?? 'SYS',
  broadcaseVoiceTencentTTS: config.value.basic?.broadcaseVoiceTencentTTS ?? { secretId: '', secretKey: '' },
});

const form$ = ref<InstanceType<typeof Form>>();

const rules = {
  uid: [
    { required: true, message: '请输入' }
  ],
};

const handleSave = async () => {
  form$.value?.validate(async (errors) => {
    if (!errors) {
      const { uid } = form.value;

      config.value.basic = {
        ...config.value.basic,
        uid: uid ? +uid : undefined,
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
