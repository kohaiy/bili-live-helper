<template>
  <setting-container title="点歌设置" @confirm="handleSave">
    <div class="music-setting">
      <a-form :model="form" :rules="rules" ref="form$" label-position="top" label-suffix=" :">
        <a-form-item label="开启点歌">
          <a-switch v-model="form.enable" />
        </a-form-item>
        <a-form-item label="默认歌单" v-show="form.enable">
          <a-input v-model="form.defaultListId" />
        </a-form-item>
        <a-form-item label="切歌上限" v-show="form.enable">
          <a-input-number v-model="form.cutLimit" :min="1" />
        </a-form-item>
        <a-form-item label="歌单上限" v-show="form.enable">
          <a-input-number v-model="form.listLimit" :min="0" />
        </a-form-item>
        <a-form-item label="歌曲黑名单" v-show="form.enable">
          <k-tags :model-value="form.blackList" @add="handleBlackAdd" />
        </a-form-item>
      </a-form>
    </div>
  </setting-container>
</template>

<script lang="ts" setup>
import { config, saveConfig } from '@/utils/config';
import { Form as AForm, Message } from '@arco-design/web-vue';
import { ref } from 'vue';
import SettingContainer from './setting-container.vue';
import KTags from '@/components/k-tags/index.vue';
import NeteaseApi from '@/apis/netease.api';

const form = ref({
  ...config.value.music,
  blackList: config.value.music?.blackList || [],
});
const form$ = ref<InstanceType<typeof AForm>>();

const rules = {
};

const handleSave = async () => {
  form$.value?.validate(async (valid) => {
    if (valid) {
      form.value.defaultListId = form.value.defaultListId ? +form.value.defaultListId : undefined;
      config.value.music = form.value;
      const res = await saveConfig();
      if (res) {
        Message.success('保存成功');
      }
    }
  });
};

const handleBlackAdd = async (keyword: string) => {
  keyword = keyword.trim();
  if (keyword) {
    if (form.value.blackList.find(({ id }) => id === +keyword)) {
      return;
    }
    const song = await NeteaseApi.getSongDetail(keyword);
    if (song) {
      form.value.blackList.push({
        id: song.id,
        name: song.name,
      });
    }
  }
};

</script>