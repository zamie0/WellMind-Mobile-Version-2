const SLANG_MAP: Record<string, string> = {
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
};

const TYPO_MAP: Record<string, string> = {
  suicidel: 'suicidal',
  suiside: 'suicide',
  depresed: 'depressed',
  ancious: 'anxious',
  hopless: 'hopeless',
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
