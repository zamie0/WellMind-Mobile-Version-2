import { useEffect, useState } from 'react';
import { decryptMessage } from '@/lib/e2eCrypto';
import type { EncryptedPayload } from '@/types/wellmind';

/** Hook: decrypt a ciphertext for display. Returns plaintext or a placeholder. */
export function useDecrypted(
  localId: string | undefined,
  peerId: string | undefined,
  payload: EncryptedPayload | string | undefined
): string {
  const [text, setText] = useState<string>('🔒 decrypting…');

  useEffect(() => {
    let cancelled = false;
    if (!payload) { setText(''); return; }
    if (typeof payload === 'string') { setText(payload); return; }
    if (!localId || !peerId) { setText('🔒 encrypted'); return; }
    decryptMessage(localId, peerId, payload).then((pt) => {
      if (!cancelled) setText(pt);
    });
    return () => { cancelled = true; };
  }, [localId, peerId, typeof payload === 'object' ? payload?.iv : payload, typeof payload === 'object' ? payload?.data : '']);

  return text;
}
