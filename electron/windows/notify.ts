import { BrowserWindow, screen } from 'electron';

export const getNotifyWin = () => {
  const win = new BrowserWindow({
    width: screen.getPrimaryDisplay().workAreaSize.width,
    height: screen.getPrimaryDisplay().workAreaSize.height,
    transparent: true,
    focusable: false,
    frame: false,
    hasShadow: false,
    simpleFullscreen: true,
    alwaysOnTop: true,
    // fullscreen: true,
    autoHideMenuBar: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: false,
    },
  });
  win.setIgnoreMouseEvents(true, { forward: true });

  return win;
};
