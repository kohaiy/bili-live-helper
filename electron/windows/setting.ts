import { BrowserWindow } from 'electron';

export const getSettingWin = () => {
    const settingWin = new BrowserWindow({
        width: 560,
        height: 420,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: false,
        }
    });

    return settingWin;
};