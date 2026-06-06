import type { ContradictionSignals, ProtectiveFactors, SafetyFlags, SafetyIntentCategory } from './types';

export const SAFE_SLANG_LIST = [
    'my mum gonna kill me',
    'my mom gonna kill me',
    'assignment killed me',
    'die lah',
    'die la',
    'mati lah',
    'mati la',
    'im cooked',
    "i'm cooked",
    'killed my exam',
    'this exam killed me',
    'exam killed me',
    'bro im dead',
    "bro i'm dead",
    'gg im cooked',
    'gg i am cooked',
    'i am dead tired',
    'dead tired',
    'this is killing me lah',
    'this is killing me la',
    'gila la',
    'gila lah',
    'tension gila',
    'stress gila',
    'i want to die lol',
    'i wanna die lol',
    'die lol',
    'want to die haha',
    'wanna die haha',
    'i could die from embarrassment',
    'killing it',
    'kill it',
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
    'i want to hit myself',
    'i wanna hit myself',
    'i hit myself',
    'i want to punch myself',
    'i wanna punch myself',
    'i punch myself',
    'i want to scratch myself',
    'i wanna scratch myself',
    'i scratch myself',
    'i want to burn myself',
    'i wanna burn myself',
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
    'i want to hang myself',
    'i wanna hang myself',
    'i want to choke myself',
    'i wanna choke myself',
    'i want to starve myself',
    'i wanna starve myself',
    'i want to punish myself',
    'i wanna punish myself',
];

/** Violence or harm directed at other people — not treated as self-harm / suicide crisis. */
export const HARM_TO_OTHERS_PATTERNS = [
    'hurt others',
    'hurt other people',
    'hurt someone',
    'hurt somebody',
    'want to hurt him',
    'wanna hurt him',
    'want to hurt her',
    'wanna hurt her',
    'want to hurt them',
    'wanna hurt them',
    'want to kill him',
    'wanna kill him',
    'want to kill her',
    'wanna kill her',
    'want to kill them',
    'wanna kill them',
    'want to hit him',
    'wanna hit him',
    'want to hit her',
    'wanna hit her',
    'want to hit them',
    'wanna hit them',
    'want to punch him',
    'wanna punch someone',
    'want to attack someone',
    'plan to hurt someone',
    'going to hurt someone',
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

const SELF_HARM_VERBS =
    'kill|hurt|hit|cut|punch|scratch|slap|pinch|bite|choke|strangle|stab|burn|hang|shoot|harm|starve|punish';

const DIRECT_SELF_HARM_REGEX: RegExp[] = [
    new RegExp(
        `\\bi\\s+(want|wanna|plan|planned|feel like|should|going to|gonna)\\s+(to\\s+)?(${SELF_HARM_VERBS})\\s+myself\\b`,
        'i'
    ),
    new RegExp(`\\bi\\s+(cut|hurt|hit|punch|scratch|slap|pinch|bite|burn|stab|choke)\\s+myself\\b`, 'i'),
    new RegExp(`\\b(${SELF_HARM_VERBS})\\s+myself\\b`, 'i'),
    /\bi\s+(want|wanna|plan|planned|feel like|should)\s+(to\s+)?(die|suicide)\b/,
    /\bi\s+(want|wanna|plan|planned|feel like|should)\s+(to\s+)?suicide\b/,
    /\bshould\s+(just\s+)?die\b/,
    /\bdont\s+wanna\s+exist\b/,
    /\bdo\s+not\s+want\s+to\s+exist\b/,
    /\bcant\s+continue\s+anymore\b/,
    /\bcannot\s+continue\s+anymore\b/,
    /\bend\s+my\s+life\b/,
];

const HARM_TO_OTHERS_REGEX: RegExp[] = [
    new RegExp(
        `\\bi\\s+(want|wanna|going to|gonna|plan to|planned to|feel like)\\s+(to\\s+)?(${SELF_HARM_VERBS})\\s+(him|her|them|someone|somebody|others|people|everybody|everyone|a person|my classmate|my roommate|my lecturer|my teacher)\\b`,
        'i'
    ),
    new RegExp(
        `\\b(${SELF_HARM_VERBS})\\s+(him|her|them|someone|somebody|others|people|everybody|everyone)\\b`,
        'i'
    ),
    /\bhurt\s+others\b/,
    /\bhurt\s+other\s+people\b/,
];

/** User is describing being harmed by someone else — not self-harm intent. */
const HARMED_BY_OTHERS_REGEX: RegExp[] = [
    /\b(they|he|she|someone|people|everyone|my friend|my mum|my mom|mother|father|dad|lecturer|boss|bully|classmate)\s+(hurt|hit|cut|killed|attacked|punched|beat)\s+me\b/,
    /\b(hurt|hit|cut|killed|attacked|punched|beat)\s+me\s+(yesterday|today|again|before|last\s+week)\b/,
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const containsWord = (text: string, word: string) =>
    new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(text);

const containsPhrase = (text: string, phrase: string) => text.includes(phrase);

/** Whole-word harmful verbs (avoids matching "killed", "hurtful", etc.). */
const HARMFUL_ACTION_WORDS = [
    'kill',
    'cut',
    'hurt',
    'hit',
    'suicide',
    'punch',
    'scratch',
    'slap',
    'pinch',
    'bite',
    'choke',
    'strangle',
    'stab',
    'starve',
    'punish',
    'harm',
    'overdose',
    'burn',
    'hang',
    'shoot',
];

const HARMFUL_ACTION_PHRASES = ['end my life', 'end it all'];

const PASSIVE_IDEATION_REGEX: RegExp[] = [
    /\bdont\s+wanna\s+exist\b/,
    /\bdo\s+not\s+want\s+to\s+exist\b/,
    /\bshould\s+(just\s+)?die\b/,
    /\bcant\s+continue\s+anymore\b/,
    /\bcannot\s+continue\s+anymore\b/,
    /\bi\s+wish\s+i\s+was\s+dead\b/,
];

const SELF_DIRECTED_ME_REGEX = new RegExp(
    `\\b(${SELF_HARM_VERBS})\\s+me\\b`,
    'i'
);

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

    const figurative_slang_detected = SAFE_SLANG_LIST.some((phrase) => combined.includes(phrase));
    const humor_detected = HUMOR_MARKERS.some((marker) => combined.includes(marker));

    const harmed_by_others_detected = HARMED_BY_OTHERS_REGEX.some((re) => re.test(text));

    const harmToOthersPatternMatches = HARM_TO_OTHERS_PATTERNS.filter((pattern) => text.includes(pattern));
    const harmToOthersRegexMatches = HARM_TO_OTHERS_REGEX.filter((re) => re.test(text)).map((re) => re.source);
    const harm_to_others_detected =
        harmToOthersPatternMatches.length > 0 || harmToOthersRegexMatches.length > 0;

    const directSelfHarmMatches = DIRECT_SELF_HARM_PATTERNS.filter((pattern) => text.includes(pattern));
    const regexDirectMatches = DIRECT_SELF_HARM_REGEX.filter((re) => re.test(text)).map((re) => re.source);

    const harmfulActionMatches = [
        ...HARMFUL_ACTION_WORDS.filter((token) => containsWord(text, token)),
        ...HARMFUL_ACTION_PHRASES.filter((phrase) => containsPhrase(text, phrase)),
    ];
    const harmful_action_detected = harmfulActionMatches.length > 0;

    const self_reference_myself = containsWord(text, 'myself') || containsPhrase(text, 'my life');
    const self_reference_existential =
        containsWord(text, 'alive') || /\b(dont|do not)\s+want\s+to\s+exist\b/.test(text);
    const self_directed_me =
        SELF_DIRECTED_ME_REGEX.test(text) && !harmed_by_others_detected && !harm_to_others_detected;
    const self_reference_detected =
        self_reference_myself || self_reference_existential || self_directed_me;

    const passiveIdeationMatches = PASSIVE_IDEATION_REGEX.filter((re) => re.test(text)).map((re) => re.source);
    const passive_ideation_detected = passiveIdeationMatches.length > 0;

    const self_harm_behavior_detected =
        new RegExp(`\\bi\\s+(${SELF_HARM_VERBS})\\s+myself\\b`, 'i').test(text) ||
        /\bi\s+(cut|hurt|hit|punch|scratch|slap|pinch|bite|burn|stab|choke)\s+myself\s+(already|ald|yesterday|today)\b/i.test(
            text
        );

    const actionPlusSelfIntent =
        harmful_action_detected &&
        (self_reference_myself || self_directed_me) &&
        !harm_to_others_detected &&
        !harmed_by_others_detected &&
        !figurative_slang_detected;

    const selfHarmSignals = [
        ...directSelfHarmMatches,
        ...regexDirectMatches,
        ...(actionPlusSelfIntent ? ['harmful action + self-target combination'] : []),
        ...passiveIdeationMatches,
        ...(self_harm_behavior_detected ? ['self-harm behavior signal'] : []),
    ];

    const direct_self_harm_detected =
        selfHarmSignals.length > 0 && (!harm_to_others_detected || self_reference_myself || self_harm_behavior_detected);

    const hopelessnessMatches = HOPLESSNESS_PATTERNS.filter((pattern) => combined.includes(pattern));
    const escalating_distress_detected =
        /(again|still|every day|everyday|for weeks|for months)/.test(combined) &&
        /(hopeless|empty|exhausted|anxious|depressed|panic|cant cope|cannot cope)/.test(combined);

    const safety_intent_categories: SafetyIntentCategory[] = [];
    if (direct_self_harm_detected) safety_intent_categories.push('direct_self_harm');
    if (harm_to_others_detected) safety_intent_categories.push('harm_to_others');
    if (hopelessnessMatches.length > 0 || passive_ideation_detected) safety_intent_categories.push('passive_hopelessness');
    if (escalating_distress_detected) safety_intent_categories.push('emotional_distress');
    if (figurative_slang_detected || humor_detected) safety_intent_categories.push('figurative_stress');
    if (figurative_slang_detected) safety_intent_categories.push('safe_slang');

    const reasons: string[] = [];
    if (direct_self_harm_detected) reasons.push('direct self-harm phrase detected');
    if (harm_to_others_detected) reasons.push('harm-to-others intent detected');
    if (actionPlusSelfIntent) reasons.push('harmful action + self-target combination detected');
    if (harmed_by_others_detected) reasons.push('user described being harmed by others (not self-harm)');
    if (passive_ideation_detected) reasons.push('passive suicidal ideation detected');
    if (self_harm_behavior_detected) reasons.push('self-harm behavior detected');
    if (hopelessnessMatches.length > 0) reasons.push('hopelessness detected');
    if (escalating_distress_detected) reasons.push('escalating distress detected');
    if (figurative_slang_detected) reasons.push('figurative slang detected');
    if (humor_detected) reasons.push('humor detected');

    return {
        figurative_slang_detected,
        humor_detected,
        direct_self_harm_detected,
        harm_to_others_detected,
        hopelessness_detected: hopelessnessMatches.length > 0,
        escalating_distress_detected,
        harmful_action_detected,
        self_reference_detected,
        passive_ideation_detected,
        self_harm_behavior_detected,
        safety_intent_categories,
        directSelfHarmMatches: [...new Set(selfHarmSignals)],
        harmToOthersMatches: [...new Set([...harmToOthersPatternMatches, ...harmToOthersRegexMatches])],
        reasons,
    };
};

