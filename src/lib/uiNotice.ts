export type Notice = { message: string; actionLabel?: string; onAction?: () => void };
export const noticeEvent = 'nexo:notice';
export const dismissNoticeEvent = 'nexo:dismiss-notice';

export function showNotice(notice: Notice) {
  window.dispatchEvent(new CustomEvent<Notice>(noticeEvent, { detail: notice }));
}

export function dismissNotice() {
  window.dispatchEvent(new Event(dismissNoticeEvent));
}
