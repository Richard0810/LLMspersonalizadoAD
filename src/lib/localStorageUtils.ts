
import type { User, Activity, LessonParams, ChatMessage } from '@/types';

const LESSON_PARAMS_KEY = 'eduspark_lesson_params';
const ACTIVITY_HISTORY_KEY = 'eduspark_activity_history';
const CHAT_HISTORY_KEY = 'eduspark_chat_history';
const MAX_HISTORY_ITEMS = 10;

// Lesson Parameters
export const saveLessonParamsToLocalStorage = (params: LessonParams): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LESSON_PARAMS_KEY, JSON.stringify(params));
  }
};

export const getLessonParamsFromLocalStorage = (): LessonParams | null => {
  if (typeof window !== 'undefined') {
    const paramsJson = localStorage.getItem(LESSON_PARAMS_KEY);
    return paramsJson ? JSON.parse(paramsJson) : null;
  }
  return null;
};

export const clearLessonParamsFromLocalStorage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LESSON_PARAMS_KEY);
  }
};


// Activity History
export const getActivityHistoryFromLocalStorage = (): Activity[] => {
  if (typeof window !== 'undefined') {
    const historyJson = localStorage.getItem(ACTIVITY_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  }
  return [];
};

export const addActivityToHistoryLocalStorage = (activity: Activity): void => {
  if (typeof window !== 'undefined') {
    let history = getActivityHistoryFromLocalStorage();
    // Avoid duplicates by ID
    history = history.filter(a => a.id !== activity.id);
    history.unshift(activity); // Add to the beginning
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    localStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(history));
  }
};

export const addActivitiesToHistoryLocalStorage = (activities: Activity[]): void => {
  if (typeof window !== 'undefined') {
    let history = getActivityHistoryFromLocalStorage();
     // Add new activities to the beginning, avoiding duplicates by ID
    const newActivitiesToAdd = activities.filter(newActivity => !history.some(existingActivity => existingActivity.id === newActivity.id));
    history.unshift(...newActivitiesToAdd.reverse()); // reverse to maintain order of new batch

    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    localStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(history));
  }
}

export const getActivityByIdFromLocalStorage = (id: string): Activity | null => {
  if (typeof window !== 'undefined') {
    const history = getActivityHistoryFromLocalStorage();
    return history.find(activity => activity.id === id) || null;
  }
  return null;
};

// Chat History
export const saveChatHistoryToLocalStorage = (messages: ChatMessage[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }
};

export const getChatHistoryFromLocalStorage = (): ChatMessage[] | null => {
  if (typeof window !== 'undefined') {
    const chatJson = localStorage.getItem(CHAT_HISTORY_KEY);
    return chatJson ? JSON.parse(chatJson) : null;
  }
  return null;
};

export const clearChatHistoryFromLocalStorage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  }
};

    
