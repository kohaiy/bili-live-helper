import { ref, watch } from "vue";
import Danmaku, { MsgBody, MsgCallback } from "@/utils/danmaku.util";
import { config, saveConfig } from "@/utils/config";
import BiliApi from "@/apis/bili.api";

export const popularTotal = ref(0);

export const followerTotal = ref(0);

export const danmakuList = ref<MsgBody[]>([]);
console.log(config.value);

watch(
  () => config.value.basic?.uid,
  async (newVal, oldVal) => {
    console.log({newVal, oldVal});
    
    if (newVal && oldVal !== newVal) {
      const res = await BiliApi.getRoomInfo(newVal);
      if (res) {
        const { roomId, uname } = res;
        config.value.roomId = roomId;
        config.value.uname = uname;
        const uidList = config.value.history?.uidList ?? [];
        let uid = uidList.find(({ id }) => id === newVal);
        if (uid) {
          uid.name = uname;
        } else {
          uid = {
            id: newVal,
            name: uname,
          };
          uidList.push(uid);
        }
        config.value.history = config.value.history ?? {};
        config.value.history.uidList = uidList;
        saveConfig();

        danmakuList.value = [];
        danmaku.connect(roomId);
      }
    }
  },
  { immediate: true, }
);

const danmaku = new Danmaku();

export const onAll = (cb: MsgCallback) => {
  danmaku.on("ALL", cb);
  return () => danmaku.off("ALL", cb);
};
export const onSelfEnter = (cb: MsgCallback) => {
  danmaku.on("SELF_ENTER", cb);
  return () => danmaku.off("SELF_ENTER", cb);
};
export const onPopularTotal = (cb: MsgCallback) => {
  danmaku.on("POPULAR_TOTAL", cb);
  return () => danmaku.off("POPULAR_TOTAL", cb);
};
export const onEnterRoom = (cb: MsgCallback) => {
  danmaku.on("ENTER_ROOM", cb);
  return () => danmaku.off("ENTER_ROOM", cb);
};
export const onInteractWord = (cb: MsgCallback) => {
  danmaku.on("INTERACT_WORD", cb);
  return () => danmaku.off("INTERACT_WORD", cb);
};
export const onDanmuMsg = (cb: MsgCallback) => {
  danmaku.on("DANMU_MSG", cb);
  return () => danmaku.off("DANMU_MSG", cb);
};
export const onSendGift = (cb: MsgCallback) => {
  danmaku.on("SEND_GIFT", cb);
  return () => danmaku.off("SEND_GIFT", cb);
};
export const onComboSend = (cb: MsgCallback) => {
  danmaku.on("COMBO_SEND", cb);
  return () => danmaku.off("COMBO_SEND", cb);
};
export const connect = (roomId: number) => {
  if (roomId !== config.value.roomId) {
    config.value.roomId = roomId;
    danmaku.connect(roomId);
  }
};
