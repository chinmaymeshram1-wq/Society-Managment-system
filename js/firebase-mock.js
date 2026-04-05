// Mock Firebase using LocalStorage to simulate Realtime Database
// This allows true cross-tab synchronization and real-time feel out of the box!

// Helper to generate UUIDs
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// In-Memory listeners
const dbListeners = {
  // collectionName: [ { callback: fn, query: null } ]
};

// Initialize DB if empty
if (!localStorage.getItem('mockDB')) {
  localStorage.setItem('mockDB', JSON.stringify({
    users: [
      { id: '101', role: 'member', name: 'Chinmay Member', flatNumber: '101', wing: 'A', phone: '9876543210' },
      { id: 'guard', role: 'guard', name: 'Ramesh Guard', phone: '9123456789' },
      { id: 'admin', role: 'admin', name: 'Society Admin'}
    ],
    complaints: [],
    visitors: [],
    bills: [
      { id: uuidv4(), flatNumber: '101', amount: 1500, dueDate: '2026-05-01', status: 'pending', description: 'Maintenance May 2026' }
    ]
  }));
}

// Cross-tab synchronization
window.addEventListener('storage', (e) => {
  if (e.key === 'mockDB' && e.newValue) {
    const freshDb = JSON.parse(e.newValue);
    // Fire listeners
    Object.keys(dbListeners).forEach(collection => {
      const collectionData = freshDb[collection] || [];
      dbListeners[collection].forEach(listener => {
          // If the listener has a filter, apply it
          let dataToReturn = collectionData;
          if (listener.filterFn) {
            dataToReturn = collectionData.filter(listener.filterFn);
          }
          listener.callback(dataToReturn);
      });
    });
  }
});

// Trigger all local listeners manually for same-tab updates
function triggerLocalListeners(collection) {
    const db = JSON.parse(localStorage.getItem('mockDB'));
    const collectionData = db[collection] || [];
    if (dbListeners[collection]) {
        dbListeners[collection].forEach(listener => {
            let dataToReturn = collectionData;
            if (listener.filterFn) {
              dataToReturn = collectionData.filter(listener.filterFn);
            }
            listener.callback(dataToReturn);
        });
    }
}

export const MockFirebase = {
  // Real-time listen
  onSnapshot: (collection, filterFn, callback) => {
    if (!dbListeners[collection]) dbListeners[collection] = [];
    
    dbListeners[collection].push({ callback, filterFn });
    
    // Initial call
    const db = JSON.parse(localStorage.getItem('mockDB'));
    const data = db[collection] || [];
    callback(filterFn ? data.filter(filterFn) : data);
    
    // Return unsubscribe function
    return () => {
      dbListeners[collection] = dbListeners[collection].filter(l => l.callback !== callback);
    };
  },
  
  // Create / Add
  addDoc: (collection, data) => {
    return new Promise((resolve) => {
      const db = JSON.parse(localStorage.getItem('mockDB'));
      if (!db[collection]) db[collection] = [];
      const newDoc = { ...data, id: uuidv4(), timestamp: new Date().toISOString() };
      db[collection].push(newDoc);
      localStorage.setItem('mockDB', JSON.stringify(db));
      triggerLocalListeners(collection);
      resolve(newDoc);
    });
  },

  // Update
  updateDoc: (collection, docId, updates) => {
    return new Promise((resolve) => {
      const db = JSON.parse(localStorage.getItem('mockDB'));
      if (!db[collection]) return resolve();
      const idx = db[collection].findIndex(d => d.id === docId);
      if (idx !== -1) {
        db[collection][idx] = { ...db[collection][idx], ...updates };
        localStorage.setItem('mockDB', JSON.stringify(db));
        triggerLocalListeners(collection);
      }
      resolve();
    });
  },

  // Delete
  deleteDoc: (collection, docId) => {
    return new Promise((resolve) => {
      const db = JSON.parse(localStorage.getItem('mockDB'));
      if (!db[collection]) return resolve();
      db[collection] = db[collection].filter(d => d.id !== docId);
      localStorage.setItem('mockDB', JSON.stringify(db));
      triggerLocalListeners(collection);
      resolve();
    });
  },

  // Get once
  getDocs: (collection, filterFn) => {
    return new Promise((resolve) => {
      const db = JSON.parse(localStorage.getItem('mockDB'));
      const data = db[collection] || [];
      resolve(filterFn ? data.filter(filterFn) : data);
    });
  }
};
