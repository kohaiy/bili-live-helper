import { ipcMain, BrowserWindow } from "electron";
import DataUtil from "../../utils/data.util";

type CALLBACK = (payload: any) => Promise<any> | any;

if (DataUtil.isBrowser()) {
  throw new Error(`[ipc-main.util.ts] 不能在渲染线程引用， ${__filename}`);
}

const CHANNEL = "COMMON_CHANNEL";
const CHANNEL_BROADCAST = "CHANNEL_BROADCAST";
const events = new Map<string, CALLBACK>();

class IpcMainUtil {
  static initial() {
    events.clear();
    ipcMain.on(CHANNEL, async (event, args) => {
      const { id, type, payload } = args as {
        id: string;
        type: string;
        payload: any;
      };
      const cb = events.get(type);
      if (cb) {
        const res = await cb(payload);
        event.sender.send(CHANNEL, {
          id,
          payload: res
        });
      } else {
        event.sender.send(CHANNEL, {
          id
        });
      }
    });
    ipcMain.on(CHANNEL_BROADCAST, (event, args) => {
      const { self, type, payload } = args;
      BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send(CHANNEL_BROADCAST, {
          self,
          type,
          payload
        });
      });
    });
  }

  static on(type: string, callback: CALLBACK) {
    events.set(type, callback);
  }
}

export default IpcMainUtil;
