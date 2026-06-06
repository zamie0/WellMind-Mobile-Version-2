import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Emotion, MoodEntry, UserProfile, VirtualPet, PetMood, BadgeId, 
  PetSkin, PetAccessory, WeeklyPlan, DailyTask, MoodPrediction, JournalEntry, HealingGoal 
} from '@/types/wellmind';

interface WellMindState {
  user: UserProfile | null;
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  currentStreak: number;
  lastCheckIn: Date | null;
  
  // Virtual Pet
  pet: VirtualPet;
  
  // Rewards
  calmCoins: number;
  totalCoinsEarned: number;
  badges: BadgeId[];
  dailyBonusClaimed: Date | null;
  unlockedSkins: PetSkin[];
  unlockedAccessories: PetAccessory[];
  
  // Weekly Plan
  weeklyPlan: WeeklyPlan | null;

  // Healing Goals
  healingGoals: HealingGoal[];
  
  // Mood Prediction
  moodPrediction: MoodPrediction | null;
  
  // Achievement Tracking
  breathingExercises: number;
  meditationSessions: number;
  gratitudeEntries: number;
  exerciseCount: number;
  weeklyCheckIns: number;
  monthlyCheckIns: number;
  earlyBirdCount: number;
  nightOwlCount: number;
  weekendCheckIns: number;
  communityConnections: number;
  perfectWeekDates: Date[];
  consistentDays: number;
  lastActivityDate: Date | null;
  
  // Actions
  setUser: (user: UserProfile) => void;
  updateUser: (data: Partial<UserProfile>) => void;
  completeOnboarding: (name: string) => void;
  addMoodEntry: (emotion: Emotion, note?: string, triggers?: string[]) => void;
  getMoodHistory: (days?: number) => MoodEntry[];
  getTodaysMood: () => MoodEntry | undefined;
  updateStreak: () => void;
  
  // Journal Actions
  addJournalEntry: (content: string, linkedMoodId?: string, linkedEmotion?: Emotion) => void;
  deleteJournalEntry: (id: string) => void;
  getJournalHistory: (days?: number) => JournalEntry[];
  
  // Pet Actions
  setPetName: (name: string) => void;
  feedPet: (foodType: 'snack' | 'meal' | 'treat') => void;
  playWithPet: (gameType: 'ball' | 'puzzle' | 'dance') => void;
  cleanPet: () => void;
  putPetToSleep: () => void;
  wakePet: () => void;
  getPetMood: () => PetMood;
  updatePetStats: () => void;
  decayPetStats: () => void;
  setPetSkin: (skin: PetSkin) => void;
  setPetAccessory: (accessory: PetAccessory) => void;
  addPetExperience: (amount: number) => void;
  
  // Rewards Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  unlockBadge: (badgeId: BadgeId) => void;
  claimDailyBonus: () => number;
  canClaimDailyBonus: () => boolean;
  checkAndUnlockBadges: () => void;
  purchaseSkin: (skin: PetSkin, price: number) => boolean;
  purchaseAccessory: (accessory: PetAccessory, price: number) => boolean;
  
  // Achievement Actions
  addBreathingExercise: () => void;
  addMeditationSession: () => void;
  addExercise: () => void;
  addGratitudeEntry: () => void;
  addCommunityConnection: () => void;
  
  // Weekly Plan Actions
  generateWeeklyPlan: () => void;
  completeTask: (taskId: string) => void;
  toggleHealingGoal: (id: string) => void;
  
  // Mood Prediction Actions
  generateMoodPrediction: () => void;
}

const getDefaultPet = (): VirtualPet => ({
  name: 'Buddy',
  happiness: 70,
  energy: 70,
  hunger: 70,
  cleanliness: 70,
  health: 100,
  level: 1,
  experience: 0,
  skin: 'default',
  accessory: 'none',
  lastFed: null,
  lastPlayed: null,
  lastCleaned: null,
  lastSlept: null,
  isSleeping: false,
  createdAt: new Date(),
});

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const generateTasksForDay = (day: string, moodTrend: Emotion | null): DailyTask[] => {
  const tasks: DailyTask[] = [];
  const taskTypes: Array<DailyTask['type']> = ['breathing', 'journal', 'affirmation', 'exercise', 'social', 'rest'];
  
  // Generate 2-3 tasks per day based on mood trends
  const numTasks = Math.floor(Math.random() * 2) + 2;
  
  const taskTemplates: Record<DailyTask['type'], { title: string; description: string }[]> = {
    breathing: [
      { title: '3-Minute Deep Breathing', description: 'Take slow, deep breaths to calm your mind' },
      { title: 'Box Breathing Exercise', description: '4-4-4-4 breathing pattern for focus' },
    ],
    journal: [
      { title: 'Gratitude Journal', description: 'Write 3 things you\'re grateful for' },
      { title: 'Emotion Reflection', description: 'Describe how you\'re feeling today' },
    ],
    affirmation: [
      { title: 'Morning Affirmations', description: 'Start your day with positive self-talk' },
      { title: 'Self-Compassion Practice', description: 'Speak kindly to yourself today' },
    ],
    exercise: [
      { title: '10-Minute Walk', description: 'A short walk to clear your mind' },
      { title: 'Gentle Stretching', description: 'Release tension from your body' },
    ],
    social: [
      { title: 'Reach Out to Someone', description: 'Send a message to a friend or family' },
      { title: 'Share Your Day', description: 'Tell someone about something good that happened' },
    ],
    rest: [
      { title: 'Screen-Free Break', description: '15 minutes away from devices' },
      { title: 'Power Nap', description: 'Rest your eyes for 20 minutes' },
    ],
  };

  // Prioritize certain tasks based on mood trends
  let priorityTypes = [...taskTypes];
  if (moodTrend === 'anxious' || moodTrend === 'stressed') {
    priorityTypes = ['breathing', 'rest', 'exercise', ...taskTypes];
  } else if (moodTrend === 'sad' || moodTrend === 'exhausted') {
    priorityTypes = ['social', 'affirmation', 'journal', ...taskTypes];
  }

  const usedTypes = new Set<string>();
  for (let i = 0; i < numTasks; i++) {
    let type = priorityTypes[i % priorityTypes.length];
    while (usedTypes.has(type) && usedTypes.size < taskTypes.length) {
      type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    }
    usedTypes.add(type);
    
    const templates = taskTemplates[type];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    tasks.push({
      id: `${day}-${i}-${Date.now()}`,
      day,
      title: template.title,
      description: template.description,
      type,
      completed: false,
    });
  }
  
  return tasks;
};

export const useWellMindStore = create<WellMindState>()(
  persist(
    (set, get) => ({
      user: null,
      moodEntries: [],
      journalEntries: [],
      currentStreak: 0,
      lastCheckIn: null,
      pet: getDefaultPet(),
      calmCoins: 0,
      totalCoinsEarned: 0,
      badges: [],
      dailyBonusClaimed: null,
      unlockedSkins: ['default'] as PetSkin[],
      unlockedAccessories: ['none'] as PetAccessory[],
      weeklyPlan: null,
      healingGoals: [
        {
          id: 'breathe-slowly',
          title: 'Breathe Slowly',
          description: '2 minutes of calm breathing',
          icon: '🌬️',
          completed: false,
          optional: false,
        },
        {
          id: 'express-one-thought',
          title: 'Express One Thought',
          description: 'Write or note how you feel',
          icon: '✍️',
          completed: false,
          optional: true,
        },
        {
          id: 'reach-out',
          title: 'Reach Out',
          description: 'Message someone you trust',
          icon: '💬',
          completed: false,
          optional: true,
        },
      ] as HealingGoal[],
      moodPrediction: null,
      
      // Achievement Tracking Initialization
      breathingExercises: 0,
      meditationSessions: 0,
      gratitudeEntries: 0,
      exerciseCount: 0,
      weeklyCheckIns: 0,
      monthlyCheckIns: 0,
      earlyBirdCount: 0,
      nightOwlCount: 0,
      weekendCheckIns: 0,
      communityConnections: 0,
      perfectWeekDates: [],
      consistentDays: 0,
      lastActivityDate: null,

      setUser: (user) => set({ user }),

      updateUser: (data: Partial<UserProfile>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : state.user,
      })),

      completeOnboarding: (name) => {
        set({
          user: {
            id: crypto.randomUUID(),
            name,
            notificationsEnabled: true,
            onboardingCompleted: true,
            streak: 0,
          }
        });
        get().addCoins(50);
      },

      addMoodEntry: (emotion, note, triggers) => {
        const entry: MoodEntry = {
          id: crypto.randomUUID(),
          emotion,
          note,
          triggers,
          timestamp: new Date(),
        };
        
        // Track time of day for early bird/night owl achievements
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
          set((state) => ({ earlyBirdCount: state.earlyBirdCount + 1 }));
        } else if (hour >= 20 || hour < 5) {
          set((state) => ({ nightOwlCount: state.nightOwlCount + 1 }));
        }
        
        // Track weekend check-ins
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          set((state) => ({ weekendCheckIns: state.weekendCheckIns + 1 }));
        }
        
        set((state) => ({
          moodEntries: [entry, ...state.moodEntries],
          lastCheckIn: new Date(),
        }));
        
        get().updateStreak();
        get().addCoins(10);
        get().updatePetStats();
        get().addPetExperience(15);
        get().checkAndUnlockBadges();
        get().generateMoodPrediction();
      },

      getMoodHistory: (days = 7) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return get().moodEntries.filter(
          (entry) => new Date(entry.timestamp) >= cutoff
        );
      },

      getTodaysMood: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().moodEntries.find((entry) => {
          const entryDate = new Date(entry.timestamp);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === today.getTime();
        });
      },

      // Journal Actions
      addJournalEntry: (content, linkedMoodId, linkedEmotion) => {
        const entry: JournalEntry = {
          id: crypto.randomUUID(),
          content,
          linkedMoodId,
          linkedEmotion,
          timestamp: new Date(),
        };
        
        set((state) => ({
          journalEntries: [entry, ...state.journalEntries],
        }));
        
        get().addCoins(5);
        get().checkAndUnlockBadges();
      },

      deleteJournalEntry: (id) => {
        set((state) => ({
          journalEntries: state.journalEntries.filter((entry) => entry.id !== id),
        }));
      },

      getJournalHistory: (days = 30) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return get().journalEntries.filter(
          (entry) => new Date(entry.timestamp) >= cutoff
        );
      },

      updateStreak: () => {
        const { lastCheckIn, currentStreak } = get();
        const now = new Date();
        const safeStreak = typeof currentStreak === 'number' && !isNaN(currentStreak) ? currentStreak : 0;
        
        if (!lastCheckIn) {
          set({ currentStreak: 1 });
          return;
        }

        const lastDate = new Date(lastCheckIn);
        const diffDays = Math.floor(
          (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          return;
        } else if (diffDays === 1) {
          set({ currentStreak: safeStreak + 1 });
        } else {
          set({ currentStreak: 1 });
        }
      },

      // Pet Actions
      setPetName: (name) => set((state) => ({
        pet: { ...state.pet, name }
      })),

      feedPet: (foodType) => {
        const costs = { snack: 3, meal: 8, treat: 15 };
        const hungerGain = { snack: 15, meal: 35, treat: 50 };
        const happinessGain = { snack: 3, meal: 8, treat: 20 };
        
        const cost = costs[foodType];
        if (get().calmCoins < cost) return;
        
        set((state) => ({
          pet: {
            ...state.pet,
            hunger: Math.min(100, state.pet.hunger + hungerGain[foodType]),
            happiness: Math.min(100, state.pet.happiness + happinessGain[foodType]),
            lastFed: new Date(),
          },
          calmCoins: state.calmCoins - cost,
        }));
        get().addPetExperience(5);
        get().checkAndUnlockBadges();
      },

      playWithPet: (gameType) => {
        const costs = { ball: 3, puzzle: 5, dance: 8 };
        const happinessGain = { ball: 20, puzzle: 25, dance: 35 };
        const energyLoss = { ball: 15, puzzle: 8, dance: 20 };
        const expGain = { ball: 8, puzzle: 15, dance: 12 };
        
        const cost = costs[gameType];
        if (get().calmCoins < cost || get().pet.energy < energyLoss[gameType]) return;
        
        set((state) => ({
          pet: {
            ...state.pet,
            happiness: Math.min(100, state.pet.happiness + happinessGain[gameType]),
            energy: Math.max(0, state.pet.energy - energyLoss[gameType]),
            lastPlayed: new Date(),
          },
          calmCoins: state.calmCoins - cost,
        }));
        get().addPetExperience(expGain[gameType]);
        get().checkAndUnlockBadges();
      },

      cleanPet: () => {
        if (get().calmCoins < 5) return;
        
        set((state) => ({
          pet: {
            ...state.pet,
            cleanliness: 100,
            happiness: Math.min(100, state.pet.happiness + 10),
            health: Math.min(100, state.pet.health + 5),
            lastCleaned: new Date(),
          },
          calmCoins: state.calmCoins - 5,
        }));
        get().addPetExperience(5);
      },

      putPetToSleep: () => {
        set((state) => ({
          pet: {
            ...state.pet,
            isSleeping: true,
            lastSlept: new Date(),
          },
        }));
      },

      wakePet: () => {
        const { pet } = get();
        if (!pet.lastSlept) {
          set((state) => ({ pet: { ...state.pet, isSleeping: false } }));
          return;
        }
        
        const sleepTime = (new Date().getTime() - new Date(pet.lastSlept).getTime()) / 1000 / 60;
        const energyGain = Math.min(100, Math.floor(sleepTime * 2));
        
        set((state) => ({
          pet: {
            ...state.pet,
            isSleeping: false,
            energy: Math.min(100, state.pet.energy + energyGain),
            health: Math.min(100, state.pet.health + Math.floor(energyGain / 4)),
          },
        }));
      },

      getPetMood: () => {
        const { pet } = get();
        if (pet.isSleeping) return 'sleeping';
        if (pet.health < 30) return 'sick';
        
        const avg = (pet.happiness + pet.energy + pet.hunger + pet.cleanliness) / 4;
        if (avg >= 80) return 'thriving';
        if (avg >= 60) return 'happy';
        if (avg >= 40) return 'content';
        if (avg >= 20) return 'tired';
        return 'sad';
      },

      updatePetStats: () => {
        set((state) => ({
          pet: {
            ...state.pet,
            happiness: Math.min(100, state.pet.happiness + 5),
            energy: Math.min(100, state.pet.energy + 3),
          }
        }));
      },

      decayPetStats: () => {
        set((state) => ({
          pet: {
            ...state.pet,
            hunger: Math.max(0, state.pet.hunger - 2),
            cleanliness: Math.max(0, state.pet.cleanliness - 1),
            happiness: Math.max(0, state.pet.happiness - 1),
            health: state.pet.hunger < 20 || state.pet.cleanliness < 20 
              ? Math.max(0, state.pet.health - 2) 
              : state.pet.health,
          }
        }));
      },

      setPetSkin: (skin) => {
        if (!get().unlockedSkins.includes(skin)) return;
        set((state) => ({ pet: { ...state.pet, skin } }));
      },

      setPetAccessory: (accessory) => {
        if (!get().unlockedAccessories.includes(accessory)) return;
        set((state) => ({ pet: { ...state.pet, accessory } }));
      },

      addPetExperience: (amount) => {
        const { pet } = get();
        const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
        const safeExp = typeof pet.experience === 'number' && !isNaN(pet.experience) ? pet.experience : 0;
        const safeLevel = typeof pet.level === 'number' && !isNaN(pet.level) ? pet.level : 1;
        
        const newExp = safeExp + safeAmount;
        const expToLevel = safeLevel * 100;
        
        if (newExp >= expToLevel) {
          set((state) => ({
            pet: {
              ...state.pet,
              level: safeLevel + 1,
              experience: newExp - expToLevel,
            }
          }));
          get().addCoins(safeLevel * 10);
          get().checkAndUnlockBadges();
        } else {
          set((state) => ({
            pet: { ...state.pet, experience: newExp }
          }));
        }
      },

      // Rewards Actions
      addCoins: (amount) => {
        const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
        set((state) => ({
          calmCoins: Math.max(0, (state.calmCoins || 0) + safeAmount),
          totalCoinsEarned: Math.max(0, (state.totalCoinsEarned || 0) + safeAmount),
        }));
        get().checkAndUnlockBadges();
      },

      spendCoins: (amount) => {
        const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
        if ((get().calmCoins || 0) < safeAmount) return false;
        set((state) => ({ calmCoins: Math.max(0, (state.calmCoins || 0) - safeAmount) }));
        return true;
      },

      unlockBadge: (badgeId) => {
        if (get().badges.includes(badgeId)) return;
        set((state) => ({ badges: [...state.badges, badgeId] }));
        get().addCoins(25);
      },

      claimDailyBonus: () => {
        if (!get().canClaimDailyBonus()) return 0;
        const bonus = 15;
        set({ dailyBonusClaimed: new Date() });
        get().addCoins(bonus);
        return bonus;
      },

      canClaimDailyBonus: () => {
        const { dailyBonusClaimed } = get();
        if (!dailyBonusClaimed) return true;
        const lastClaim = new Date(dailyBonusClaimed);
        const now = new Date();
        return lastClaim.toDateString() !== now.toDateString();
      },

      purchaseSkin: (skin, price) => {
        if (get().unlockedSkins.includes(skin)) return false;
        if (!get().spendCoins(price)) return false;
        set((state) => ({ unlockedSkins: [...state.unlockedSkins, skin] }));
        return true;
      },

      purchaseAccessory: (accessory, price) => {
        if (get().unlockedAccessories.includes(accessory)) return false;
        if (!get().spendCoins(price)) return false;
        set((state) => ({ unlockedAccessories: [...state.unlockedAccessories, accessory] }));
        return true;
      },

      checkAndUnlockBadges: () => {
        const state = get();
        const { moodEntries, journalEntries, currentStreak, totalCoinsEarned, badges, pet, breathingExercises, meditationSessions, gratitudeEntries, exerciseCount, earlyBirdCount, nightOwlCount, weekendCheckIns, communityConnections } = state;
        
        // ===== PROGRESS (10) =====
        if (moodEntries.length >= 1 && !badges.includes('first_checkin')) {
          get().unlockBadge('first_checkin');
        }
        if (currentStreak >= 3 && !badges.includes('streak_3')) {
          get().unlockBadge('streak_3');
        }
        if (currentStreak >= 7 && !badges.includes('streak_7')) {
          get().unlockBadge('streak_7');
        }
        if (currentStreak >= 14 && !badges.includes('streak_14')) {
          get().unlockBadge('streak_14');
        }
        if (currentStreak >= 30 && !badges.includes('streak_30')) {
          get().unlockBadge('streak_30');
        }
        if (currentStreak >= 60 && !badges.includes('streak_60')) {
          get().unlockBadge('streak_60');
        }
        if (currentStreak >= 100 && !badges.includes('streak_100')) {
          get().unlockBadge('streak_100');
        }
        if (journalEntries.length >= 1 && !badges.includes('first_journal')) {
          get().unlockBadge('first_journal');
        }
        if (breathingExercises >= 1 && !badges.includes('first_breathing')) {
          get().unlockBadge('first_breathing');
        }
        if (meditationSessions >= 1 && !badges.includes('first_meditation')) {
          get().unlockBadge('first_meditation');
        }
        
        // ===== SKILLS (10) =====
        if (breathingExercises >= 10 && !badges.includes('breathing_master')) {
          get().unlockBadge('breathing_master');
        }
        if (breathingExercises >= 25 && !badges.includes('breathing_expert')) {
          get().unlockBadge('breathing_expert');
        }
        if (journalEntries.length >= 3 && !badges.includes('journal_starter')) {
          get().unlockBadge('journal_starter');
        }
        if (journalEntries.length >= 10 && !badges.includes('journal_master')) {
          get().unlockBadge('journal_master');
        }
        if (journalEntries.length >= 25 && !badges.includes('journal_pro')) {
          get().unlockBadge('journal_pro');
        }
        if (meditationSessions >= 5 && !badges.includes('meditation_beginner')) {
          get().unlockBadge('meditation_beginner');
        }
        if (meditationSessions >= 25 && !badges.includes('meditation_master')) {
          get().unlockBadge('meditation_master');
        }
        if (moodEntries.length >= 10 && !badges.includes('mood_tracker')) {
          get().unlockBadge('mood_tracker');
        }
        if (moodEntries.length >= 50 && !badges.includes('mood_analyst')) {
          get().unlockBadge('mood_analyst');
        }
        if (gratitudeEntries >= 10 && !badges.includes('gratitude_practice')) {
          get().unlockBadge('gratitude_practice');
        }
        
        // ===== ACTIVITIES (10) =====
        if (breathingExercises >= 1 && meditationSessions >= 1 && exerciseCount >= 1 && !badges.includes('calm_explorer')) {
          get().unlockBadge('calm_explorer');
        }
        if ((breathingExercises + meditationSessions) >= 15 && !badges.includes('mindfulness_journey')) {
          get().unlockBadge('mindfulness_journey');
        }
        if (exerciseCount >= 10 && !badges.includes('exercise_enthusiast')) {
          get().unlockBadge('exercise_enthusiast');
        }
        if (exerciseCount >= 25 && !badges.includes('exercise_warrior')) {
          get().unlockBadge('exercise_warrior');
        }
        if (communityConnections >= 5 && !badges.includes('social_butterfly')) {
          get().unlockBadge('social_butterfly');
        }
        // These would need actual app integration to track properly
        if (!badges.includes('reading_lover') && Math.random() > 0.9) {
          // Placeholder for reading tracker
        }
        if (!badges.includes('podcast_listener') && Math.random() > 0.9) {
          // Placeholder for podcast tracker
        }
        if (!badges.includes('music_therapist') && Math.random() > 0.9) {
          // Placeholder for music tracker
        }
        if ((moodEntries.length > 0 || journalEntries.length > 0) && currentStreak >= 7 && !badges.includes('wellness_routine')) {
          get().unlockBadge('wellness_routine');
        }
        if (currentStreak >= 7 && moodEntries.filter(e => {
          const date = new Date(e.timestamp);
          const today = new Date();
          return date.toDateString() === today.toDateString();
        }).length >= 1 && !badges.includes('perfect_week')) {
          get().unlockBadge('perfect_week');
        }
        
        // ===== MILESTONES (10) =====
        if (totalCoinsEarned >= 100 && !badges.includes('coin_collector')) {
          get().unlockBadge('coin_collector');
        }
        if (totalCoinsEarned >= 500 && !badges.includes('coin_wealthy')) {
          get().unlockBadge('coin_wealthy');
        }
        if (totalCoinsEarned >= 1000 && !badges.includes('coin_rich')) {
          get().unlockBadge('coin_rich');
        }
        if (totalCoinsEarned >= 2500 && !badges.includes('coin_elite')) {
          get().unlockBadge('coin_elite');
        }
        if (moodEntries.length >= 30 && !badges.includes('monthly_champion')) {
          get().unlockBadge('monthly_champion');
        }
        if (moodEntries.length >= 90 && !badges.includes('quarterly_champion')) {
          get().unlockBadge('quarterly_champion');
        }
        if (moodEntries.length >= 365 && !badges.includes('yearly_champion')) {
          get().unlockBadge('yearly_champion');
        }
        if (currentStreak >= 30 && !badges.includes('consistency_king')) {
          get().unlockBadge('consistency_king');
        }
        if (badges.length > 0 && badges.length % 10 === 0 && !badges.includes('comeback_champion')) {
          get().unlockBadge('comeback_champion');
        }
        if (badges.length >= 10 && !badges.includes('milestone_master')) {
          get().unlockBadge('milestone_master');
        }
        
        // ===== SPECIAL (10) =====
        if (pet.happiness >= 90 && !badges.includes('pet_lover')) {
          get().unlockBadge('pet_lover');
        }
        if (pet.level >= 5 && !badges.includes('pet_trainer')) {
          get().unlockBadge('pet_trainer');
        }
        if (pet.level >= 10 && !badges.includes('pet_master')) {
          get().unlockBadge('pet_master');
        }
        if (pet.level >= 25 && !badges.includes('pet_level_25')) {
          get().unlockBadge('pet_level_25');
        }
        if (pet.happiness >= 95 && pet.health >= 90 && pet.cleanliness >= 90 && !badges.includes('perfect_pet')) {
          get().unlockBadge('perfect_pet');
        }
        if (earlyBirdCount >= 7 && !badges.includes('early_bird')) {
          get().unlockBadge('early_bird');
        }
        if (nightOwlCount >= 7 && !badges.includes('night_owl')) {
          get().unlockBadge('night_owl');
        }
        if (weekendCheckIns >= 4 && !badges.includes('weekend_warrior')) {
          get().unlockBadge('weekend_warrior');
        }
        if (communityConnections >= 5 && !badges.includes('community_helper')) {
          get().unlockBadge('community_helper');
        }
        // Wellness ambassador - unlock all categories
        const hasProgress = badges.some(b => ['first_checkin', 'streak_3', 'streak_7', 'streak_14', 'streak_30', 'streak_60', 'streak_100', 'first_journal', 'first_breathing', 'first_meditation'].includes(b));
        const hasSkills = badges.some(b => ['breathing_master', 'breathing_expert', 'journal_starter', 'journal_master', 'journal_pro', 'meditation_beginner', 'meditation_master', 'mood_tracker', 'mood_analyst', 'gratitude_practice'].includes(b));
        const hasActivities = badges.some(b => ['calm_explorer', 'mindfulness_journey', 'exercise_enthusiast', 'exercise_warrior', 'social_butterfly', 'wellness_routine', 'perfect_week'].includes(b));
        const hasMilestones = badges.some(b => ['coin_collector', 'coin_wealthy', 'monthly_champion', 'yearly_champion', 'consistency_king'].includes(b));
        const hasSpecial = badges.some(b => ['pet_lover', 'pet_trainer', 'pet_master', 'early_bird', 'night_owl', 'weekend_warrior'].includes(b));
        if (hasProgress && hasSkills && hasActivities && hasMilestones && hasSpecial && !badges.includes('wellness_ambassador')) {
          get().unlockBadge('wellness_ambassador');
        }
      },
      
      addBreathingExercise: () => {
        set((state) => ({ breathingExercises: (state.breathingExercises || 0) + 1 }));
        get().addCoins(5);
        get().checkAndUnlockBadges();
      },
      
      addMeditationSession: () => {
        set((state) => ({ meditationSessions: (state.meditationSessions || 0) + 1 }));
        get().addCoins(8);
        get().checkAndUnlockBadges();
      },
      
      addExercise: () => {
        set((state) => ({ exerciseCount: (state.exerciseCount || 0) + 1 }));
        get().addCoins(7);
        get().checkAndUnlockBadges();
      },
      
      addGratitudeEntry: () => {
        set((state) => ({ gratitudeEntries: (state.gratitudeEntries || 0) + 1 }));
        get().addCoins(5);
        get().checkAndUnlockBadges();
      },
      
      addCommunityConnection: () => {
        set((state) => ({ communityConnections: (state.communityConnections || 0) + 1 }));
        get().addCoins(10);
        get().checkAndUnlockBadges();
      },

      toggleHealingGoal: (id) => {
        const goal = get().healingGoals.find((item) => item.id === id);
        if (!goal) return;

        const wasCompleted = goal.completed;
        set((state) => ({
          healingGoals: state.healingGoals.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        }));

        if (!wasCompleted) {
          get().addCoins(10);
          get().addPetExperience(5);
          get().checkAndUnlockBadges();
        }
      },

      // Weekly Plan Actions
      generateWeeklyPlan: () => {
        const { moodEntries } = get();
        const recentMoods = moodEntries.slice(0, 7);
        
        // Find most common mood
        const moodCounts: Record<string, number> = {};
        recentMoods.forEach(entry => {
          moodCounts[entry.emotion] = (moodCounts[entry.emotion] || 0) + 1;
        });
        
        let dominantMood: Emotion | null = null;
        let maxCount = 0;
        Object.entries(moodCounts).forEach(([mood, count]) => {
          if (count > maxCount) {
            maxCount = count;
            dominantMood = mood as Emotion;
          }
        });

        const today = new Date();
        const dayOfWeek = today.getDay();
        const tasks: DailyTask[] = [];
        
        for (let i = 0; i < 7; i++) {
          const dayIndex = (dayOfWeek + i) % 7;
          const dayTasks = generateTasksForDay(DAYS[dayIndex], dominantMood);
          tasks.push(...dayTasks);
        }

        set({
          weeklyPlan: {
            id: crypto.randomUUID(),
            weekStart: today,
            tasks,
            generatedAt: new Date(),
          }
        });
      },

      completeTask: (taskId) => {
        const { weeklyPlan } = get();
        if (!weeklyPlan) return;
        
        const task = weeklyPlan.tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;
        
        set((state) => ({
          weeklyPlan: state.weeklyPlan ? {
            ...state.weeklyPlan,
            tasks: state.weeklyPlan.tasks.map(t =>
              t.id === taskId ? { ...t, completed: true } : t
            ),
          } : null,
        }));
        
        get().addCoins(8);
        get().addPetExperience(10);
      },

      // Mood Prediction
      generateMoodPrediction: () => {
        const { moodEntries } = get();
        if (moodEntries.length < 3) {
          set({ moodPrediction: null });
          return;
        }

        const recentMoods = moodEntries.slice(0, 7);
        const moodScores: Record<Emotion, number> = {
          happy: 5, neutral: 3, sad: 1, anxious: 2, stressed: 2, exhausted: 1, numb: 1
        };
        
        // Calculate weighted average (more recent = more weight)
        let weightedSum = 0;
        let weightTotal = 0;
        recentMoods.forEach((entry, index) => {
          const weight = recentMoods.length - index;
          weightedSum += moodScores[entry.emotion] * weight;
          weightTotal += weight;
        });
        
        const avgScore = weightedSum / weightTotal;
        
        // Predict based on trends
        let predictedMood: Emotion;
        let confidence: number;
        let reason: string;
        let suggestion: string;

        if (avgScore >= 4) {
          predictedMood = 'happy';
          confidence = 75;
          reason = 'Your recent mood has been positive!';
          suggestion = 'Keep up the good habits that are working for you.';
        } else if (avgScore >= 3) {
          predictedMood = 'neutral';
          confidence = 65;
          reason = 'Your mood has been stable lately.';
          suggestion = 'Try a breathing exercise to maintain balance.';
        } else if (avgScore >= 2) {
          predictedMood = 'anxious';
          confidence = 70;
          reason = 'We noticed some stress patterns in your recent entries.';
          suggestion = 'Consider a mindfulness session before bed tonight.';
        } else {
          predictedMood = 'stressed';
          confidence = 60;
          reason = 'Your recent entries suggest elevated stress levels.';
          suggestion = 'Take extra care of yourself. A breathing exercise might help.';
        }

        // Check for day-of-week patterns
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDay = tomorrow.getDay();
        
        const sameDayMoods = moodEntries.filter(entry => {
          return new Date(entry.timestamp).getDay() === tomorrowDay;
        });

        if (sameDayMoods.length >= 2) {
          const negativeMoods = sameDayMoods.filter(e => 
            ['sad', 'anxious', 'stressed', 'exhausted'].includes(e.emotion)
          );
          if (negativeMoods.length > sameDayMoods.length / 2) {
            confidence = Math.min(85, confidence + 10);
            reason = `${DAYS[tomorrowDay]}s tend to be challenging for you based on your history.`;
          }
        }

        set({
          moodPrediction: {
            predictedMood,
            confidence,
            reason,
            suggestion,
            predictedFor: tomorrow,
            generatedAt: new Date(),
          }
        });
      },
    }),
    {
      name: 'wellmind-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Migration function to ensure data integrity
        if (version === 0 || version === 1) {
          // Validate and fix numeric fields
          return {
            ...persistedState,
            calmCoins: typeof persistedState.calmCoins === 'number' && !isNaN(persistedState.calmCoins) 
              ? persistedState.calmCoins 
              : 0,
            totalCoinsEarned: typeof persistedState.totalCoinsEarned === 'number' && !isNaN(persistedState.totalCoinsEarned)
              ? persistedState.totalCoinsEarned
              : 0,
            currentStreak: typeof persistedState.currentStreak === 'number' && !isNaN(persistedState.currentStreak)
              ? persistedState.currentStreak
              : 0,
            breathingExercises: typeof persistedState.breathingExercises === 'number' && !isNaN(persistedState.breathingExercises)
              ? persistedState.breathingExercises
              : 0,
            meditationSessions: typeof persistedState.meditationSessions === 'number' && !isNaN(persistedState.meditationSessions)
              ? persistedState.meditationSessions
              : 0,
            gratitudeEntries: typeof persistedState.gratitudeEntries === 'number' && !isNaN(persistedState.gratitudeEntries)
              ? persistedState.gratitudeEntries
              : 0,
            exerciseCount: typeof persistedState.exerciseCount === 'number' && !isNaN(persistedState.exerciseCount)
              ? persistedState.exerciseCount
              : 0,
            weeklyCheckIns: typeof persistedState.weeklyCheckIns === 'number' && !isNaN(persistedState.weeklyCheckIns)
              ? persistedState.weeklyCheckIns
              : 0,
            monthlyCheckIns: typeof persistedState.monthlyCheckIns === 'number' && !isNaN(persistedState.monthlyCheckIns)
              ? persistedState.monthlyCheckIns
              : 0,
            earlyBirdCount: typeof persistedState.earlyBirdCount === 'number' && !isNaN(persistedState.earlyBirdCount)
              ? persistedState.earlyBirdCount
              : 0,
            nightOwlCount: typeof persistedState.nightOwlCount === 'number' && !isNaN(persistedState.nightOwlCount)
              ? persistedState.nightOwlCount
              : 0,
            weekendCheckIns: typeof persistedState.weekendCheckIns === 'number' && !isNaN(persistedState.weekendCheckIns)
              ? persistedState.weekendCheckIns
              : 0,
            communityConnections: typeof persistedState.communityConnections === 'number' && !isNaN(persistedState.communityConnections)
              ? persistedState.communityConnections
              : 0,
            consistentDays: typeof persistedState.consistentDays === 'number' && !isNaN(persistedState.consistentDays)
              ? persistedState.consistentDays
              : 0,
            badges: Array.isArray(persistedState.badges) ? persistedState.badges : [],
            moodEntries: Array.isArray(persistedState.moodEntries) ? persistedState.moodEntries : [],
            journalEntries: Array.isArray(persistedState.journalEntries) ? persistedState.journalEntries : [],
          };
        }
        return persistedState;
      },
    }
  )
);
