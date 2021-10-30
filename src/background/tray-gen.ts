import path from 'path';
import { app, Menu, nativeImage, Tray } from "electron";
import { windowGenerator, windows } from "./win-gen";

export let tray: Tray | null = null;

export const trayGenerator = () => {
  const iconName = process.platform === "win32" ? "favicon.ico" : "favicon.png";
  const icon = nativeImage.createFromPath(
    // @ts-ignore
    path.join(__static, iconName)
  );
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
      label: "数据统计",
      id: "stat",
      type: "checkbox",
      checked: false,
      click() {
        const checked = contextMenu.getMenuItemById("stat")?.checked ?? false;
        console.log(checked);
      }
    },
    { type: "separator" },
    {
      label: "退出程序",
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setToolTip("哔哩直播小助手");
  tray.setContextMenu(contextMenu);
};
