import { join } from 'node:path';
import { BrowserWindow } from 'electron';
import * as remote from '@electron/remote/main';
import { getDanmakuWin } from './danmaku';
import { getSettingWin } from './setting';
import { getMusicWin } from './music';
import { getNotifyWin } from './notify';

export { getDanmakuWin } from './danmaku';

remote.initialize();

const devServerUrl = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

let danmakuWin: BrowserWindow | null = null;
let settingWin: BrowserWindow | null = null;
let musicWin: BrowserWindow | null = null;
let notifyWin: BrowserWindow | null = null;

export const showDanmakuWin = () => {
  if (!danmakuWin) {
    danmakuWin = getDanmakuWin();
    remote.enable(danmakuWin.webContents);
    if (process.env.VITE_DEV_SERVER_URL) {
      // electron-vite-vue#298
      danmakuWin.loadURL(devServerUrl + '#/danmaku');
      // Open devTool if the app is not packaged
      // danmakuWin.webContents.openDevTools()
    } else {
      danmakuWin.loadFile(indexHtml, {
        hash: '/danmaku',
      });
    }
  }
  danmakuWin.addListener('close', () => {
    danmakuWin = null;
  });
  danmakuWin.show();

  return danmakuWin;
};

export const showSettingWin = () => {
  if (!settingWin) {
    settingWin = getSettingWin();
    remote.enable(settingWin.webContents);
    if (process.env.VITE_DEV_SERVER_URL) {
      settingWin.loadURL(devServerUrl + '#/setting');
    } else {
      settingWin.loadFile(indexHtml, { hash: '/setting' });
    }
  }
  settingWin.addListener('close', () => {
    settingWin = null;
  });
  settingWin.show();

  return settingWin;
};

export const showMusicWin = () => {
  if (!musicWin) {
    musicWin = getMusicWin();
    remote.enable(musicWin.webContents);
    if (process.env.VITE_DEV_SERVER_URL) {
      musicWin.loadURL(devServerUrl + '#/music');
    } else {
      musicWin.loadFile(indexHtml, { hash: '/music' });
    }
  }
  musicWin.addListener('close', () => {
    musicWin = null;
  });
  musicWin.show();

  return musicWin;
};

export const showNotifyWin = () => {
  if (!notifyWin) {
    notifyWin = getNotifyWin();
    remote.enable(notifyWin.webContents);
    if (process.env.VITE_DEV_SERVER_URL) {
      notifyWin.loadURL(devServerUrl + '#/notify');
    } else {
      notifyWin.loadFile(indexHtml, { hash: '/notify' });
    }
    notifyWin.addListener('close', () => {
      notifyWin = null;
    });
  }
  // notifyWin.show();

  return notifyWin;
};

export const showCustomWin = (
  url: string,
  options: { windowOptions?: Electron.BrowserWindowConstructorOptions } = {}
) => {
  const win = new BrowserWindow({
    ...options.windowOptions,
  });
  // 判断是否为外部链接
  const isExternalUrl = /^(((https?)|(file)):\/\/)?\w+(\.\w+)+/.test(url);
  if (isExternalUrl) {
    win.loadURL(url);
  } else if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(devServerUrl + '#/music');
  } else {
    win.loadFile(indexHtml, { hash: '/music' });
  }
  win.show();

  return win;
};
