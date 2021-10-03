export default class BiliApi {
  static async getRoomInfo(uid: number) {
    const res = await (
      await fetch("https://api.bilibili.com/x/space/acc/info?mid=" + uid)
    ).json();
    if (res && res.code === 0) {
      if (res.data.live_room.roomStatus)
        return {
          roomId: res.data.live_room.roomid as number,
          uname: res.data.name as string
        };
    }
    return null;
  }
  static async getUpInfo(uid: number) {
    const res = await (
      await fetch("https://api.bilibili.com/x/relation/stat?vmid=" + uid)
    ).json();
    if (res && res.code === 0) {
      return res.data;
    }
  }
}
