import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Emotion, MoodEntry, UserProfile, VirtualPet, PetMood, BadgeId, 
  PetSkin, PetAccessory, WeeklyPlan, DailyTask, MoodPrediction 
} from '@/types/wellmind';

interface WellMindState {
  user: UserProfile | null;
  moodEntries: MoodEntry[];
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
  
  // Mood Prediction
  moodPrediction: MoodPrediction | null;
  
  // Actions
  setUser: (user: UserProfile) => void;
  completeOnboarding: (name: string) => void;
  addMoodEntry: (emotion: Emotion, note?: string, triggers?: string[]) => void;
  getMoodHistory: (days?: number) => MoodEntry[];
  getTodaysMood: () => MoodEntry | undefined;
  updateStreak: () => void;
  
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
  
  // Weekly Plan Actions
  generateWeeklyPlan: () => void;
  completeTask: (taskId: string) => void;
  
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
      moodPrediction: null,

      setUser: (user) => set({ user }),

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

      updateStreak: () => {
        const { lastCheckIn, currentStreak } = get();
        const now = new Date();
        
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
          set({ currentStreak: currentStreak + 1 });
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
        const newExp = pet.experience + amount;
        const expToLevel = pet.level * 100;
        
        if (newExp >= expToLevel) {
          set((state) => ({
            pet: {
              ...state.pet,
              level: state.pet.level + 1,
              experience: newExp - expToLevel,
            }
          }));
          get().addCoins(pet.level * 10);
          get().checkAndUnlockBadges();
        } else {
          set((state) => ({
            pet: { ...state.pet, experience: newExp }
          }));
        }
      },

      // Rewards Actions
      addCoins: (amount) => {
        set((state) => ({
          calmCoins: state.calmCoins + amount,
          totalCoinsEarned: state.totalCoinsEarned + amount,
        }));
        get().checkAndUnlockBadges();
      },

      spendCoins: (amount) => {
        if (get().calmCoins < amount) return false;
        set((state) => ({ calmCoins: state.calmCoins - amount }));
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
        const { moodEntries, currentStreak, totalCoinsEarned, badges, pet } = get();
        
        if (moodEntries.length >= 1 && !badges.includes('first_checkin')) {
          get().unlockBadge('first_checkin');
        }
        if (currentStreak >= 3 && !badges.includes('streak_3')) {
          get().unlockBadge('streak_3');
        }
        if (currentStreak >= 7 && !badges.includes('streak_7')) {
          get().unlockBadge('streak_7');
        }
        if (currentStreak >= 30 && !badges.includes('streak_30')) {
          get().unlockBadge('streak_30');
        }
        if (moodEntries.length >= 10 && !badges.includes('mood_tracker')) {
          get().unlockBadge('mood_tracker');
        }
        if (totalCoinsEarned >= 100 && !badges.includes('coin_collector')) {
          get().unlockBadge('coin_collector');
        }
        if (pet.happiness >= 90 && !badges.includes('pet_lover')) {
          get().unlockBadge('pet_lover');
        }
        if (pet.level >= 5 && !badges.includes('pet_level_5')) {
          get().unlockBadge('pet_level_5');
        }
        if (pet.level >= 10 && !badges.includes('pet_level_10')) {
          get().unlockBadge('pet_level_10');
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
    }
  )
);
