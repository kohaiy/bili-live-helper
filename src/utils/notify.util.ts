import IpcRendererUtil from './ipc-renderer.util';
import type { NotificationConfig } from '@arco-design/web-vue';

export const sendNotify = (
  payload: NotificationConfig & {
    type?: 'info' | 'error' | 'warning' | 'success';
    markdown?: boolean;
  }
) => {
  IpcRendererUtil.send('notify', payload);
};
