let db;

// establish connection to IndexedDB called finance_tracker and setting it to version 1
const request = indexedDB.open('finance_tracker', 1);

// event will emit if the database version changes
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    const db = event.target.result;
    if (navigator.onLine) {
        sendTransaction();
    }
};
