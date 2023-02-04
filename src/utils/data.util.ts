export default class DataUtil {
  static generateId() {
    return Math.random().toString(16);
  }

  static isBrowser() {
    return Boolean(typeof window !== 'undefined');
  }

  /**
   * 数据脱敏
   * @param data 原始数据
   * @returns 脱敏后的数据
   */
  static dataMarking(data: string) {
    return window.btoa('-'.repeat(100) + data + '-'.repeat(100));
  }
  /**
   * 数据脱敏还原
   * @param data 脱敏后的数据
   * @returns 原始数据
   */
  static dataShowing(data: string) {
    return window.atob(data).slice(100, -100);
  }
}
