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

// Counselor Support Chat Types
export interface CounselorUser {
  id: string;
  displayName: string;
  isAnonymous: boolean;
  status: 'online' | 'away' | 'busy';
  bio?: string;
  supportTopics: string[];
  specialization?: string;
  rating?: number;
  experienceYears?: number;
  consultationMethods?: ConsultationType[];
  avatarUrl?: string;
  joinedAt: Date;
}

export interface EncryptedPayload {
  iv: string;
  data: string;
}

export interface CounselorMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  /** Plaintext is never persisted. `content` holds the AES-GCM ciphertext. */
  content: EncryptedPayload | string;
  timestamp: Date;
}

export interface CounselorChat {
  id: string;
  participants: string[];
  participantNames: string[];
  messages: CounselorMessage[];
  createdAt: Date;
  lastMessageAt: Date;
}

export type ConsultationType = 'chat' | 'video';
export type ReminderChannel = 'push' | 'email' | 'local';
export type SessionStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface SessionBooking {
  id: string;
  counselorId: string;
  counselorName: string;
  preferredDate: Date;
  consultationType: ConsultationType;
  reminders: ReminderChannel[];
  notes?: string;
  status: SessionStatus;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string; // base64 string
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
  showProfileInCounselorChat: boolean;
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
  // Progress (10)
  | 'first_checkin'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'streak_60'
  | 'streak_100'
  | 'first_journal'
  | 'first_breathing'
  | 'first_meditation'
  // Skills (10)
  | 'breathing_master'
  | 'breathing_expert'
  | 'journal_starter'
  | 'journal_master'
  | 'journal_pro'
  | 'meditation_beginner'
  | 'meditation_master'
  | 'mood_tracker'
  | 'mood_analyst'
  | 'gratitude_practice'
  // Activities (10)
  | 'calm_explorer'
  | 'mindfulness_journey'
  | 'exercise_enthusiast'
  | 'exercise_warrior'
  | 'social_butterfly'
  | 'reading_lover'
  | 'podcast_listener'
  | 'music_therapist'
  | 'wellness_routine'
  | 'perfect_week'
  // Milestones (10)
  | 'coin_collector'
  | 'coin_wealthy'
  | 'coin_rich'
  | 'coin_elite'
  | 'monthly_champion'
  | 'quarterly_champion'
  | 'yearly_champion'
  | 'consistency_king'
  | 'comeback_champion'
  | 'milestone_master'
  // Special (10)
  | 'pet_lover'
  | 'pet_trainer'
  | 'pet_master'
  | 'pet_level_25'
  | 'perfect_pet'
  | 'early_bird'
  | 'night_owl'
  | 'weekend_warrior'
  | 'community_helper'
  | 'wellness_ambassador';

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

export interface HealingGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  optional?: boolean;
}

export interface WeeklyPlan {
  id: string;
  weekStart: Date;
  tasks: DailyTask[];
  generatedAt: Date;
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
