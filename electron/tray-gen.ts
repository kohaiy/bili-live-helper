import path from 'node:path';
import { app, Menu, nativeImage, Tray } from "electron";
import { showDanmakuWin, showMusicWin, showSettingWin } from './windows';

export let tray: Tray | null = null;

export const trayGenerator = () => {
  const iconName = process.platform === "win32" ? "favicon.ico" : "favicon.png";

  const icon = nativeImage.createFromPath(
    path.join(process.env.PUBLIC, iconName)
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
        showDanmakuWin();
      }
    },
    {
      label: "点歌姬",
      click: () => {
        showMusicWin();
      }
    },
    { type: "separator" },
    {
      label: "控制面板",
      click: () => {
        showSettingWin();
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
