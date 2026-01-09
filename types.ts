
export type ViewState = 'home' | 'atlas' | 'china-atlas' | 'collections' | 'oracle' | 'product' | 'destination' | 'imagelab' | 'brand-studio';
export type Category = 'yuan' | 'he' | 'jing';

export type ScentStatus = 'arrived_origin' | 'planned_origin' | 'arrived' | 'planned';

export interface Destination {
  id: string;
  name: string;
  en: string;
  region: string;
  status: 'arrived' | 'locked';
  visitCount: number; // 真实记录数
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
  shortDesc: string;
  narrative: string;
  benefits: string[];
  isPopular?: boolean;
  emoji?: string;
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
