import { config } from '@/utils/config';
import { playBySys, playByTencentTTS } from '@/utils/tts.util';

type VoiceInfo = {
    text: string;
    uid: number;
}

// 消息队列
const messages: VoiceInfo[] = [];
let isPlaying = false;

const addMessage = (info: VoiceInfo) => {
    messages.push(info);
    if (!isPlaying) {
        playNextVoice();
    }
}

const playNextVoice = async () => {
    const info = messages.shift();
    isPlaying = !!info;
    if (!info) {
        return;
    }
    const broadcaseVoiceOrigin = config.value.basic?.broadcaseVoiceOrigin ?? 'SYS';
    if (broadcaseVoiceOrigin === 'SYS') {
        playBySys(info);
    } else if (broadcaseVoiceOrigin === 'TENCENT') {
        await playByTencentTTS(info);
    }
    playNextVoice();
};

export const useVoice = () => {
    return {
        addMessage,
    }
};
