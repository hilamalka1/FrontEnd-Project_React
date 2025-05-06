// firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC66JbA_lmyeqUoRR6qtANM3KFaq4ieRxk",
  authDomain: "onbord-a43c3.firebaseapp.com",
  projectId: "onbord-a43c3",
  storageBucket: "onbord-a43c3.firebasestorage.app",
  messagingSenderId: "475942325210",
  appId: "1:475942325210:web:5b72abc685b180b34a4ee3",
  measurementId: "G-R1FBLZ1HTF"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
