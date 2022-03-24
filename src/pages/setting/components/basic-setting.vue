<template>
  <setting-container title="基础设置" @confirm="handleSave">
    <div class="basic-setting">
      <a-form :model="form" :rules="rules" ref="form$" layout="vertical" label-suffix=" :">
        <a-form-item label="UP UID" field="uid" :rules="rules.uid">
          <a-auto-complete
            type="number"
            v-model="form.uid"
            :fetch-suggestions="handleUidQuery"
            @select="handleUidSelect"
          >
            <!-- <template #default="{ item }">
              <div>{{ item.label }}({{ item.value }})</div>
            </template> -->
          </a-auto-complete>
        </a-form-item>
        <a-form-item label="弹幕列表上限">
          <a-input type="number" v-model="form.msgsLimit" />
        </a-form-item>
        <a-form-item label="自动清除入场提示">
          <a-row align="center">
            <a-col :span="12">
              <a-switch v-model="form.autoClearEnter"/>
            </a-col>
            <a-col :span="12" v-show="form.autoClearEnter">
              <a-input type="number" v-model="form.clearEnterBefore">
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
              <a-input type="number" v-model="form.comboGiftIn">
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
import { config, saveConfig } from '@/utils/config';
import { Form, Message } from '@arco-design/web-vue';
import { ref } from 'vue';
import SettingContainer from './setting-container.vue';

const form = ref({
  ...config.value.basic
});
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
      form.value.uid = uid ? +uid : undefined;
      form.value.msgsLimit = msgsLimit ? +msgsLimit : undefined;
      form.value.clearEnterBefore = clearEnterBefore ? +clearEnterBefore : undefined;
      form.value.comboGiftIn = comboGiftIn ? +comboGiftIn : undefined;
      config.value.basic = form.value;
      const res = await saveConfig();
      if (res) {
        console.log('handleSave');
        Message.success('保存成功');
      }
    }
  });
};

const uids = config.value.history?.uidList ?? [];

const handleUidQuery = (qs: number, cb: (r: { value: number }[]) => void) => {
  cb(uids.filter(({ id }) => id.toString().startsWith(qs.toString())).map(({ id, name }) => ({ value: id, label: name })))
};

const handleUidSelect = ({ value }: { value: number }) => {
  form.value.uid = value;
};
</script>

<style lang="scss" scoped>
</style>
