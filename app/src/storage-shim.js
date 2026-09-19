// Drop-in replacement for the Claude-artifact `window.storage` API, backed by
// the browser's own IndexedDB. Matches the same get/set/delete/list contract
// (including "get on a missing key rejects" per the original API) so the app
// code itself needs zero changes.

const DB_NAME = "gotham_unbound_storage";
const STORE = "kv";
let connection;

function openDB() {
  if (connection) return connection;
  connection = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => { db.close(); connection = null; };
      db.onclose = () => { connection = null; };
      resolve(db);
    };
    req.onerror = () => { connection = null; reject(req.error); };
    req.onblocked = () => { connection = null; reject(new Error("Close other app tabs to finish opening the logbook.")); };
  });
  return connection;
}

window.storage = {
  async get(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => {
        if (req.result === undefined) reject(new Error("Key not found: " + key));
        else resolve({ key, value: req.result, shared: false });
      };
      req.onerror = () => reject(req.error);
    });
  },
  async set(key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve({ key, value, shared: false });
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("Save interrupted"));
    });
  },
  async delete(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve({ key, deleted: true, shared: false });
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("Delete interrupted"));
    });
  },
  async list(prefix) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const keys = [];
      const req = tx.objectStore(STORE).openKeyCursor();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (!prefix || String(cursor.key).startsWith(prefix)) keys.push(cursor.key);
          cursor.continue();
        } else {
          resolve({ keys, shared: false });
        }
      };
      req.onerror = () => reject(req.error);
    });
  },
};
