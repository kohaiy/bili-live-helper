export default class BiliGiftStyleUtil {
  static async load() {
    const res = await fetch(
      "https://api.live.bilibili.com/xlive/web-room/v1/giftPanel/giftConfig?platform=pc&room_id=55&area_parent_id=11&area_id=377"
    );
    const {
      data: { list }
    } = await res.json();
    const styleTxt = (list as { id: number; gif: string }[])
      .map(({ id, gif }) => {
        return `.gift-${id} { background-image: url(${gif}) } `;
      })
      .join("\n");
    const style$ = document.createElement("style");
    style$.innerHTML = styleTxt;
    document.head.append(style$);
  }
}
