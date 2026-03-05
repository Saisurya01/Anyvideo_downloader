import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serviceAccount = null;
let credentialsPath;

try {
  credentialsPath = join(__dirname, 'firebase-credentials.json');
  const fileContent = readFileSync(credentialsPath, 'utf8');
  serviceAccount = JSON.parse(fileContent);
} catch (error) {
  console.log('Firebase credentials file not found. Checking environment variables...');
  
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };
  }
}

let db = null;

if (serviceAccount && serviceAccount.project_id) {
  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.log('Firebase initialization skipped:', error.message);
  }
} else {
  console.log('Firebase credentials not provided. Running without Firestore logging.');
}

export const logDownload = async (data) => {
  if (!db) {
    console.log('Firestore not available, skipping log:', data.url);
    return null;
  }
  
  try {
    const docRef = await db.collection('downloads').add({
      url: data.url,
      platform: data.platform,
      video_title: data.videoTitle,
      available_formats: data.availableFormats,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error logging to Firestore:', error);
    throw error;
  }
};

export default admin;
