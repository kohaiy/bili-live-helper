"use strict";

import {
  app,
  protocol,
  BrowserWindow
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
// import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import ConfigUtil from "./utils/config.util";
import IpcMainUtil from "./utils/ipc-main.util";
import { windowGenerator } from './win-gen';
import { trayGenerator } from './tray-gen';

ConfigUtil.load();
IpcMainUtil.initial();

const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== "darwin") {
  //   app.quit();
  // }
});

// app.on("activate", () => {
//   // On macOS it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) windowGenerator.danmaku();
// });

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", async () => {
//   if (isDevelopment && !process.env.IS_TEST) {
//     // Install Vue Devtools
//     // try {
//     //   await installExtension(VUEJS3_DEVTOOLS);
//     // } catch (e) {
//     //   console.error("Vue Devtools failed to install:", e.toString());
//     // }
//   }
//   windowGenerator.danmaku();
// });
app.whenReady().then(() => {
  createProtocol('app');
  windowGenerator.danmaku();
  trayGenerator();
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
