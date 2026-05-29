import type { ContradictionSignals, ProtectiveFactors, SafetyFlags, SafetyIntentCategory } from './types';

export const SAFE_SLANG_LIST = [
  'my mum gonna kill me',
  'assignment killed me',
  'die lah',
  'im cooked',
  "i'm cooked",
  'killed my exam',
  'this exam killed me',
  'bro im dead',
  "bro i'm dead",
  'gg im cooked',
  'gg i am cooked',
];

export const DIRECT_SELF_HARM_PATTERNS = [
  'i want to kill myself',
  'i wanna kill myself',
  'i want to cut myself',
  'i wanna cut myself',
  'i cut myself',
  'i cut myself already',
  'i cut myself ald',
  'i want to hurt myself',
  'i wanna hurt myself',
  'i hurt myself',
  'i should die',
  'i want to die',
  'i wanna die',
  'i want suicide',
  'i want to suicide',
  'i wanna suicide',
  'i plan suicide',
  'i plan to kill myself',
  'i am going to hurt myself',
  'i want to end it all',
];

const HOPLESSNESS_PATTERNS = [
  'no reason to live',
  'nothing matters anymore',
  'there is no point in living',
  'life is not worth living',
  'i cannot go on',
  'i give up on life',
  'i am hopeless',
  'no hope for me',
];

const PROTECTIVE_FACTOR_PATTERNS = {
  support: [
    'my friends helped me',
    'i talked to my lecturer',
    'i talked to my friend',
    'my family supports me',
    'someone listened to me',
  ],
  resilience: [
    'i will try again tomorrow',
    'i still want to improve',
    'i can handle this',
    'i will keep trying',
    'i want to get better',
  ],
  future: [
    'tomorrow',
    'next week',
    'next month',
    'in the future',
    'my plan is',
  ],
};

const HUMOR_MARKERS = ['lol', 'lmao', 'haha', 'hehe', '💀', 'xd', 'jk', 'just kidding', 'bro'];

const DIRECT_SELF_HARM_REGEX: RegExp[] = [
  /\bi\s+(want|wanna|plan|planned|feel like|should)\s+(to\s+)?(kill\s+myself|hurt\s+myself|cut\s+myself|die|suicide)\b/,
  /\bi\s+(cut|hurt)\s+myself\b/,
  /\b(kill|hurt|cut)\s+myself\b/,
  /\bi\s+(want|wanna|plan|planned|feel like|should)\s+(to\s+)?suicide\b/,
  /\bshould\s+(just\s+)?die\b/,
  /\bdont\s+wanna\s+exist\b/,
  /\bdo\s+not\s+want\s+to\s+exist\b/,
  /\bcant\s+continue\s+anymore\b/,
  /\bcannot\s+continue\s+anymore\b/,
  /\bend\s+my\s+life\b/,
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const HARMFUL_ACTION_TOKENS = ['kill', 'cut', 'hurt', 'suicide', 'die', 'end', 'disappear'];
const SELF_REFERENCE_TOKENS = ['myself', 'me', 'my life', 'alive', 'exist'];

const PASSIVE_IDEATION_REGEX: RegExp[] = [
  /\bdont\s+wanna\s+exist\b/,
  /\bdo\s+not\s+want\s+to\s+exist\b/,
  /\bshould\s+(just\s+)?die\b/,
  /\bcant\s+continue\s+anymore\b/,
  /\bcannot\s+continue\s+anymore\b/,
  /\bi\s+wish\s+i\s+was\s+dead\b/,
];

export const getSafeSlangMatches = (text: string) => SAFE_SLANG_LIST.filter((phrase) => text.includes(phrase));

export const detectProtectiveFactors = (text: string, contextText: string): ProtectiveFactors => {
  const combined = `${text} ${contextText}`;
  const reasons: string[] = [];

  const supportHits = PROTECTIVE_FACTOR_PATTERNS.support.filter((pattern) => combined.includes(pattern)).length;
  const resilienceHits = PROTECTIVE_FACTOR_PATTERNS.resilience.filter((pattern) => combined.includes(pattern)).length;
  const futureHits = PROTECTIVE_FACTOR_PATTERNS.future.filter((pattern) => combined.includes(pattern)).length;

  if (supportHits > 0) reasons.push('protective factor detected: social support');
  if (resilienceHits > 0) reasons.push('protective factor detected: resilience language');
  if (futureHits > 0) reasons.push('protective factor detected: future-oriented language');

  const support_system_detection = clamp01(supportHits / 2);
  const resilience_detection = clamp01(resilienceHits / 2);
  const future_oriented_detection = clamp01(futureHits / 3);

  const protective_factor_score = clamp01(
    support_system_detection * 0.4 +
    resilience_detection * 0.35 +
    future_oriented_detection * 0.25
  );

  return {
    protective_factor_score,
    resilience_detection,
    support_system_detection,
    future_oriented_detection,
    reasons,
  };
};

export const detectContradictionSignals = (text: string, contextText: string): ContradictionSignals => {
  const combined = `${text} ${contextText}`;
  const reasons: string[] = [];

  const humorHits = HUMOR_MARKERS.filter((marker) => combined.includes(marker)).length;
  const figurativeHits = [
    'this game is killing me',
    'assignment killed me',
    'bro im dead',
    "bro i'm dead",
    'i am dead tired',
    'die lah',
    'im cooked',
    "i'm cooked",
    'gg im cooked',
    'gg i am cooked',
  ].filter((pattern) => combined.includes(pattern)).length;

  const sarcasmHits = ['yeah right', 'as if', 'sure lol', 'obviously not'].filter((p) => combined.includes(p)).length;

  const humor_context_detection = clamp01(humorHits / 4);
  const figurative_language_score = clamp01(figurativeHits / 2.5);
  const sarcasm_confidence = clamp01(sarcasmHits / 2 + humor_context_detection * 0.25);

  if (humor_context_detection > 0) reasons.push('humor context detected');
  if (figurative_language_score > 0) reasons.push('figurative language detected');
  if (sarcasm_confidence > 0) reasons.push('possible sarcasm or exaggeration detected');

  return {
    sarcasm_confidence,
    figurative_language_score,
    humor_context_detection,
    figurative_slang_detected: figurativeHits > 0,
    humor_detected: humorHits > 0,
    reasons,
  };
};

export const detectSafetyFlags = (text: string, contextText: string): SafetyFlags => {
  const combined = `${text} ${contextText}`;

  const directSelfHarmMatches = DIRECT_SELF_HARM_PATTERNS.filter((pattern) => text.includes(pattern));
  const regexDirectMatches = DIRECT_SELF_HARM_REGEX.filter((re) => re.test(text)).map((re) => re.source);

  const harmfulActionMatches = HARMFUL_ACTION_TOKENS.filter((token) => text.includes(token));
  const selfReferenceMatches = SELF_REFERENCE_TOKENS.filter((token) => text.includes(token));
  const harmful_action_detected = harmfulActionMatches.length > 0;
  const self_reference_detected = selfReferenceMatches.length > 0;

  const passiveIdeationMatches = PASSIVE_IDEATION_REGEX.filter((re) => re.test(text)).map((re) => re.source);
  const passive_ideation_detected = passiveIdeationMatches.length > 0;

  const self_harm_behavior_detected =
    /\bi\s+(cut|hurt)\s+myself\b/.test(text) ||
    /\bi\s+(cut|hurt)\s+myself\s+(already|ald|yesterday|today)\b/.test(text);

  const actionPlusSelfIntent = harmful_action_detected && self_reference_detected;

  const allDirectMatches = [...new Set([
    ...directSelfHarmMatches,
    ...regexDirectMatches,
    ...(actionPlusSelfIntent ? ['harmful action + self reference combination'] : []),
    ...passiveIdeationMatches,
    ...(self_harm_behavior_detected ? ['self-harm behavior signal'] : []),
  ])];

  const hopelessnessMatches = HOPLESSNESS_PATTERNS.filter((pattern) => combined.includes(pattern));
  const escalating_distress_detected = /(again|still|every day|everyday|for weeks|for months)/.test(combined) &&
    /(hopeless|empty|exhausted|anxious|depressed|panic|cant cope|cannot cope)/.test(combined);

  const figurative_slang_detected = SAFE_SLANG_LIST.some((phrase) => combined.includes(phrase));
  const humor_detected = HUMOR_MARKERS.some((marker) => combined.includes(marker));

  const safety_intent_categories: SafetyIntentCategory[] = [];
  if (allDirectMatches.length > 0) safety_intent_categories.push('direct_self_harm');
  if (hopelessnessMatches.length > 0 || passive_ideation_detected) safety_intent_categories.push('passive_hopelessness');
  if (escalating_distress_detected) safety_intent_categories.push('emotional_distress');
  if (figurative_slang_detected || humor_detected) safety_intent_categories.push('figurative_stress');
  if (figurative_slang_detected) safety_intent_categories.push('safe_slang');

  const reasons: string[] = [];
  if (allDirectMatches.length > 0) reasons.push('direct self-harm phrase detected');
  if (actionPlusSelfIntent) reasons.push('harmful action + self-reference combination detected');
  if (passive_ideation_detected) reasons.push('passive suicidal ideation detected');
  if (self_harm_behavior_detected) reasons.push('self-harm behavior detected');
  if (hopelessnessMatches.length > 0) reasons.push('hopelessness detected');
  if (escalating_distress_detected) reasons.push('escalating distress detected');
  if (figurative_slang_detected) reasons.push('figurative slang detected');
  if (humor_detected) reasons.push('humor detected');

  return {
    figurative_slang_detected,
    humor_detected,
    direct_self_harm_detected: allDirectMatches.length > 0,
    hopelessness_detected: hopelessnessMatches.length > 0,
    escalating_distress_detected,
    harmful_action_detected,
    self_reference_detected,
    passive_ideation_detected,
    self_harm_behavior_detected,
    safety_intent_categories,
    directSelfHarmMatches: allDirectMatches,
    reasons,
  };
};
