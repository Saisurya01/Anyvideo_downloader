import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAP3RmgjQ7WmJQGtBYTBS8-KfOUDJPnyoY",
  authDomain: "any-video-download-de0d8.firebaseapp.com",
  projectId: "any-video-download-de0d8",
  storageBucket: "any-video-download-de0d8.firebasestorage.app",
  messagingSenderId: "75204346427",
  appId: "1:75204346427:web:4791aaa25fa2d1d3cfd21e",
  measurementId: "G-537SJ5YVTB"
};

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export const logDownloadRequest = async (data) => {
  if (!db) {
    console.log('Firestore not available, skipping log');
    return;
  }
  
  try {
    await addDoc(collection(db, 'downloads'), {
      url: data.url,
      platform: data.platform,
      video_title: data.videoTitle,
      available_formats: data.availableFormats,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging to Firestore:', error);
  }
};

export { db };
