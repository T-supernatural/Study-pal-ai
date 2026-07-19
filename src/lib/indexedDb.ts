import { StudyNote, LearningStats } from "../types";

const DB_NAME = "studypal_ai_db";
const DB_VERSION = 1;
const STORE_NOTES = "study_notes";
const STORE_STATS = "learning_stats";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_STATS)) {
        db.createObjectStore(STORE_STATS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveStudyNotesDB(notes: StudyNote[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NOTES, "readwrite");
    const store = transaction.objectStore(STORE_NOTES);

    // Clear old data and repopulate to maintain sync
    const clearRequest = store.clear();
    
    clearRequest.onsuccess = () => {
      if (notes.length === 0) {
        resolve();
        return;
      }
      
      let count = 0;
      notes.forEach((note) => {
        const addRequest = store.put(note);
        addRequest.onsuccess = () => {
          count++;
          if (count === notes.length) {
            resolve();
          }
        };
        addRequest.onerror = () => reject(addRequest.error);
      });
    };

    clearRequest.onerror = () => reject(clearRequest.error);
  });
}

export async function loadStudyNotesDB(): Promise<StudyNote[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NOTES, "readonly");
    const store = transaction.objectStore(STORE_NOTES);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveLearningStatsDB(stats: LearningStats): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_STATS, "readwrite");
    const store = transaction.objectStore(STORE_STATS);
    
    // Store stats with a single key 'current_stats'
    const request = store.put({ id: "current_stats", ...stats });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function loadLearningStatsDB(): Promise<LearningStats | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_STATS, "readonly");
    const store = transaction.objectStore(STORE_STATS);
    const request = store.get("current_stats");

    request.onsuccess = () => {
      if (request.result) {
        // Exclude the added id field
        const { id, ...stats } = request.result;
        resolve(stats as LearningStats);
      } else {
        resolve(null);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
