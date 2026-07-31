export interface BlogPost {
  id: string;
  title: string;
  content: string;
  snippet: string;
  publishedDate: string;
  updatedDate?: string;
  author: string;
  authorAvatar?: string;
  link: string;
  categories: string[];
  thumbnail?: string;
  readingTimeMinutes: number;
  language: 'ar' | 'en';
}

export type ThemeMode = 'dark' | 'sepia' | 'light';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type FontFamily = 'cairo' | 'tajawal' | 'amiri' | 'sans';
export type LanguageFilter = 'all' | 'ar' | 'en';

export interface ReadingSettings {
  theme: ThemeMode;
  fontSize: FontSize;
  fontFamily: FontFamily;
  lineHeight: 'normal' | 'relaxed' | 'loose';
}
