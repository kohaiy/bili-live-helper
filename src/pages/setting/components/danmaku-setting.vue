<template>
  <setting-container title="弹幕设置" @confirm="handleSave">
    <div class="basic-setting">
      <a-form :model="form" :rules="rules" ref="form$" layout="vertical" label-suffix=" :">
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
          <div>
            <a-switch v-model="form.broadcast" />
            <div v-show="form.broadcast">
              <div class="mt-4">
                <a-radio-group type="button" v-model="form.broadcaseVoiceOrigin">
                  <a-radio value="SYS">系统自带</a-radio>
                  <a-radio value="TENCENT">腾讯云TTS</a-radio>
                </a-radio-group>
              </div>
              <div class="mt-2" v-if="form.broadcaseVoiceOrigin === 'TENCENT'">
                <a-input-password v-model="form.broadcaseVoiceTencentTTS.secretId" placeholder="腾讯云语音 secretId" />
                <a-input-password v-model="form.broadcaseVoiceTencentTTS.secretKey" placeholder="腾讯云语音 secretKey"
                  class="mt-1" />
              </div>
            </div>
          </div>
        </a-form-item>
        <a-form-item label="顶部显示">
          <div>
            <Space wrap>
              <Tag color="blue" bordered v-for="item in headerInfo" :key="item.key">{{ item.label }}*</Tag>
            </Space>
          </div>
          <div>点击图标进行切换，点击文字修改</div>
          <div></div>
        </a-form-item>
        <a-form-item>

        </a-form-item>
      </a-form>
    </div>
  </setting-container>
</template>

<script lang="ts" setup>
import { config, saveConfig } from '@/utils/config';
import { FilterOption, Form, Message, Space, Tag } from '@arco-design/web-vue';
import { computed, ref, watch } from 'vue';
import SettingContainer from './setting-container.vue';

const form = ref<{
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

// TODO: 放到 config 里面
const headerInfo: { key: string, label: string }[] = [
  { key: 'watchedTotal', label: '看过：' },
  { key: 'popularTotal', label: '人气：' },
  { key: 'followerTotal', label: '粉丝：' },
];

const handleSave = async () => {
  form$.value?.validate(async (errors) => {
    if (!errors) {
      const { msgsLimit, clearEnterBefore, comboGiftIn } = form.value;

      config.value.basic = {
        ...config.value.basic,
        ...form.value,
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
</script>

<style lang="scss" scoped></style>
