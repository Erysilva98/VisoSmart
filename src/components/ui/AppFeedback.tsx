import { useEffect, useState } from 'react';
import { retryPendingSave } from '@/store/useStore';
import { useStorageStatus } from '@/lib/storageStatus';
import { dismissNoticeEvent, noticeEvent, type Notice } from '@/lib/uiNotice';

export function AppFeedback() {
  const storageStatus = useStorageStatus();
  const [notice, setNotice] = useState<Notice | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const receive = (event: Event) => {
      clearTimeout(timer);
      setNotice((event as CustomEvent<Notice>).detail);
      timer = setTimeout(() => setNotice(null), 10000);
    };
    const dismiss = () => { clearTimeout(timer); setNotice(null); };
    window.addEventListener(noticeEvent, receive);
    window.addEventListener(dismissNoticeEvent, dismiss);
    return () => { clearTimeout(timer); window.removeEventListener(noticeEvent, receive); window.removeEventListener(dismissNoticeEvent, dismiss); };
  }, []);

  if (storageStatus === 'error') return <div role="alert" className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-xl border border-red-200 bg-white p-3 text-xs shadow-lg md:bottom-24"><p className="flex-1 text-ink-800">Não foi possível salvar neste dispositivo. Seus dados continuam na tela.</p><button type="button" onClick={retryPendingSave} className="min-h-11 rounded-lg px-2 font-semibold text-primary-700">Tentar novamente</button></div>;
  if (!notice) return null;
  return <div role="status" className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-xl bg-ink-900 p-3 text-xs text-white shadow-lg md:bottom-24"><p className="flex-1">{storageStatus === 'saving' ? 'Salvando no dispositivo…' : notice.message}</p>{notice.onAction && <button type="button" onClick={() => { notice.onAction?.(); setNotice(null); }} className="min-h-11 rounded-lg px-2 font-semibold text-white underline">{notice.actionLabel ?? 'Desfazer'}</button>}</div>;
}
