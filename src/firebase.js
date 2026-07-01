import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
} from "firebase/firestore";
import { initializeAuth, indexedDBLocalPersistence } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyChKTdWyMPaDus0Ezo0oS9Ift2u5MdrFnM",
  authDomain: "slared.firebaseapp.com",
  projectId: "slared",
  storageBucket: "slared.appspot.com",
  messagingSenderId: "849996692636",
  appId: "1:849996692636:web:3aadc2a63bf28a45038159",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  }),
});
const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence,
});
const functions = getFunctions(app);
export { db, auth, functions };
