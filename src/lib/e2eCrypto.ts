// Real end-to-end encryption for counselor chat.
// - Per-identity ECDH P-256 keypair (stored locally, private key never leaves device).
// - Per-chat AES-GCM symmetric key derived via ECDH between the two participants.
// - Each message has its own random 12-byte IV.
// Data at rest in localStorage is ciphertext only — the store never sees plaintext.

const KEY_STORE = 'wellmind-e2e-keys-v1';

interface StoredKey {
  id: string;
  publicKeyJwk: JsonWebKey;
  privateKeyJwk: JsonWebKey;
}

interface KeyBook {
  identities: Record<string, StoredKey>;
// Public-only keys for remote counselors (simulated counselors have their keypair generated locally too,
  // but we expose only the public side to the encryption flow).
  publicKeys: Record<string, JsonWebKey>;
}

const loadBook = (): KeyBook => {
  try {
    const raw = localStorage.getItem(KEY_STORE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { identities: {}, publicKeys: {} };
};

const saveBook = (book: KeyBook) => {
  localStorage.setItem(KEY_STORE, JSON.stringify(book));
};

const subtle = () => {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Web Crypto not available');
  }
  return window.crypto.subtle;
};

const b64 = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s: string) =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** Ensure a local identity has an ECDH keypair. Returns the public JWK. */
export async function ensureIdentity(id: string): Promise<JsonWebKey> {
  const book = loadBook();
  if (book.identities[id]) return book.identities[id].publicKeyJwk;

  const pair = await subtle().generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits']
  );
  const publicKeyJwk = await subtle().exportKey('jwk', pair.publicKey);
  const privateKeyJwk = await subtle().exportKey('jwk', pair.privateKey);
  book.identities[id] = { id, publicKeyJwk, privateKeyJwk };
  book.publicKeys[id] = publicKeyJwk;
  saveBook(book);
  return publicKeyJwk;
}

/** Register a remote counselor's public key (or auto-generate one for simulated counselors). */
export async function ensureCounselorPublicKey(counselorId: string): Promise<JsonWebKey> {
  const book = loadBook();
  if (book.publicKeys[counselorId]) return book.publicKeys[counselorId];

  // Simulated counselor: generate a keypair so derivation works. In a real server-backed flow
  // this would be fetched from a key directory instead.
  const pair = await subtle().generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits']
  );
  const publicKeyJwk = await subtle().exportKey('jwk', pair.publicKey);
  const privateKeyJwk = await subtle().exportKey('jwk', pair.privateKey);
  book.identities[counselorId] = { id: counselorId, publicKeyJwk, privateKeyJwk };
  book.publicKeys[counselorId] = publicKeyJwk;
  saveBook(book);
  return publicKeyJwk;
}

async function importPrivate(jwk: JsonWebKey) {
  return subtle().importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveKey']
  );
}
async function importPublic(jwk: JsonWebKey) {
  return subtle().importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  );
}

/** Derive a shared AES-GCM key between localId and counselorId. */
async function deriveSharedKey(localId: string, counselorId: string): Promise<CryptoKey> {
  const book = loadBook();
  const local = book.identities[localId];
  const counselorPub = book.publicKeys[counselorId];
  if (!local || !counselorPub) throw new Error('Missing keys for E2E derivation');

  const privKey = await importPrivate(local.privateKeyJwk);
  const pubKey = await importPublic(counselorPub);

  return subtle().deriveKey(
    { name: 'ECDH', public: pubKey },
    privKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface Ciphertext {
  iv: string;
  data: string;
}

export async function encryptMessage(
  localId: string,
  counselorId: string,
  plaintext: string
): Promise<Ciphertext> {
  const key = await deriveSharedKey(localId, counselorId);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plaintext);
  const ct = await subtle().encrypt({ name: 'AES-GCM', iv }, key, enc);
  return { iv: b64(iv.buffer), data: b64(ct) };
}

export async function decryptMessage(
  localId: string,
  counselorId: string,
  ct: Ciphertext
): Promise<string> {
  try {
    const key = await deriveSharedKey(localId, counselorId);
    const pt = await subtle().decrypt(
      { name: 'AES-GCM', iv: fromB64(ct.iv) },
      key,
      fromB64(ct.data)
    );
    return new TextDecoder().decode(pt);
  } catch {
    return '🔒 [unable to decrypt]';
  }
}

/** Short fingerprint of the shared secret — UI can show this so users can verify. */
export async function chatFingerprint(localId: string, counselorId: string): Promise<string> {
  const book = loadBook();
  const a = book.publicKeys[localId];
  const b = book.publicKeys[counselorId];
  if (!a || !b) return '';
  const blob = new TextEncoder().encode(JSON.stringify([a.x, a.y, b.x, b.y].sort()));
  const hash = await subtle().digest('SHA-256', blob);
  const hex = Array.from(new Uint8Array(hash))
    .slice(0, 6)
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
  return hex.match(/.{1,4}/g)?.join(' ') ?? hex;
}
