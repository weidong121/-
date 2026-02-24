export interface SpeechItem {
  id: string;
  original: string;
  style: string;
  content: string;
  scene: string;
  timestamp: number;
}

export interface FavoriteItem extends SpeechItem {}

export interface HistoryItem extends SpeechItem {}
