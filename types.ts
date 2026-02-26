
export type ViewState = 'home' | 'atlas' | 'china-atlas' | 'collections' | 'oracle' | 'product' | 'destination' | 'image-lab' | 'story';
export type Category = 'yuan' | 'he' | 'jing';

export type ScentStatus = 'arrived_origin' | 'planned_origin' | 'arrived' | 'planned';

export interface Destination {
  id: string;
  name: string;
  en: string;
  region: string;
  status: 'arrived' | 'locked';
  visitCount: number;
  scenery: string;
  emoji: string;
  herbDescription: string;
  knowledge: string;
  productIds: string[];
  isChinaProvince?: boolean;
  subRegion?: string;
  ericDiary: string;
  aliceDiary: string;
  memoryPhotos: string[]; 
}

export interface ScentItem {
  id: string;
  category: Category;
  subGroup?: string; 
  name: string;
  location?: string;
  region: string; 
  status: ScentStatus;
  visited: boolean;
  accent: string;
  hero: string;
  herb: string;
  herbEn: string;
  price?: string;
  specification?: string;
  shortDesc: string;
  narrative: string;
  benefits: string[];
  isPopular?: boolean;
  emoji?: string;
  ericDiary: string;
  aliceDiary: string;
  aliceLabDiary: string;   
  recommendation: string;  
  usage: string;           
  precautions: string;
  isPlaceholder?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
