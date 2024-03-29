import { ipcRenderer } from 'electron';
import { ref } from 'vue';
import IpcRendererUtil from './ipc-renderer.util';

export interface AutoReply {
  keyword: string;
  replyContent: string;
  isRegExp?: boolean;
  order?: number;
}

export interface Config {
  uname?: string;
  roomId?: number;
  basic?: {
    uid?: number;
    msgsLimit?: number; // 消息列表上限，超出将截取掉旧消息
    autoClearEnter?: boolean; // 是否自动清除入场消息
    clearEnterBefore?: number; // 清除多少秒之前的入场消息
    comboSameGift?: boolean; // 是否合并相同礼物
    comboGiftIn?: number; // 合并多少秒内的礼物
    broadcast?: boolean; // 是否语音播报
    broadcaseVoiceOrigin?: 'SYS' | 'TENCENT'; // 语音播报声音源
    broadcaseVoiceTencentTTS?: {
      secretId: string;
      secretKey: string;
    }; // 语音播报腾讯云 TTS 配置
    headerStats?: { key: string; label: string; show: boolean }[]; // 弹幕窗口头部状态显示
  };
  music?: {
    enable?: boolean; // 是否开启点歌
    defaultListId?: number; // 默认歌单 id
    cutLimit?: number; // 切歌上限
    listLimit?: number; // 歌单上限
    blackList?: { id: number; name: string }[]; // 黑名单歌曲列表
  };
  // 历史记录
  history?: {
    uidList?: { id: number; name?: string }[];
  };
  cookie?: {
    SESSDATA: string;
    bili_jct: string;
    DedeUserID: string;
    DedeUserID__ckMd5: string;
    sid: string;
    text: string;
  };
  enableAutoReply?: boolean;
  autoReplies?: AutoReply[];
}

export const config = ref<Config>({});
export const isLoaded = ref(false);

ipcRenderer.on('configUpdated', (event, payload) => {
  config.value = payload as Config;
});

export const useConfig = async () => {
  config.value = (await IpcRendererUtil.send('initialize')) as Config;
  isLoaded.value = true;
};

export const saveConfig = () => {
  return IpcRendererUtil.send('saveConfig', config.value);
};

export default useConfig;
