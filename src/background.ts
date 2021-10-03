"use strict";

import path from "path";
import {
  app,
  Menu,
  Tray,
  nativeImage,
  protocol,
  BrowserWindow
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
// import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import ConfigUtil from "./utils/main/config.util";
import IpcMainUtil from "./utils/main/ipc-main.util";

ConfigUtil.load();
IpcMainUtil.initial();

const isDevelopment = process.env.NODE_ENV !== "production";
let tray = null;
type WINDOWS_TYPE = "danmaku" | "setting" | "music";
const windows: Record<WINDOWS_TYPE, BrowserWindow | null> = {
  danmaku: null,
  setting: null,
  music: null
};
// Menu.setApplicationMenu(null);
const windowGenerator: Record<WINDOWS_TYPE, () => void> = {
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
      createProtocol("app");
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
      createProtocol("app");
      windows.setting.loadURL("app://./index.html/#/setting");
    }
  },
  music: async () => {
    windows.music = new BrowserWindow({
      width: 300,
      height: 200,
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
      createProtocol("app");
      windows.music.loadURL("app://./index.html/#/music");
    }
  }
};

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) windowGenerator.danmaku();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    //   await installExtension(VUEJS3_DEVTOOLS);
    // } catch (e) {
    //   console.error("Vue Devtools failed to install:", e.toString());
    // }
  }
  windowGenerator.danmaku();
});
app.whenReady().then(() => {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "../public/logo2.png")
  );
  icon.resize({
    width: 10,
    height: 10
  });
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "bili 弹幕小助手 - by柯灰",
      enabled: false
    },
    {
      label: "弹幕姬",
      click: () => {
        if (!windows.danmaku) {
          windowGenerator.danmaku();
        }
        if (!windows.danmaku?.isAlwaysOnTop()) {
          windows.danmaku?.setAlwaysOnTop(true);
          setTimeout(() => {
            windows.danmaku?.setAlwaysOnTop(false);
            // windows.danmaku?.focus();
          }, 500);
        }
      }
    },
    {
      label: "点歌姬",
      click: () => {
        if (!windows.music) {
          windowGenerator.music();
        }
        if (!windows.music?.isAlwaysOnTop()) {
          windows.music?.setAlwaysOnTop(true);
          setTimeout(() => {
            windows.music?.setAlwaysOnTop(false);
            // windows.danmaku?.focus();
          }, 500);
        }
      }
    },
    { type: "separator" },
    {
      label: "控制面板",
      click: () => {
        if (!windows.setting) {
          windowGenerator.setting();
        }
        if (!windows.setting?.isAlwaysOnTop()) {
          windows.setting?.setAlwaysOnTop(true);
          setTimeout(() => {
            windows.setting?.setAlwaysOnTop(false);
            // windows.danmaku?.focus();
          }, 500);
        }
      }
    },
    {
      label: "数据统计"
    },
    { type: "separator" },
    {
      label: "退出程序",
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setToolTip("bili 直播助手");
  tray.setContextMenu(contextMenu);
});

// app.on("browser-window-created", (event, window) => {
//   console.log("nbrowser-window-created");
//   console.log(window);
//   window.webContents.on("did-finish-load", () => {
//     window.webContents.send("initialize", ConfigUtil.get());
//   });
// });
// ipcMain.on("initialize", event => {
//   event.returnValue = ConfigUtil.get();
// });

IpcMainUtil.on("initialize", () => {
  return ConfigUtil.get();
});
/**
 *
 */
IpcMainUtil.on("saveConfig", config => {
  ConfigUtil.save(config);
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send("configUpdated", config);
  });
  return true;
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
