import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/learnchess";

interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isFallback: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedMongoose | undefined;
}

const cached: CachedMongoose = global.mongooseCache || {
  conn: null,
  promise: null,
  isFallback: false,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<{ isFallback: boolean }> {
  if (cached.conn) {
    return { isFallback: cached.isFallback };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000, // Quick timeout to fallback if no Mongo daemon
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        cached.isFallback = false;
        return m;
      })
      .catch((err) => {
        console.warn("MongoDB connection failed or daemon not running. Falling back to persistent local storage.", err.message);
        cached.isFallback = true;
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch {
    cached.isFallback = true;
  }

  return { isFallback: cached.isFallback };
}

// ==========================================
// Persistent Local File DB (Zero-config Fallback)
// ==========================================
interface LocalDatabase {
  users: Record<string, Record<string, unknown>>;
  studies: Record<string, Record<string, unknown>>;
  trainingSessions: Record<string, Record<string, unknown>>;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDbFile(): LocalDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial: LocalDatabase = {
      users: {},
      studies: {},
      trainingSessions: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }

  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    const initial: LocalDatabase = {
      users: {},
      studies: {},
      trainingSessions: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

function saveDbFile(data: LocalDatabase) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const localDb = {
  get: () => ensureDbFile(),
  save: (data: LocalDatabase) => saveDbFile(data),
  collection: <T extends { _id: string }>(colName: keyof LocalDatabase) => {
    return {
      find: (filter?: Partial<T>): T[] => {
        const db = ensureDbFile();
        const records = Object.values(db[colName]) as T[];
        if (!filter) return records;
        return records.filter((item) => {
          return Object.entries(filter).every(([k, v]) => {
            const val = (item as Record<string, unknown>)[k];
            if (val === undefined) return false;
            return String(val) === String(v);
          });
        });
      },
      findOne: (filter: Partial<T>): T | null => {
        const db = ensureDbFile();
        const records = Object.values(db[colName]) as T[];
        const found = records.find((item) => {
          return Object.entries(filter).every(([k, v]) => {
            const val = (item as Record<string, unknown>)[k];
            if (val === undefined) return false;
            return String(val) === String(v);
          });
        });
        return found || null;
      },
      findById: (id: string): T | null => {
        const db = ensureDbFile();
        return (db[colName][id] as T) || null;
      },
      create: (item: T): T => {
        const db = ensureDbFile();
        db[colName][item._id] = item as unknown as Record<string, unknown>;
        saveDbFile(db);
        return item;
      },
      findByIdAndUpdate: (id: string, update: Partial<T>): T | null => {
        const db = ensureDbFile();
        if (!db[colName][id]) return null;
        const current = db[colName][id] as T;
        const updated = { ...current, ...update, updatedAt: new Date().toISOString() };
        db[colName][id] = updated as unknown as Record<string, unknown>;
        saveDbFile(db);
        return updated;
      },
      findByIdAndDelete: (id: string): boolean => {
        const db = ensureDbFile();
        if (!db[colName][id]) return false;
        delete db[colName][id];
        saveDbFile(db);
        return true;
      },
    };
  },
};
