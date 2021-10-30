import { BrowserWindow } from 'electron';

export type WINDOWS_TYPE = "danmaku" | "setting" | "music";

export const windows: Record<WINDOWS_TYPE, BrowserWindow | null> = {
  danmaku: null,
  setting: null,
  music: null
};

export const windowGenerator: Record<WINDOWS_TYPE, () => void> = {
  danmaku: async () => {
    windows.danmaku = new BrowserWindow({
      width: 360,
      height: 380,
      alwaysOnTop: true,
      transparent: true, // process.platform !== 'win32',
      frame: false,
      opacity: 1,
      hasShadow: false,
      webPreferences: {
        nodeIntegration: (process.env
          .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        enableRemoteModule: true,
        webSecurity: false
      }
    });

    windows.danmaku.addListener("close", () => {
      windows.danmaku = null;
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await windows.danmaku.loadURL(
        (process.env.WEBPACK_DEV_SERVER_URL as string) + "#/danmaku"
      );
      // if (!process.env.IS_TEST) windows.danmaku.webContents.openDevTools();
    } else {
      windows.danmaku.loadURL("app://./index.html/#/danmaku");
    }
  },
  setting: async () => {
    windows.setting = new BrowserWindow({
      width: 560,
      height: 420,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: (process.env
          .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        enableRemoteModule: true,
        webSecurity: false
      }
    });

    windows.setting.addListener("close", () => {
      windows.setting = null;
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await windows.setting.loadURL(
        (process.env.WEBPACK_DEV_SERVER_URL as string) + "#/setting"
      );
    } else {
      windows.setting.loadURL("app://./index.html/#/setting");
    }
  },
  music: async () => {
    windows.music = new BrowserWindow({
      width: 300,
      height: 180,
      transparent: true,
      frame: false,
      hasShadow: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: (process.env
          .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        enableRemoteModule: true,
        webSecurity: false
      }
    });

    windows.music.addListener("close", () => {
      windows.music = null;
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await windows.music.loadURL(
        (process.env.WEBPACK_DEV_SERVER_URL as string) + "#/music"
      );
    } else {
      windows.music.loadURL("app://./index.html/#/music");
    }
  }
};