import { useVoice } from '@/uses/voice';
import { config, saveConfig } from '@/utils/config';
import { MSG_TYPE, MsgBody } from '@/utils/danmaku.util';
import DataUtil from '@/utils/data.util';
import { sendNotify } from '@/utils/notify.util';

export const handleAutoReply = (body: MsgBody) => {
  const { addMessage } = useVoice();
  if (
    config.value.enableAutoReply &&
    body.type === MSG_TYPE.DANMU_MSG &&
    config.value.autoReplies?.length
  ) {
    const autoReplies = config.value.autoReplies;
    const index = autoReplies.findIndex(({ keyword, replyContent }) => {
      if (DataUtil.isTextMatch(keyword, body.msg)) {
        sendNotify({
          title: `自动回复 ${body.uname}：${body.msg}`,
          content: replyContent,
          duration: 10000,
        });
        if (config.value.basic?.broadcast) {
          addMessage({
            text: `自动回复 ${body.uname}：${body.msg}，${replyContent}`,
            uid: body.uid,
          });
        }
        return true;
      }
    });
    if (index >= 0) {
      autoReplies[index].order = (autoReplies[index].order ?? 0) + 1;
      autoReplies.sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
      saveConfig();
    }
  }
};
