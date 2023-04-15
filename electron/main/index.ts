import './initialize';
import {
  app,
  BrowserWindow,
  globalShortcut,
  Menu,
  ipcMain,
  shell,
} from 'electron';
import { release } from 'node:os';
import { trayGenerator } from '../tray-gen';
import ConfigUtil from '../utils/config.util';
import IpcMainUtil from '../utils/ipc-main.util';
import { showCustomWin, showDanmakuWin, showNotifyWin } from '../windows';
// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
ConfigUtil.load();
IpcMainUtil.initial();
// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// let win: BrowserWindow | null = null
// Here, you can also use other preload
// const preload = join(__dirname, '../preload/index.js')
// const url = process.env.VITE_DEV_SERVER_URL
// const indexHtml = join(process.env.DIST, 'index.html')

// async function createWindow() {
//   win = new BrowserWindow({
//     title: 'Main window',
//     icon: join(process.env.PUBLIC, 'favicon.ico'),
//     webPreferences: {
//       preload,
//       // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
//       // Consider using contextBridge.exposeInMainWorld
//       // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   })

//   if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
//     win.loadURL(url)
//     // Open devTool if the app is not packaged
//     win.webContents.openDevTools()
//   } else {
//     win.loadFile(indexHtml)
//   }

//   // Test actively push message to the Electron-Renderer
//   win.webContents.on('did-finish-load', () => {
//     win?.webContents.send('main-process-message', new Date().toLocaleString())
//   })

//   // Make all links open with the browser, not with the application
//   win.webContents.setWindowOpenHandler(({ url }) => {
//     if (url.startsWith('https:')) shell.openExternal(url)
//     return { action: 'deny' }
//   })
// }

app
  .whenReady()
  .then(() => {
    globalShortcut.register('CommandOrControl+Enter', () => {
      console.log('Electron loves global shortcuts!');
      showDanmakuWin().webContents.send('SEND_DANMAKU');
    });
  })
  .then(() => {
    showDanmakuWin();
    showNotifyWin();
    trayGenerator();
  });

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') app.quit()
});

// app.on('second-instance', () => {
//   if (win) {
//     // Focus on the main window if the user tried to open another
//     if (win.isMinimized()) win.restore()
//     win.focus()
//   }
// })

// app.on('activate', () => {
//   const allWindows = BrowserWindow.getAllWindows()
//   if (allWindows.length) {
//     allWindows[0].focus()
//   } else {
//     createWindow()
//   }
// })

// New window example arg: new windows url
// ipcMain.handle('open-win', (_, arg) => {
//   const childWindow = new BrowserWindow({
//     webPreferences: {
//       preload,
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   })

//   if (process.env.VITE_DEV_SERVER_URL) {
//     childWindow.loadURL(`${url}#${arg}`)
//   } else {
//     childWindow.loadFile(indexHtml, { hash: arg })
//   }
// })

IpcMainUtil.on('initialize', () => {
  return ConfigUtil.get();
});
/**
 *
 */
IpcMainUtil.on('saveConfig', (config) => {
  ConfigUtil.save(config);
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('configUpdated', config);
  });
  return true;
});

IpcMainUtil.on(
  'show-context-menu',
  (payload: { menu: { key: string; label: string }[]; data: any }, event) => {
    return new Promise((resolve) => {
      const menu = Menu.buildFromTemplate(
        payload.menu.map(({ key, label }) => ({
          label,
          click: () => {
            resolve({ key, data: payload.data });
          },
        }))
      );
      menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
      menu.on('menu-will-close', () => {
        setTimeout(() => {
          resolve(null);
        });
      });
    });
  }
);

IpcMainUtil.on('open-url', (url) => {
  shell.openExternal(url);
});

IpcMainUtil.on('open-window', (payload) => {
  showCustomWin(payload.url, payload.options);
});

IpcMainUtil.on('notify', (payload) => {
  showNotifyWin().webContents.send('notify', payload);
});
