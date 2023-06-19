export default class DataUtil {
  static generateId() {
    return Math.random().toString(16);
  }

  static isBrowser() {
    return Boolean(typeof window !== 'undefined');
  }

  static parseRegExpRule(rule: string) {
    if (/^\/(.+)\/([ig]{0,})$/g.test(rule)) {
      const [, pattern, flags] = /^\/(.+)\/([ig]{0,})$/g.exec(rule) ?? [];
      if (pattern) {
        try {
          return new RegExp(pattern, flags);
        } catch (e) {}
      }
    }
  }

  /**
   * 判断文本是否匹配
   * @param rule 规则
   * @param text 代匹配文本
   */
  static isTextMatch(rule: string, text: string) {
    const reg = this.parseRegExpRule(rule);
    if (reg) {
      return reg.test(text);
    }
    return rule === text;
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
