import { Config } from '@/utils/config';
import DataUtil from '@/utils/data.util';
import NodeFetch, { FormData as NodeFormData } from 'node-fetch';

export default class BiliApi {
  static async getRoomInfo(uid: number) {
    const res = await (
      await fetch("https://api.bilibili.com/x/space/wbi/acc/info?mid=" + uid)
    ).json();
    if (res?.code === 0) {
      // TODO: 未开播时，会报错
      console.log(res);
      
      if (res.data.live_room.roomStatus)
        return {
          roomId: res.data.live_room.roomid as number,
          uname: res.data.name as string
        };
    }
    console.error('getRoomInfo', res);
    if (res?.code === -403) {
      throw new Error('请先到控制面板登录');
    }
    if (res?.message) {
      throw new Error(res.message);
    }
    
    throw new Error('获取房间信息失败');
  }
  static async getUpInfo(uid: number) {
    const res = await (
      await fetch("https://api.bilibili.com/x/relation/stat?vmid=" + uid)
    ).json();
    if (res && res.code === 0) {
      return res.data;
    }
  }
  static async getLoginQrcode() {
    const res = await fetch('https://passport.bilibili.com/x/passport-login/web/qrcode/generate?source=main-mini')
      .then(r => r.json());
    if (res.code === 0 && res.data) {
      return res.data as {
        qrcode_key: string;
        url: string;
      };
    }
  }
  static async pollLoginStatus(qrcode_key: string) {
    const resp = await NodeFetch(`https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${qrcode_key}&source=main_mini`)
    const res: any = await resp.json();
    if (res.code === 0 && res.data) {
      const cookieText = resp.headers.get('set-cookie');
      if (cookieText) {
        res.data.cookie = cookieText.split(/\s*[,;]\s*/).filter(it => it.includes('=')).reduce((map, cur) => {
          const [key, val] = cur.split('=');
          if (!['Path', 'Domain', 'Expires'].includes(key)) { map[key] = val; }
          return map;
        }, {} as Record<string, string>)
      }
      return res.data as {
        url: string;
        refresh_token: string;
        timestamp: number;
        code: number;
        message: string;
        cookie: Record<string, string>;
      };
    }
  }

  static async sendLiveDanmaku(msgBody: {
    roomid: number;
    msg: string;
    bubble?: number;
    color?: number;
    mode?: number;
    fontsize?: number;
    rnd?: number;
  }, cookie: NonNullable<Config['cookie']>) {
    const body = new NodeFormData();
    const form: Record<string, any> = {
      bubble: 0,
      color: 16777215,
      mode: 1,
      fontsize: 25,
      rnd: Math.floor(Date.now() / 1000),
      csrf: DataUtil.dataShowing(cookie.bili_jct),
      csrf_token: DataUtil.dataShowing(cookie.bili_jct),
      ...msgBody,
    };
    Object.keys(form).forEach(key => {
      body.set(key, `${form[key]}`)
    })
    const res = await NodeFetch('https://api.live.bilibili.com/msg/send', {
      method: 'POST',
      headers: {
        Cookie: DataUtil.dataShowing(cookie.text),
      },
      body,
    }).then(r => r.json())

    return res as {
      code: number;
      data: {
        mode_info: {
          mode: number;
          show_player_type: number;
          extra: string;
        };
      };
      message: string;
      msg: string;
    };
  }

  static async getUserStat(cookie: NonNullable<Config['cookie']>) {
    const res = await NodeFetch('https://api.bilibili.com/x/web-interface/nav/stat', {
      headers: {
        Cookie: DataUtil.dataShowing(cookie.text),
      },
    }).then(r => r.json())

    return res as {
      code: number;
      message: string;
      ttl: number;
      data: {
        following: number;
        follower: number;
        dynamic_count: number;
      };
    };
  }

  static async getUserInfo(cookie: NonNullable<Config['cookie']>) {
    const res: any = await NodeFetch(`https://api.bilibili.com/x/member/web/account?csrf=${DataUtil.dataShowing(cookie['bili_jct'])}`, {
      headers: {
        Cookie: DataUtil.dataShowing(cookie.text),
      },
    }).then(r => r.json());

    const res2 = await fetch(`https://api.bilibili.com/x/space/wbi/acc/info?mid=${DataUtil.dataShowing(cookie.DedeUserID)}&token=&platform=web&w_rid=dbb87a99db43d7e9222a05f6a9492276&wts=1675238196`)
      .then(r => r.json());

    return {
      ...res,
      data: {
        ...res.data,
        ...(res2?.code === 0 ? res2.data : {})
      }
    } as {
      code: number;
      message: string;
      ttl: number;
      data: {
        mid: number;
        uname: string;
        userid: string;
        sign: string;
        birthday: string;
        sex: string;
        nick_free: boolean;
        rank: string;
        face: string;
      }
    };
  }
}

// @ts-ignore
ReadableStream.prototype[Symbol.asyncIterator] ??= async function* () {
  // @ts-ignore
  const reader = this.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) return
      yield value
    }
  }
  finally {
    reader.releaseLock()
  }
}
