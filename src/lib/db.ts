
'use client';

import { openDB, type DBSchema } from 'idb';
import type { VisualItem } from '@/types';

const DB_NAME = 'EduSparkDB';
const DB_VERSION = 1;
const STORE_NAME = 'visualContent';

interface EduSparkDBSchema extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: VisualItem[];
  };
}

async function getDB() {
  return openDB<EduSparkDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveVisualsForActivity(activityId: string, visuals: VisualItem[]): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, visuals, activityId);
}

export async function getVisualsForActivity(activityId: string): Promise<VisualItem[] | null> {
  if (!activityId) return null;
  const db = await getDB();
  const visuals = await db.get(STORE_NAME, activityId);
  return visuals || null;
}

export async function clearVisualsForActivity(activityId: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, activityId);
}
