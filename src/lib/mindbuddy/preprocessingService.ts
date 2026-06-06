const SLANG_MAP: Record<string, string> = {
  // Common English contractions/abbreviations
  gonna: 'going to',
  wanna: 'want to',
  imma: 'i am going to',
  cant: "can't",
  dont: "don't",
  idk: 'i do not know',
  tbh: 'to be honest',
  rn: 'right now',
  u: 'you',
  ur: 'your',
  pls: 'please',
  fr: 'for real',
  ngl: 'not going to lie',
  imo: 'in my opinion',
  omg: 'oh my god',
  smh: 'shaking my head',
  fyi: 'for your information',
  irl: 'in real life',
  // Malaysian / Manglish particles (softeners — preserve meaning, strip tone confusion)
  lah: '',
  la: '',
  leh: '',
  lor: '',
  mah: '',
  wor: '',
  sia: '',
  kan: '',
  bah: '',
  wei: '',
  weh: '',
  eh: '',
  ah: '',
  // Malaysian negative / casual
  takde: 'no',
  tak: 'not',
  nak: 'want to',
  dah: 'already',
  ald: 'already',
  alr: 'already',
  betul: 'true',
  boleh: 'can',
  segan: 'shy',
  malu: 'embarrassed',
  sedih: 'sad',
  penat: 'tired',
  malas: 'lazy',
  risau: 'worried',
  gila: 'very',
  gilaa: 'very',
  susah: 'difficult',
  tension: 'stressed',
  // Intensifiers / emphasis
  sgt: 'very',
  sangat: 'very',
  betul2: 'really',
  'betul betul': 'really',
  rasa: 'feel',
  macam: 'like',
};

const TYPO_MAP: Record<string, string> = {
  suicidel: 'suicidal',
  suiside: 'suicide',
  depresed: 'depressed',
  ancious: 'anxious',
  hopless: 'hopeless',
  anikxious: 'anxious',
  depresion: 'depression',
  exausted: 'exhausted',
  exhuasted: 'exhausted',
};

const normalizeSlangAndTypos = (text: string) => {
  let normalized = text;

  Object.entries(SLANG_MAP).forEach(([from, to]) => {
    normalized = normalized.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
  });

  Object.entries(TYPO_MAP).forEach(([from, to]) => {
    normalized = normalized.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
  });

  return normalized;
};

export const preprocessText = (input: string) => {
  const lower = input.toLowerCase();
  const cleaned = lower.replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();
  const normalized = normalizeSlangAndTypos(cleaned).slice(0, 500);
  return normalized;
};
