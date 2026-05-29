export type Emotion = 'happy' | 'neutral' | 'sad' | 'anxious' | 'stressed' | 'exhausted' | 'numb';

export interface MoodEntry {
  id: string;
  emotion: Emotion;
  note?: string;
  triggers?: string[];
  timestamp: Date;
}

// Journal Types
export interface JournalEntry {
  id: string;
  content: string;
  linkedMoodId?: string; // Links to mood entry if written during mood check-in
  linkedEmotion?: Emotion;
  timestamp: Date;
}

// Peer Support Chat Types
export interface PeerUser {
  id: string;
  displayName: string;
  isAnonymous: boolean;
  status: 'online' | 'away' | 'busy';
  bio?: string;
  supportTopics: string[];
  specialization?: string;
  rating?: number;
  experienceYears?: number;
  consultationMethods?: ('chat' | 'video')[];
  joinedAt: Date;
}

export interface PeerMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

export interface PeerChat {
  id: string;
  participants: string[];
  participantNames: string[];
  messages: PeerMessage[];
  createdAt: Date;
  lastMessageAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  reminderTime?: string;
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
  streak: number;
}

// User Settings Types
export interface NotificationSettings {
  dailyReminder: boolean;
  reminderTime: string;
  moodCheckReminder: boolean;
  streakReminder: boolean;
  weeklyReport: boolean;
  motivationalMessages: boolean;
}

export interface PrivacySettings {
  shareAnonymousData: boolean;
  showProfileInPeerChat: boolean;
  allowDirectMessages: boolean;
  dataRetentionDays: number;
}

export interface Affirmation {
  id: string;
  text: string;
  category: 'motivation' | 'calm' | 'self-love' | 'strength';
}

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
  rounds: number;
}

// Virtual Pet Types - Enhanced Pou-style
export type PetMood = 'thriving' | 'happy' | 'content' | 'tired' | 'sad' | 'sick' | 'sleeping';
export type PetSkin = 'default' | 'golden' | 'rainbow' | 'ninja' | 'angel' | 'devil';
export type PetAccessory = 'none' | 'hat' | 'glasses' | 'bowtie' | 'crown' | 'scarf';

export interface VirtualPet {
  name: string;
  happiness: number; // 0-100
  energy: number; // 0-100
  hunger: number; // 0-100 (100 = full, 0 = starving)
  cleanliness: number; // 0-100
  health: number; // 0-100
  level: number;
  experience: number;
  skin: PetSkin;
  accessory: PetAccessory;
  lastFed: Date | null;
  lastPlayed: Date | null;
  lastCleaned: Date | null;
  lastSlept: Date | null;
  isSleeping: boolean;
  createdAt: Date;
}

// Rewards Types
export type BadgeId = 
  | 'first_checkin'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'breathing_master'
  | 'journal_starter'
  | 'journal_master'
  | 'mood_tracker'
  | 'calm_explorer'
  | 'pet_lover'
  | 'coin_collector'
  | 'pet_level_5'
  | 'pet_level_10';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface RewardsState {
  calmCoins: number;
  totalCoinsEarned: number;
  badges: BadgeId[];
  dailyBonusClaimed: Date | null;
}

// Shop Items
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'food' | 'toy' | 'skin' | 'accessory';
  value: string;
  icon: string;
}

// Weekly Plan
export interface DailyTask {
  id: string;
  day: string;
  title: string;
  description: string;
  type: 'breathing' | 'journal' | 'affirmation' | 'exercise' | 'social' | 'rest';
  completed: boolean;
}

export interface WeeklyPlan {
  id: string;
  weekStart: Date;
  tasks: DailyTask[];
  generatedAt: Date;
}

export interface HealingGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  optional?: boolean;
}

// In-App Categories
export type InAppCategory = 'community' | 'volunteering' | 'programs' | 'selfcare' | 'resources' | 'events' | 'mentorship';

export interface InAppItem {
  id: string;
  title: string;
  description: string;
  category: InAppCategory;
  link?: string;
  tags?: string[];
  isPremium?: boolean;
}

export interface InAppContent {
  community: InAppItem[];
  volunteering: InAppItem[];
  programs: InAppItem[];
  selfcare: InAppItem[];
  resources: InAppItem[];
  events: InAppItem[];
  mentorship: InAppItem[];
}

// Mood Prediction
export interface MoodPrediction {
  predictedMood: Emotion;
  confidence: number;
  reason: string;
  suggestion: string;
  predictedFor: Date;
  generatedAt: Date;
}
