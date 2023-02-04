<template>
  <setting-container title="哔哩哔哩账号" hide-confirm-btn>
    <div class="other-setting">
      <template v-if="!config.cookie">
        <div v-if="!qrcodeInfo">
          <a-button @click="handleGetQrcode">扫码登录</a-button>
        </div>
        <div class="qrcode" v-show="qrcodeInfo">
          <canvas ref="qrcodeEl"></canvas>
          <div class="qrcode-text" v-if="result">
            <a-button @click="handleGetQrcode" v-if="isNeedRefresh">重新扫码</a-button>
            <span>{{ result.message }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-if="userInfo">
          <a-avatar>
            <img alt="avatar" :src="userInfo.face" />
          </a-avatar>
          <span style="margin-left: 12px;">
            {{ userInfo.uname }} ({{ userInfo.mid }})
          </span>
          <a-button type="text" @click="handleLogout">退出</a-button>
        </div>
        <div style="margin-top: 12px;">
          <a-button @click="handleSendTestDanmaku">测试弹幕</a-button>
          <a-button @click="handleGetUserInfo" style="margin-left: 12px;">获取用户信息</a-button>
        </div>
      </template>
    </div>
  </setting-container>
</template>

<script lang="ts" setup>
import qrcode from 'qrcode';
import BiliApi from '@/apis/bili.api';
import SettingContainer from './setting-container.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { config, saveConfig } from '@/utils/config';
import { Message } from '@arco-design/web-vue';
import DataUtil from '@/utils/data.util';

const qrcodeEl = ref<HTMLCanvasElement>();

const qrcodeInfo = ref<Awaited<ReturnType<typeof BiliApi.getLoginQrcode>>>();
const result = ref<Awaited<ReturnType<typeof BiliApi.pollLoginStatus>>>();

const handleGetQrcode = async () => {
  if (!qrcodeEl.value) return;
  qrcodeInfo.value = await BiliApi.getLoginQrcode();
  if (qrcodeInfo.value) {
    qrcode.toCanvas(qrcodeEl.value, qrcodeInfo.value.url, {
      width: 200,
    });
    pollLoginStatus();
  }
}

let timer: any = null;
const isNeedRefresh = ref(false);
const pollLoginStatus = async () => {
  if (!qrcodeInfo.value) return;
  const res = await BiliApi.pollLoginStatus(qrcodeInfo.value.qrcode_key);
  result.value = res;
  if (res?.code === 86101) {
    result.value = undefined;
  }
  if (res?.code === 0) {
    config.value.cookie = {
      SESSDATA: DataUtil.dataMarking(res.cookie['SESSDATA']),
      sid: DataUtil.dataMarking(res.cookie['sid']),
      bili_jct: DataUtil.dataMarking(res.cookie['bili_jct']),
      DedeUserID: DataUtil.dataMarking(res.cookie['DedeUserID']),
      DedeUserID__ckMd5: DataUtil.dataMarking(res.cookie['DedeUserID__ckMd5']),
      text: DataUtil.dataMarking(Object.keys(res.cookie).map((key) => key + '=' + res.cookie[key]).join(';')),
    };
    saveConfig();
    getUserInfo();

    clearTimeout(timer);
    return;
  }
  isNeedRefresh.value = !res || res.code === 86038;
  if (!isNeedRefresh.value) {
    timer = setTimeout(() => {
      pollLoginStatus();
    }, 2000);
  }
};
const handleSendTestDanmaku = async () => {
  const res = await BiliApi.sendLiveDanmaku({
    roomid: config.value.roomId!,
    msg: '测试 [' + new Date().toLocaleTimeString() + ']'
  }, config.value.cookie!);
  if (res.code !== 0) {
    Message.error(res.message);
  } else {
    Message.success('发送成功');
  }
};

const userInfo = ref<Awaited<ReturnType<typeof BiliApi.getUserInfo>>['data']>();
const getUserInfo = async () => {
  const res = await BiliApi.getUserInfo(config.value.cookie!);
  if (res.code === 0) {
    userInfo.value = res.data;
  }
  return res;
}
const handleGetUserInfo = async () => {
  const res = await getUserInfo();
  if (res.code === 0) {
    Message.success('获取用户信息成功');
  } else {
    Message.error(res?.message ?? '获取用户信息失败')
  }
}

const handleLogout = async () => {
  config.value.cookie = undefined;
  saveConfig();
  qrcodeInfo.value = undefined;
  result.value = undefined;
}

onMounted(() => {
  if (config.value.cookie) {
    getUserInfo();
  }
});

onUnmounted(() => {
  clearTimeout(timer);
  qrcodeInfo.value = undefined;
})
</script>

<style lang="scss" scoped>
.qrcode {
  position: relative;
  width: 200px;
  height: 200px;

  .qrcode-text {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    background-color: rgba(0, 0, 0, .8);

    >span {
      margin-top: 12px;
    }
  }
}
</style>