import { Config } from '@/utils/config';
import DataUtil from '@/utils/data.util';
import NodeFetch, { FormData as NodeFormData } from 'node-fetch';
import md5 from 'md5';

const getWRid = (mid: number) => {
  var t = {
    mid: mid + '',
    token: '',
    platform: 'web',
    web_location: 1550101 + '',
  };
  var n: any, r: any;
  var { imgKey: i, subKey: a } = {
    imgKey: '4209086203b744a5a34fc685b8c7bb99',
    subKey: 'e8446b0308ef4cb2a068734ae70fd4b2',
  };
  for (
    var c =
        ((n = i + a),
        (r = []),
        [
          46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43,
          5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16,
          24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59,
          6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
        ].forEach(function (t) {
          n.charAt(t) && r.push(n.charAt(t));
        }),
        r.join('').slice(0, 32)),
      s = Math.round(Date.now() / 1e3),
      p = Object.assign({}, t, {
        wts: s,
      }),
      d = Object.keys(p).sort(),
      h = [],
      v = /[!'\(\)*]/g,
      y = 0;
    y < d.length;
    y++
  ) {
    var m = d[y],
      g = (p as any)[m];
    g && 'string' == typeof g && (g = g.replace(v, '')),
      null != g &&
        h.push(
          ''.concat(encodeURIComponent(m), '=').concat(encodeURIComponent(g))
        );
  }
  var b = h.join('&');
  return {
    ...t,
    w_rid: md5(b + c),
    wts: s.toString(),
  };
};

export default class BiliApi {
  static async getRoomInfo(uid: number) {
    const res = await (
      await fetch('https://api.bilibili.com/x/space/wbi/acc/info?' + new URLSearchParams(getWRid(uid)).toString())
    ).json();
    if (res?.code === 0) {
      // TODO: 未开播时，会报错
      console.log(res);

      if (res.data.live_room.roomStatus)
        return {
          roomId: res.data.live_room.roomid as number,
          uname: res.data.name as string,
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
      await fetch('https://api.bilibili.com/x/relation/stat?vmid=' + uid)
    ).json();
    if (res && res.code === 0) {
      return res.data;
    }
  }
  static async getLoginQrcode() {
    const res = await fetch(
      'https://passport.bilibili.com/x/passport-login/web/qrcode/generate?source=main-mini'
    ).then((r) => r.json());
    if (res.code === 0 && res.data) {
      return res.data as {
        qrcode_key: string;
        url: string;
      };
    }
  }
  static async pollLoginStatus(qrcode_key: string) {
    const resp = await NodeFetch(
      `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${qrcode_key}&source=main_mini`
    );
    const res: any = await resp.json();
    if (res.code === 0 && res.data) {
      const cookieText = resp.headers.get('set-cookie');
      if (cookieText) {
        res.data.cookie = cookieText
          .split(/\s*[,;]\s*/)
          .filter((it) => it.includes('='))
          .reduce((map, cur) => {
            const [key, val] = cur.split('=');
            if (!['Path', 'Domain', 'Expires'].includes(key)) {
              map[key] = val;
            }
            return map;
          }, {} as Record<string, string>);
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

  static async sendLiveDanmaku(
    msgBody: {
      roomid: number;
      msg: string;
      bubble?: number;
      color?: number;
      mode?: number;
      fontsize?: number;
      rnd?: number;
    },
    cookie: NonNullable<Config['cookie']>
  ) {
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
    Object.keys(form).forEach((key) => {
      body.set(key, `${form[key]}`);
    });
    const res = await NodeFetch('https://api.live.bilibili.com/msg/send', {
      method: 'POST',
      headers: {
        Cookie: DataUtil.dataShowing(cookie.text),
      },
      body,
    }).then((r) => r.json());

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
    const res = await NodeFetch(
      'https://api.bilibili.com/x/web-interface/nav/stat',
      {
        headers: {
          Cookie: DataUtil.dataShowing(cookie.text),
        },
      }
    ).then((r) => r.json());

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
    const res: any = await NodeFetch(
      `https://api.bilibili.com/x/member/web/account?csrf=${DataUtil.dataShowing(
        cookie['bili_jct']
      )}`,
      {
        headers: {
          Cookie: DataUtil.dataShowing(cookie.text),
        },
      }
    ).then((r) => r.json());

    const res2 = await fetch(
      `https://api.bilibili.com/x/space/wbi/acc/info?${new URLSearchParams(getWRid(+DataUtil.dataShowing(
        cookie.DedeUserID
      ))).toString()}`
    ).then((r) => r.json());

    return {
      ...res,
      data: {
        ...res.data,
        ...(res2?.code === 0 ? res2.data : {}),
      },
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
      };
    };
  }
}

// @ts-ignore
ReadableStream.prototype[Symbol.asyncIterator] ??= async function* () {
  // @ts-ignore
  const reader = this.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
};
