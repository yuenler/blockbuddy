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

export default async function logQuery({ projectId, question, answer, useThinkingModel, hasScreenshot, chatHistoryLength }) {
  try {
    await db.collection('queries').add({
      projectId,
      question,
      answer,
      useThinkingModel,
      hasScreenshot,
      chatHistoryLength,
      createdAt: new Date()
    });
  } catch (err) {
    // Don't let logging failures break the main request
    console.error('Error logging query:', err);
  }
}
