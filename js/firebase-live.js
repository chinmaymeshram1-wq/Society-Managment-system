import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc as fbAddDoc, 
  onSnapshot as fbOnSnapshot, 
  getDocs as fbGetDocs, 
  updateDoc as fbUpdateDoc, 
  deleteDoc as fbDeleteDoc, 
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// The config from your screenshot!
const firebaseConfig = {
  apiKey: "AIzaSyDzB6bEubWbTqBvUDzlhFVz4M-aE4_X8B4",
  authDomain: "newdbmsproject.firebaseapp.com",
  projectId: "newdbmsproject",
  storageBucket: "newdbmsproject.firebasestorage.app",
  messagingSenderId: "120767792530",
  appId: "1:120767792530:web:2795d3eeeb0fac582aed4b",
  measurementId: "G-8SPZMHYEBN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Seed database on first boot if Users collection is completely empty
async function seedDefaultUsers() {
  try {
    const usersRef = collection(db, 'users');
    const snap = await fbGetDocs(usersRef);
    if (snap.empty) {
      console.log("Database empty! Seeding default accounts...");
      // We use setDoc to force specific IDs to match login credentials exactly!
      await setDoc(doc(db, 'users', 'A-101'), { id: 'A-101', role: 'member', name: 'Chinmay Member', flatNumber: '101', wing: 'A', phone: '9876543210', password: 'member123', timestamp: new Date().toISOString() });
      await setDoc(doc(db, 'users', 'guard'), { id: 'guard', role: 'guard', name: 'Ramesh Guard', phone: '9123456789', password: 'guard123', timestamp: new Date().toISOString() });
      await setDoc(doc(db, 'users', 'admin'), { id: 'admin', role: 'admin', name: 'Society Admin', password: 'admin123', timestamp: new Date().toISOString() });
    }
  } catch (err) {
    alert("Startup Error: Could not connect to Firebase! " + err.message);
  }
}
seedDefaultUsers();

// Interface matching EXACTLY what the app already uses
export const MockFirebase = {
  // onSnapshot(collection, filterFn, callback)
  onSnapshot: (colName, filterFn, callback) => {
    return fbOnSnapshot(collection(db, colName), (snapshot) => {
      let dataList = [];
      snapshot.forEach((doc) => {
        dataList.push({ ...doc.data(), id: doc.id }); // doc.id is the real firestore ID
      });
      
      // We apply standard map filter since we originally wrote JS filters (e.g. u => u.role === 'member')
      if (filterFn) {
        dataList = dataList.filter(filterFn);
      }
      callback(dataList);
    });
  },
  
  // Create
  addDoc: async (colName, data) => {
    try {
      const enrichedData = { ...data, timestamp: new Date().toISOString() };
      if (enrichedData.id) {
         // If the data already has an ID (like a user flat number), force it as the Firebase document ID!
         await setDoc(doc(db, colName, enrichedData.id), enrichedData);
         return { ...enrichedData, id: enrichedData.id };
      } else {
         // Regular auto-generated ID (for complains, visitors, bills)
         const docRef = await fbAddDoc(collection(db, colName), enrichedData);
         return { ...enrichedData, id: docRef.id };
      }
    } catch (err) {
      console.error("Firebase AddDoc Error:", err);
      throw err;
    }
  },

  // Update
  updateDoc: async (colName, docId, updates) => {
    try {
      const docRef = doc(db, colName, docId);
      
      // If the ID in updates is different from the document ID, we must move the document
      if (updates.id && updates.id !== docId) {
        console.log(`ID changed from ${docId} to ${updates.id}. Moving document...`);
        await setDoc(doc(db, colName, updates.id), updates);
        await fbDeleteDoc(docRef);
      } else {
        await fbUpdateDoc(docRef, updates);
      }
    } catch (err) {
      console.error("Firebase Update Error:", err);
      throw err;
    }
  },

  // Delete
  deleteDoc: async (colName, docId) => {
    const docRef = doc(db, colName, docId);
    await fbDeleteDoc(docRef);
  },

  // Get once
  getDocs: async (colName, filterFn) => {
    const snapshot = await fbGetDocs(collection(db, colName));
    let dataList = [];
    snapshot.forEach((doc) => {
      dataList.push({ ...doc.data(), id: doc.id });
    });
    return filterFn ? dataList.filter(filterFn) : dataList;
  }
};
