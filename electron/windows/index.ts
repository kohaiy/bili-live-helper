import { join } from 'node:path'
import { BrowserWindow } from 'electron';
import * as remote from '@electron/remote/main'
import { getDanmakuWin } from './danmaku';
import { getSettingWin } from './setting';
import { getMusicWin } from './music';

export { getDanmakuWin } from './danmaku';

remote.initialize();

const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

let danmakuWin: BrowserWindow | null = null;
let settingWin: BrowserWindow | null = null;
let musicWin: BrowserWindow | null = null;

export const showDanmakuWin = () => {
    if (!danmakuWin) {
        danmakuWin = getDanmakuWin();
        remote.enable(danmakuWin.webContents);
        if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
            danmakuWin.loadURL(url + '#/danmaku')
            // Open devTool if the app is not packaged
            // danmakuWin.webContents.openDevTools()
        } else {
            danmakuWin.loadFile(indexHtml + '#/danmaku')
        }
    }
    danmakuWin.addListener("close", () => {
        danmakuWin = null;
    });
    danmakuWin.show();

    return danmakuWin;
}

export const showSettingWin = () => {
    if (!settingWin) {
        settingWin = getSettingWin();
        remote.enable(settingWin.webContents);
        if (process.env.VITE_DEV_SERVER_URL) {
            settingWin.loadURL(url + '#/setting')
        } else {
            settingWin.loadFile(indexHtml + '#/setting')
        }
    }
    settingWin.addListener("close", () => {
        settingWin = null;
    });
    settingWin.show();

    return settingWin;
}

export const showMusicWin = () => {
    if (!musicWin) {
        musicWin = getMusicWin();
        remote.enable(musicWin.webContents);
        if (process.env.VITE_DEV_SERVER_URL) {
            musicWin.loadURL(url + '#/music')
        } else {
            musicWin.loadFile(indexHtml + '#/music')
        }
    }
    musicWin.addListener("close", () => {
        musicWin = null;
    });
    musicWin.show();

    return musicWin;
}