export interface ClickEvent {
  id: string;
  timestamp: string;
  referrer: string;
  referrerCategory: 'Direct' | 'Twitter/X' | 'LinkedIn' | 'Facebook' | 'WhatsApp' | 'Instagram' | 'Reddit' | 'YouTube' | 'Email' | 'Other';
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  country: string;
  city?: string;
}

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface QrConfig {
  dotColor: string;
  bgColor: string;
  logo?: 'none' | 'link' | 'twitter' | 'instagram' | 'youtube' | 'globe' | 'heart' | 'star';
  margin: number;
}

export interface ShortLink {
  id: string;
  slug: string;
  originalUrl: string;
  title: string;
  description?: string;
  createdAt: string;
  clicks: number;
  tags: string[];
  isPasswordProtected: boolean;
  password?: string;
  expiresAt?: string;
  qrConfig: QrConfig;
  utm?: UtmParams;
  clicksData: ClickEvent[];
}

export interface BioProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: 'slate' | 'minimal' | 'sunset' | 'emerald' | 'indigo';
  socialLinks: {
    platform: 'twitter' | 'instagram' | 'github' | 'linkedin' | 'youtube' | 'website';
    url: string;
  }[];
  linkIds: string[];
}
