import { ipcRenderer } from "electron";
import DataUtil from "@/utils/data.util";

const CHANNEL = "COMMON_CHANNEL";
const CHANNEL_BROADCAST = "CHANNEL_BROADCAST";
const SELF_ID = DataUtil.generateId();
const events = new Map();
const broadcastEvents = new Map<string, ((p?: any) => void)[]>();

class IpcRendererUtil {
  static initial() {
    ipcRenderer.on(CHANNEL, (event, args) => {
      const { id, payload } = args;
      const cb = events.get(id);
      if (cb) {
        cb(payload);
      }
    });
    ipcRenderer.on(CHANNEL_BROADCAST, (event, args) => {
      const { self, type, payload } = args;
      if (self === SELF_ID) return;
      const cbs = broadcastEvents.get(type);
      if (cbs) {
        cbs.forEach(cb => cb(payload));
      }
    });
  }

  static send(type: string, payload?: any) {
    return new Promise(resolve => {
      const id = DataUtil.generateId();
      events.set(id, resolve);
      payload = payload && JSON.parse(JSON.stringify(payload));
      ipcRenderer.send(CHANNEL, {
        id,
        type,
        payload
      });
    });
  }

  static broadcast(type: string, payload?: any) {
    payload = payload && JSON.parse(JSON.stringify(payload));
    ipcRenderer.send(CHANNEL_BROADCAST, {
      self: SELF_ID,
      type,
      payload
    });
  }

  static on(type: string, cb: (p?: any) => void) {
    const cbs = broadcastEvents.get(type) || [];
    cbs.push(cb);
    broadcastEvents.set(type, cbs);

    return () => cbs.splice(cbs.indexOf(cb), 1);
  }
}

export default IpcRendererUtil;
