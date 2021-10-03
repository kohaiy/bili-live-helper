<template>
  <setting-container title="基础设置" @confirm="handleSave">
    <div class="basic-setting">
      <el-form :model="form" :rules="rules" ref="form$" label-position="top" label-suffix=" :">
        <el-form-item label="UP UID" prop="uid">
          <el-autocomplete
            type="number"
            v-model="form.uid"
            :fetch-suggestions="handleUidQuery"
            @select="handleUidSelect"
          />
        </el-form-item>
        <el-form-item label="弹幕列表上限">
          <el-input type="number" v-model="form.msgsLimit" />
        </el-form-item>
        <el-form-item label="自动清除入场提示">
          <el-row>
            <el-col :span="12">
              <el-switch v-model="form.autoClearEnter" />
            </el-col>
            <el-col :span="12" v-show="form.autoClearEnter">
              <el-input type="number" v-model="form.clearEnterBefore">
                <template #append>秒前</template>
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="语音播报">
          <el-switch v-model="form.broadcast" />
        </el-form-item>
      </el-form>
    </div>
  </setting-container>
</template>

<script lang="ts" setup>
import { config, saveConfig } from '@/utils/config';
import { ElForm, ElMessage } from 'element-plus';
import { ref } from 'vue';
import SettingContainer from './setting-container.vue';

const form = ref({
  ...config.value.basic
});
const form$ = ref<InstanceType<typeof ElForm>>();

const rules = {
  uid: [
    { required: true, message: '请输入' }
  ],
};

const handleSave = async () => {
  form$.value?.validate(async (valid) => {
    if (valid) {
      const { uid, msgsLimit, clearEnterBefore } = form.value;
      form.value.uid = uid ? +uid : undefined;
      form.value.msgsLimit = msgsLimit ? +msgsLimit : undefined;
      form.value.clearEnterBefore = clearEnterBefore ? +clearEnterBefore : undefined;
      config.value.basic = form.value;
      const res = await saveConfig();
      if (res) {
        ElMessage.success('保存成功');
      }
    }
  });
};

const uids = [24731556];

const handleUidQuery = (qs: number, cb: (r: { value: number }[]) => void) => {
  cb(uids.filter(uid => uid.toString().startsWith(qs.toString())).map(uid => ({ value: uid })))
};

const handleUidSelect = ({ value }: { value: number }) => {
  form.value.uid = value;
};
</script>

<style lang="scss" scoped>
</style>
