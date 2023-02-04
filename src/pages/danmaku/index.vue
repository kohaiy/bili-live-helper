<template>
  <div class="home">
    <danmaku-header v-model:isLocked="isLocked" />
    <div class="message-list--wrapper" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <danmaku-list-vue />
    </div>
    <div class="placeholder" :style="danmakuInputVisible ? '' : 'height: 0;'"></div>
    <div class="danmaku-send" :class="{ 'visible': danmakuInputVisible }">
      <input type="text" v-model="danmakuContent" @keydown="handleInputKeyDown" ref="danmakuInputEl"
        placeholder="Enter 显示/提交， ESC 关闭">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { ipcRenderer } from 'electron';
import { getCurrentWindow } from '@electron/remote';
import DanmakuHeader from './components/danmaku-header.vue';
import {
  onPopularTotal,
  onAll,
  onDanmuMsg,
  popularTotal,
  danmakuList,
} from './useDanmaku';
import DanmakuListVue from './components/danmaku-list.vue';
import BiliGiftStyleUtil from '@/utils/bili-gift-style.util';
import { MSG_TYPE } from '@/utils/danmaku.util';
import { config } from '@/utils/config';
import IpcRendererUtil from '@/utils/ipc-renderer.util';
import { Message } from '@arco-design/web-vue';
import BiliApi from '@/apis/bili.api';

const danmakuInputVisible = ref(false);
const danmakuContent = ref('');
const danmakuInputEl = ref<HTMLInputElement>();
ipcRenderer.on('SEND_DANMAKU', () => {
  showDanmakuInput();
});

const showDanmakuInput = () => {
  if (!config.value.cookie) {
    return Message.warning('使用发送弹幕功能，请先前往【控制面板】登录账号');
  }
  danmakuInputVisible.value = true;
  danmakuInputEl.value?.focus();
};

const handleSendDanmaku = async (msg: string) => {
  const res = await BiliApi.sendLiveDanmaku({
    roomid: config.value.roomId!,
    msg,
  }, config.value.cookie!);
  if (res.code !== 0) {
    Message.error(res.message);
  } else {
    Message.success('发送成功');
  }
};

const handleInputKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'Enter') {
    if (danmakuInputVisible.value && danmakuContent.value) {
      handleSendDanmaku(danmakuContent.value)
        .then(() => {
          danmakuContent.value = '';
          danmakuInputVisible.value = false;
        });
    }
  }
};

watchEffect((onCleanup) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      danmakuInputVisible.value = false;
      danmakuInputEl.value?.blur();
    } else if (e.code === 'Enter') {
      showDanmakuInput();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown);
  })
})

BiliGiftStyleUtil.load();

const isLocked = ref(false);

onPopularTotal((body) => {
  popularTotal.value = body.count;
});

onAll((body) => {
  if (
    [
      MSG_TYPE.ENTER_ROOM,
      MSG_TYPE.SHARE_ROOM,
      MSG_TYPE.FOLLOW_ROOM,
      MSG_TYPE.DANMU_MSG,
      MSG_TYPE.SEND_GIFT,
      MSG_TYPE.COMBO_SEND,
    ].includes(body.type)
  ) {
    if (config.value.basic?.comboSameGift && body.type === MSG_TYPE.SEND_GIFT) {
      const comboGiftIn = config.value.basic.comboGiftIn || 10;
      const timeLimit = Date.now() - comboGiftIn * 1000;
      let index = danmakuList.value.length - 1;
      for (; index >= 0; index--) {
        const { time, uid, type, gift } = danmakuList.value[index];
        if (time > timeLimit &&
          type === body.type &&
          uid === body.uid &&
          gift?.giftId === body.gift?.giftId) {
          break;
        }
      }
      const gift = danmakuList.value[index];
      // const index = danmakuList.value.findIndex(({ time }) => time > timeLimit);
      // const list = danmakuList.value.slice(index).reverse();
      // const gift = list.find(
      //   ({ uid, type, gift }) =>
      //     type === body.type &&
      //     uid === body.uid &&
      //     gift?.giftId === body.gift?.giftId
      // );
      if (gift) {
        gift.gift!.num += body.gift?.num || 0;
        gift.time = Date.now();
        danmakuList.value.splice(index, 1);
        danmakuList.value.push(gift);
        return;
      }
    }
    danmakuList.value.push(body);


    clearDanmakuList();
    // TODO watch 有点问题
    danmakuList.value = [...danmakuList.value];
  } else {
    // console.log(body.type, body);
  }
});

const clearDanmakuList = () => {
  const msgsLimit = config.value.basic?.msgsLimit || 1000;
  if (danmakuList.value.length > msgsLimit) {
    danmakuList.value.splice(0, msgsLimit / 2);
  }
  if (config.value.basic?.autoClearEnter) {
    const clearEnterBefore = config.value.basic.clearEnterBefore || 10;
    const clearTime = Date.now() - clearEnterBefore * 1000;
    danmakuList.value = danmakuList.value.filter(
      ({ time, type }) => type !== 'ENTER_ROOM' || time >= clearTime
    );
  }
};

onDanmuMsg((body) => {
  IpcRendererUtil.broadcast('DANMU_MSG', body);
});

const handleMouseEnter = () => {
  if (isLocked.value) {
    getCurrentWindow().setIgnoreMouseEvents(true, { forward: true });
  }
};
const handleMouseLeave = () => {
  if (isLocked.value) {
    getCurrentWindow().setIgnoreMouseEvents(false);
  }
};
</script>

<style lang="scss">
.home {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  color: #fff;
  /*background-color: #ffffff;*/
  background-color: rgba(0, 0, 0, 0.8);

  .message-list--wrapper {
    flex: 1;
    overflow: auto;
  }

  .placeholder {
    height: 40px;
    transition: height .3s;
  }

  .danmaku-send {
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    height: 40px;
    transform: translateY(100%);
    transition: all .3s;

    &::before {
      content: '➜';
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      font-weight: bolder;
      color: #60ba42;
    }

    &.visible {
      transform: translateY(0);
    }

    input {
      flex: 1;
      border: none;
      outline: none;
      padding: 0 12px 0 28px;
      color: #fff;
      font-size: 14px;
      background-color: rgba(255, 255, 255, 0)
    }
  }

  * {
    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      background-color: rgba(255, 255, 255, 0.1);
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }
}
</style>
