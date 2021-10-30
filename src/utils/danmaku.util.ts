import { decode, encode } from "./bili-data.util";
import DataUtil from "./data.util";

type MSG_TYPE_KEY =
  | "SELF_ENTER"
  | "POPULAR_TOTAL"
  | "INTERACT_WORD"
  | "ENTER_ROOM"
  | "FOLLOW_ROOM"
  | "SHARE_ROOM"
  | "DANMU_MSG"
  | "SEND_GIFT"
  | "COMBO_SEND"
  | "ALL"
  | "OTHER";

// 消息类型
export const MSG_TYPE = Object.freeze<Record<MSG_TYPE_KEY, MSG_TYPE_KEY>>({
  SELF_ENTER: "SELF_ENTER", // 自身加入直播间
  POPULAR_TOTAL: "POPULAR_TOTAL", // 人气
  INTERACT_WORD: "INTERACT_WORD", // 互动词
  ENTER_ROOM: "ENTER_ROOM", // 进入直播间
  FOLLOW_ROOM: "FOLLOW_ROOM", // 关注直播间
  SHARE_ROOM: "SHARE_ROOM", // 分享直播姬
  DANMU_MSG: "DANMU_MSG", // 弹幕消息
  SEND_GIFT: "SEND_GIFT", // 发送礼物（散装）
  COMBO_SEND: "COMBO_SEND", // 发送礼物（打包）
  ALL: "ALL", // 所有消息都会触发
  OTHER: "OTHER" // 其他类型
});

// type MsgPayload = {
//   id: string;
//   time: number;
//   isEnter: boolean;
// };

export type MsgCallback = (payload: MsgBody) => void;

export class MsgBody {
  id = DataUtil.generateId();
  time = Date.now();
  type: MSG_TYPE_KEY = "OTHER";
  uid = -1;
  uname = "";
  isAdmin = false;
  msg = "";
  // 粉丝牌子
  fansMedal?: {
    level: number;
    name: string;
    uid: number;
    uname: string;
    roomId: number;
    color: number;
    borderColor: number;
    bgStartColor: number;
    bgEndColor: number;
  };
  gift?: {
    num: number;
    giftId: number;
    giftName: string;
    giftType: number;
    action: string;
  };
  count = 0;
  raw: unknown;

  static parse(body: unknown) {
    console.log(body);
    return new this(body);
  }

  static parsePopularTotal(body: unknown) {
    const { count } = body as { count: number };
    const instance = new this(body);
    instance.count = count;
    instance.type = "POPULAR_TOTAL";
    return instance;
  }

  static parseInteractWord(body: unknown) {
    const {
      data: { uid, uname, msg_type }
    } = body as { data: { uid: number; uname: string; msg_type: number } };
    const instance = new this(body);
    instance.uid = uid;
    instance.uname = uname;
    const cmd = [
      undefined,
      MSG_TYPE.ENTER_ROOM,
      MSG_TYPE.FOLLOW_ROOM,
      MSG_TYPE.SHARE_ROOM
    ][msg_type];
    if (cmd) {
      instance.type = cmd;
    }
    return instance;
  }

  static parseDanmuMsg(body: unknown) {
    const {
      info: [
        ,
        msg,
        [uid, uname, isAdmin],
        [
          fmLevel,
          fmName,
          fmUpName,
          fmRoomId,
          color,
          ,
          ,
          borderColor,
          bgStartColor,
          bgEndColor,
          ,
          isActive,
          fmUpUid,
        ]
      ]
    } = body as {
      info: [
        unknown,
        string,
        [number, string, number],
        [
          number,
          string,
          string,
          number,
          number,
          string,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
        ]
      ];
    };
    const instance = new this(body);
    instance.uid = uid;
    instance.uname = uname;
    instance.msg = msg;
    if (fmLevel && isActive) {
      instance.fansMedal = {
        level: fmLevel,
        name: fmName,
        color,
        borderColor,
        bgStartColor,
        bgEndColor,
        uid: fmUpUid,
        uname: fmUpName,
        roomId: fmRoomId
      };
    }
    if (isAdmin) {
      instance.isAdmin = true;
    }
    instance.type = "DANMU_MSG";
    return instance;
  }

  static parseSendGift(body: unknown) {
    const {
      data: { uid, uname, giftId, giftName, giftType, action, num }
    } = body as {
      data: {
        uid: number;
        uname: string;
        giftId: number;
        giftName: string;
        giftType: number;
        action: string;
        num: number;
      };
    };
    const instance = new this(body);
    instance.uid = uid;
    instance.uname = uname;
    instance.gift = {
      giftId,
      giftName,
      giftType,
      action,
      num
    };
    instance.type = "SEND_GIFT";
    return instance;
  }

  static parseComboSend(body: unknown) {
    const {
      data: {
        uid,
        uname,
        gift_id: giftId,
        gift_name: giftName,
        gift_num: giftType,
        action,
        total_num: num
      }
    } = body as {
      data: {
        uid: number;
        uname: string;
        gift_id: number;
        gift_name: string;
        gift_num: number;
        action: string;
        total_num: number;
      };
    };
    const instance = new this(body);
    instance.uid = uid;
    instance.uname = uname;
    instance.gift = {
      giftId,
      giftName,
      giftType,
      action,
      num
    };
    instance.type = "COMBO_SEND";
    return instance;
  }

  constructor(raw?: unknown) {
    this.raw = raw;
  }
}

class Danmaku {
  static MSG_TYPE = MSG_TYPE;

  private ws: WebSocket | null = null;
  private timer: NodeJS.Timer | null = null;
  private eventMap = new Map<string, MsgCallback[]>();

  // 连接 WebSocket
  public connect(roomId: number) {
    try {
      this.ws?.close();
    } catch (e) {
      console.error(e);
    }
    this.ws = new WebSocket("ws://broadcastlv.chat.bilibili.com:2244/sub");
    this.ws.onopen = () => {
      if (!this.ws) return;
      this.ws.send(
        encode(
          JSON.stringify({
            protover: 1,
            clientver: "1.4.0",
            roomid: roomId
          }),
          7
        )
      );
      this.ws.send(encode("", 2));
      this.ws.onmessage = async msgEvent => {
        const packet = await decode(msgEvent.data);
        // console.warn(packet);
        switch (packet.op) {
          case 8:
            // 自身进入直播间
            this.handleEmit(MSG_TYPE.SELF_ENTER, new MsgBody(packet.body));
            break;
          case 3:
            // 人气值
            this.handleEmit(
              MSG_TYPE.POPULAR_TOTAL,
              MsgBody.parsePopularTotal(packet.body)
            );
            break;
          case 5:
            // 各类消息
            (packet.body as unknown[]).forEach(body => {
              const { cmd } = body as { cmd: MSG_TYPE_KEY };
              switch (cmd) {
                case MSG_TYPE.DANMU_MSG:
                  this.handleEmit("DANMU_MSG", MsgBody.parseDanmuMsg(body));
                  break;
                case MSG_TYPE.SEND_GIFT:
                  this.handleEmit("SEND_GIFT", MsgBody.parseSendGift(body));
                  break;
                case MSG_TYPE.COMBO_SEND:
                  this.handleEmit("COMBO_SEND", MsgBody.parseComboSend(body));
                  break;
                case MSG_TYPE.INTERACT_WORD:
                  this.handleInteractWord(body);
                  break;
                default:
                  this.handleEmit("OTHER", new MsgBody(body));
              }
            });
            break;
          default:
            this.handleEmit(MSG_TYPE.OTHER, new MsgBody(packet));
        }
      };
      this.timer = setInterval(() => {
        this.ws?.send(encode("", 2));
      }, 30000);
    };
    this.ws.onclose = () => {
      this.timer && clearInterval(this.timer);
    };
    this.ws.onerror = (err) => {
      console.log('onerror', err);
      try {
        this.ws?.close();
      } catch (e) {
        console.error(e);
      }
      this.ws = null;
      this.connect(roomId);
    };
    return this;
  }
  // 挂载事件监听
  public on(type: MSG_TYPE_KEY, callback: MsgCallback) {
    if (!this.eventMap.has(type)) {
      this.eventMap.set(type, []);
    }
    this.eventMap.get(type)?.push(callback);
  }

  // 卸载事件监听
  public off(type: MSG_TYPE_KEY, callback: MsgCallback) {
    const events = this.eventMap.get(type);
    if (events) {
      events.splice(events.indexOf(callback), 1);
    }
  }

  // 处理事件提交
  private handleEmit(type: MSG_TYPE_KEY, payload: MsgBody) {
    const events = this.eventMap.get(type);
    if (events) {
      events.forEach(ev => ev(payload));
    }
    const allEvents = this.eventMap.get("ALL");
    if (allEvents) {
      allEvents.forEach(ev => ev(payload));
    }
  }

  private handleInteractWord(body: unknown) {
    const {
      data: { msg_type }
    } = body as { data: { msg_type: number } };
    const cmd = [
      undefined,
      MSG_TYPE.ENTER_ROOM,
      MSG_TYPE.FOLLOW_ROOM,
      MSG_TYPE.SHARE_ROOM
    ][msg_type];
    if (cmd) {
      this.handleEmit(cmd, MsgBody.parseInteractWord(body));
    }
  }
}

export default Danmaku;
