import { BrowserWindow } from 'electron';

export const getMusicWin = () => {
    const musicWin = new BrowserWindow({
        width: 300,
        height: 180,
        transparent: true,
        frame: false,
        // hasShadow: false,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: false,
        }
    });

    musicWin.webContents.session.webRequest.onBeforeSendHeaders((detail, cb) => {
        let { url, requestHeaders } = detail;

        requestHeaders = Object.assign(requestHeaders, {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 9; PCT-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.64 HuaweiBrowser/10.0.3.311 Mobile Safari/537.36',
            Referer: /^https:\/\/music\.163\.com/.test(url) ? 'https://music.163.com/' : undefined,
            'Cookie': '',
        });
        cb({ requestHeaders });
    });

    return musicWin;
};