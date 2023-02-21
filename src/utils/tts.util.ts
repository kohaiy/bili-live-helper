import { config } from './config';
import IpcRendererUtil from './ipc-renderer.util';

type VoiceInfo = {
    text: string;
    uid: number;
}

/**
 * 系统 tts 播放
 * @param message 播报内容
 */
export const playBySys = (info: VoiceInfo) => {
    const u = new SpeechSynthesisUtterance();
    u.text = info.text;
    u.lang = 'zh-CN';
    u.rate = 1;
    speechSynthesis.speak(u);
}

export const playByTencentTTS = async (info: VoiceInfo) => {
    try {
        const { secretId, secretKey } = config.value.basic?.broadcaseVoiceTencentTTS ?? {};
        if (!secretId || !secretKey) { return; }
        const data = await IpcRendererUtil.send('TTS', {
            Text: info.text,
            VoiceType: getVoiceType(info.uid),
            secretId,
            secretKey,
        });
        if (!data) { return; }
        const url = `data:audio/x-wav;base64,${data}`;
        const audio = new Audio();
        return new Promise((resolve) => {
            audio.addEventListener('ended', resolve);
            audio.src = url;
            return audio.play().catch(console.error);
        });
    } catch (e) {
        console.error(e);
    }
};

const voiceTypeMap: Record<string, number> = {};
const voiceTypes = [
    { code: 0, sex: 1, desc: '云小宁，亲和女声(默认)', },
    { code: 1, sex: 0, desc: '云小奇，亲和男声', },
    { code: 2, sex: 0, desc: '云小晚，成熟男声', },
    { code: 4, sex: 1, desc: '云小叶，温暖女声', },
    { code: 5, sex: 1, desc: '云小欣，情感女声', },
    { code: 6, sex: 0, desc: '云小龙，情感男声', },
    { code: 7, sex: 1, desc: '云小曼，客服女声', },
    { code: 1001, sex: 1, desc: '智瑜，情感女声', },
    { code: 1002, sex: 1, desc: '智聆，通用女声', },
    { code: 1003, sex: 1, desc: '智美，客服女声', },
    { code: 101001, sex: 1, desc: '智瑜，情感女声（精品）', },
    { code: 101002, sex: 1, desc: '智聆，通用女声（精品）', },
    { code: 101003, sex: 1, desc: '智美，客服女声（精品）', },
    { code: 101004, sex: 0, desc: '智云，通用男声', },
    { code: 101005, sex: 1, desc: '智莉，通用女声', },
    { code: 101006, sex: 1, desc: '智言，助手女声', },
    { code: 101007, sex: 1, desc: '智娜，客服女声', },
    { code: 101008, sex: 1, desc: '智琪，客服女声', },
    { code: 101009, sex: 1, desc: '智芸，知性女声', },
    { code: 101010, sex: 0, desc: '智华，通用男声', },
    { code: 101011, sex: 1, desc: '智燕，新闻女声', },
    { code: 101012, sex: 1, desc: '智丹，新闻女声', },
    { code: 101013, sex: 0, desc: '智辉，新闻男声', },
    { code: 101014, sex: 0, desc: '智宁，新闻男声', },
    { code: 101015, sex: 0, desc: '智萌，男童声', },
    { code: 101016, sex: 1, desc: '智甜，女童声', },
    { code: 101017, sex: 1, desc: '智蓉，情感女声', },
    { code: 101018, sex: 0, desc: '智靖，情感男声', },
    { code: 101019, sex: 1, desc: '智彤，粤语女声', },
    { code: 102000, sex: 1, desc: '贝蕾，客服女声', },
    { code: 102001, sex: 1, desc: '贝果，客服女声', },
    { code: 102002, sex: 1, desc: '贝紫，粤语女声', },
    { code: 102003, sex: 1, desc: '贝雪，新闻女声', },
];

const getVoiceType = (uid: number) => {
    if (voiceTypeMap[uid]) {
        return voiceTypeMap[uid];
    }
    voiceTypeMap[uid] = voiceTypes[Math.floor(Math.random() * voiceTypes.length)].code;
    return voiceTypeMap[uid];
}
