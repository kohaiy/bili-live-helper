export default class DataUtil {
  static generateId() {
    return Math.random().toString(16);
  }

  static isBrowser() {
    return Boolean(typeof window !== 'undefined');
  }
}
