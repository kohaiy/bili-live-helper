import IpcRendererUtil from './ipc-renderer.util';
import type { NotificationConfig } from '@arco-design/web-vue';

export const sendNotify = (
  payload: NotificationConfig & {
    type?: 'info' | 'error' | 'warning' | 'success';
  }
) => {
  IpcRendererUtil.send('notify', payload);
};
