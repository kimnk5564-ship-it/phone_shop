// firebase-init.js
// Firebase configuration provided by the user
const firebaseConfig = {
    apiKey: "AIzaSyAYqF_RXzKv5UT5HQMUHe32QNPdGyoWPkk",
    authDomain: "phoneshop-37f7a.firebaseapp.com",
    projectId: "phoneshop-37f7a",
    storageBucket: "phoneshop-37f7a.firebasestorage.app",
    messagingSenderId: "265632306388",
    appId: "1:265632306388:web:6b50046694075d487b9741"
};

// Initialize Firebase using compat libraries
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
