export type AzureChatRole = 'system' | 'user' | 'assistant';

export interface AzureChatMessage {
  role: AzureChatRole;
  content: string;
}

interface AzureChatOptions {
  temperature?: number;
  maxTokens?: number;
}

const getAzureOpenAIConfig = () => {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
  const endpoint = env.VITE_AZURE_OPENAI_ENDPOINT?.replace(/\/+$/, '');
  const deployment = env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini-0718';
  const apiVersion = env.VITE_AZURE_OPENAI_API_VERSION || '2024-08-01-preview';
  const apiKey = env.VITE_AZURE_OPENAI_API_KEY;

  if (!endpoint || !deployment || !apiKey) {
    throw new Error('Azure OpenAI is not configured.');
  }

  return {
    apiKey,
    url: `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
  };
};

export const getAzureChatCompletion = async (
  messages: AzureChatMessage[],
  options: AzureChatOptions = {}
) => {
  const { apiKey, url } = getAzureOpenAIConfig();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 250,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Azure OpenAI request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
};

export type EmotionLabel = 'happy' | 'calm' | 'stress' | 'anxious' | 'depress' | 'neutral';

const ALLOWED_EMOTIONS: EmotionLabel[] = ['happy', 'calm', 'stress', 'anxious', 'depress', 'neutral'];

export const detectEmotion = async (userInput: string): Promise<EmotionLabel> => {
  const trimmed = userInput.trim().slice(0, 500);
  if (!trimmed) return 'neutral';

  try {
    const result = await getAzureChatCompletion(
      [
        {
          role: 'system',
          content: `You are an emotion classification system.

Classify the user's message into ONLY ONE of these labels:
- happy
- calm
- stress
- anxious
- depress
- neutral

Definitions:
- happy: positive, joyful, excited
- calm: relaxed, peaceful
- stress: overwhelmed, pressure, tense
- anxious: worried, nervous
- depress: sad, hopeless, low mood
- neutral: no strong emotion

Rules:
- Return ONLY one label
- Do NOT explain
- Do NOT add extra words`,
        },
        { role: 'user', content: trimmed },
      ],
      { temperature: 0, maxTokens: 10 }
    );

    const label = result.toLowerCase().trim() as EmotionLabel;
    return ALLOWED_EMOTIONS.includes(label) ? label : 'neutral';
  } catch {
    return 'neutral';
  }
};
