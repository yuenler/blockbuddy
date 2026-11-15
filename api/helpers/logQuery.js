import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = getFirestore();

export default async function logQuery(endpoint, data) {
  try {
    await db.collection('queries').add({
      endpoint,
      ...data,
      createdAt: new Date()
    });
  } catch (err) {
    // Don't let logging failures break the main request
    console.error('Error logging query:', err);
  }
}

// Flatten an OpenAI `usage` object into Firestore fields for cost tracking
export function usageFields(usage) {
  if (!usage) return {};
  return {
    inputTokens: usage.prompt_tokens ?? usage.input_tokens ?? null,
    outputTokens: usage.completion_tokens ?? usage.output_tokens ?? null,
    reasoningTokens: usage.completion_tokens_details?.reasoning_tokens ?? null,
    cachedInputTokens: usage.prompt_tokens_details?.cached_tokens ?? usage.input_token_details?.cached_tokens ?? null,
    audioInputTokens: usage.input_token_details?.audio_tokens ?? null,
    audioSeconds: usage.type === 'duration' ? usage.seconds ?? null : null
  };
}
