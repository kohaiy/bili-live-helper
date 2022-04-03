<template>
  <div class="home">
    <danmaku-header v-model:isLocked="isLocked" />
    <div
      class="message-list--wrapper"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <danmaku-list-vue />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { remote } from 'electron';
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
    remote.getCurrentWindow().setIgnoreMouseEvents(true, { forward: true });
  }
};
const handleMouseLeave = () => {
  if (isLocked.value) {
    remote.getCurrentWindow().setIgnoreMouseEvents(false);
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
