import { BrowserWindow } from 'electron';

export const getDanmakuWin = () => {
    const danmakuWin = new BrowserWindow({
        width: 360,
        height: 380,
        alwaysOnTop: true,
        transparent: true, // process.platform !== 'win32',
        frame: false,
        opacity: 1,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: false,
        }
    });

    danmakuWin.webContents.session.webRequest.onBeforeSendHeaders((detail, cb) => {
        let { requestHeaders } = detail;
    
        requestHeaders = Object.assign(requestHeaders, {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 9; PCT-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.64 HuaweiBrowser/10.0.3.311 Mobile Safari/537.36',
            Referer: undefined,
        });
        cb({ requestHeaders });
    });

    return danmakuWin;
};