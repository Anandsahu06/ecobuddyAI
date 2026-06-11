"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LevelProgression } from "../lib/level-progression";
import { db, isConfigured } from "../lib/firebase";
import ProfileSelector from "../components/profile-selector";
import { Leaf } from "lucide-react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export interface ActivityLog {
  id: string;
  rawInput: string;
  category: "Transport" | "Food" | "Energy" | "Waste" | "None";
  co2SavedKg: number;
  carbonPoints: number;
  loggedAt: string;
  localDate?: string;
  metadata?: Record<string, unknown>;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  category: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetCo2: number;
  progress: number;
  completed: boolean;
}

export interface Skin {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  cost: number;
}

export interface Profile {
  id: string;
  name: string;
  displayName?: string;
  carbonScore: number;
  buddyLevel: number;
  buddyXp: number;
  streak: number;
  longestStreak?: number;
  greenPoints: number;
  equippedSkin: string;
  unlockedSkins: string[];
  logs: ActivityLog[];
  badges: Badge[];
  quests: Quest[];
  streakShields: number;
  lastQuestRefreshDate?: string;
}

interface AppContextType {
  profiles: Profile[];
  currentProfileId: string;
  currentProfile: Profile | null;
  carbonScore: number;
  buddyLevel: number;
  buddyXp: number;
  streak: number;
  greenPoints: number;
  equippedSkin: string;
  unlockedSkins: string[];
  logs: ActivityLog[];
  badges: Badge[];
  quests: Quest[];
  skinsCatalog: Skin[];
  streakShields: number;
  createProfile: (name: string) => void;
  switchProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  addLog: (rawInput: string, category: string, co2SavedKg: number) => void;
  buySkin: (skinId: string, cost: number) => boolean | Promise<boolean>;
  buyStreakShield: () => boolean | Promise<boolean>;
  equipSkin: (skinId: string) => void;
  resetState: () => void;
  toggleBadge: (badgeId: string) => void;
  completeQuest: (questId: string) => void;
}

const defaultBadges: Badge[] = [
  { id: "1", title: "Eco Pioneer", description: "First carbon log submitted.", icon: "🌱", unlocked: false, category: "General" },
  { id: "2", title: "Pedal Power", description: "Log 5 transport-saving commutes.", icon: "🚲", unlocked: false, category: "Transport" },
  { id: "3", title: "Herbivore", description: "Log 3 plant-based meal swaps.", icon: "🥗", unlocked: false, category: "Food" },
  { id: "4", title: "Volt Miser", description: "Save 10 kg of electricity emissions.", icon: "🔌", unlocked: false, category: "Energy" },
  { id: "5", title: "Recycle Hero", description: "Perform 5 waste recycling logs.", icon: "♻️", unlocked: false, category: "Waste" },
  { id: "6", title: "Century Saver", description: "Save over 100 kg of total CO2.", icon: "👑", unlocked: false, category: "General" },
];

export const getLocalDateString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const questPool: Omit<Quest, "progress" | "completed">[] = [
  { id: "q1", title: "Meatless Commute", description: "Eat veggie and ride transit/walk today.", targetCo2: 2.2 },
  { id: "q2", title: "Standby Shutdown", description: "Unplug 3 appliances when leaving.", targetCo2: 0.3 },
  { id: "q3", title: "Zero Plastic Challenge", description: "Avoid single-use water bottles for 3 days.", targetCo2: 0.24 },
  { id: "q4", title: "Cold Wash", description: "Wash laundry using cold water instead of hot.", targetCo2: 0.5 },
  { id: "q5", title: "Biking Commute", description: "Ride a bicycle to work or school.", targetCo2: 1.8 },
  { id: "q6", title: "Local Feast", description: "Eat a meal prepared entirely with local ingredients.", targetCo2: 1.0 },
  { id: "q7", title: "Lights Out", description: "Keep non-essential lights off for 4 hours.", targetCo2: 0.4 },
  { id: "q8", title: "Line Dry", description: "Hang dry a load of laundry instead of using the dryer.", targetCo2: 1.2 },
  { id: "q9", title: "Carpool Buddy", description: "Share a ride with someone instead of driving alone.", targetCo2: 2.0 },
  { id: "q10", title: "Eco Shopping", description: "Use reusable canvas bags for grocery shopping.", targetCo2: 0.1 },
];

export const getRandomQuests = (count: number): Quest[] => {
  const shuffled = [...questPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(q => ({
    ...q,
    progress: 0,
    completed: false
  }));
};

const defaultQuests: Quest[] = [
  { id: "q1", title: "Meatless Commute", description: "Eat veggie and ride transit/walk today.", targetCo2: 2.2, progress: 0, completed: false },
  { id: "q2", title: "Standby Shutdown", description: "Unplug 3 appliances when leaving.", targetCo2: 0.3, progress: 0, completed: false },
  { id: "q3", title: "Zero Plastic Challenge", description: "Avoid single-use water bottles for 3 days.", targetCo2: 0.24, progress: 0, completed: false },
];

const skinsCatalog: Skin[] = [
  { id: "default", name: "Classic Green", icon: "🌱", emoji: "", cost: 0 },
  { id: "santa_hat", name: "Santa Hat", icon: "🎅", emoji: "🎅", cost: 150 },
  { id: "sunglasses", name: "Cool Shades", icon: "🕶️", emoji: "🕶️", cost: 250 },
  { id: "crown", name: "Royal Crown", icon: "👑", emoji: "👑", cost: 500 }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateProfileId = () => `profile-${Date.now()}`;
const generateLogId = () => `log-${Date.now()}`;
const generateDeviceId = () => `dev-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string>("");
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudActive, setIsCloudActive] = useState(false);
  const [deviceUserId, setDeviceUserId] = useState("");
  const [isConnectionChecking, setIsConnectionChecking] = useState(true);

  // Initialize Unique Device ID and check Firebase database availability
  useEffect(() => {
    if (typeof window !== "undefined") {
      let savedUid = localStorage.getItem("ecobuddy_device_user_id");
      if (!savedUid) {
        savedUid = generateDeviceId();
        localStorage.setItem("ecobuddy_device_user_id", savedUid);
      }
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setDeviceUserId(savedUid);

      const checkFirebaseConnection = async () => {
        if (db && isConfigured) {
          setIsCloudActive(true);
          setIsConnectionChecking(false);
          return;
        }

        if (db) {
          try {
            // Ping the Firestore emulator port (localhost:8080) to check if online
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);
            
            await fetch("http://localhost:8080", { 
              mode: "no-cors", 
              signal: controller.signal 
            });
            
            clearTimeout(timeoutId);
            setIsCloudActive(true);
          } catch {
            console.warn("⚠️ Firestore emulator is offline. Falling back to Local Sandbox.");
            setIsCloudActive(false);
          }
        } else {
          setIsCloudActive(false);
        }
        setIsConnectionChecking(false);
      };

      checkFirebaseConnection();
    }
  }, []);

  // Sync profiles from Firestore (with LocalStorage fallback)
  useEffect(() => {
    if (!deviceUserId || isConnectionChecking) return;

    if (!isCloudActive) {
      // Offline local storage fallback
      const savedProfiles = localStorage.getItem("ecobuddy_profiles");
      const savedActiveId = localStorage.getItem("ecobuddy_active_profile_id");

      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles);
        /* eslint-disable-next-line react-hooks/set-state-in-effect */
        setProfiles(parsed);
        if (savedActiveId && parsed.some((p: Profile) => p.id === savedActiveId)) {
          setCurrentProfileId(savedActiveId);
        } else if (parsed.length > 0) {
          setCurrentProfileId(parsed[0].id);
        }
      }
      setIsLoading(false);
      return;
    }

    // Subscribe to Firestore profiles query for this device
    const q = query(collection(db, "users"), where("deviceUserId", "==", deviceUserId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const profilesData: Profile[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          profilesData.push({
            id: doc.id,
            name: data.name || "Eco Hero",
            displayName: data.displayName || data.name || "Eco Hero",
            carbonScore: data.stats?.totalCo2SavedKg || 0,
            buddyLevel: data.buddy?.level || 1,
            buddyXp: data.buddy?.xp || 0,
            streak: data.stats?.currentStreak || 0,
            longestStreak: data.stats?.longestStreak || 0,
            greenPoints: data.greenPoints || 0,
            equippedSkin: data.equippedSkin || "default",
            unlockedSkins: data.unlockedSkins || ["default"],
            streakShields: data.streakShields || 0,
            logs: [], // Synced separately in active log sub-listener
            badges: data.badges || defaultBadges,
            quests: data.quests || defaultQuests,
            lastQuestRefreshDate: data.lastQuestRefreshDate || "",
          });
        });

        setProfiles(profilesData);

        // Restore active profile ID if valid
        const savedActiveId = localStorage.getItem("ecobuddy_active_profile_id");
        if (savedActiveId && profilesData.some((p) => p.id === savedActiveId)) {
          setCurrentProfileId(savedActiveId);
        } else {
          setCurrentProfileId("");
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore profiles listener error, falling back to local storage:", error);
        setIsCloudActive(false);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isCloudActive, deviceUserId, isConnectionChecking]);

  // Sync logs from Firestore subcollection for the active profile (with LocalStorage fallback)
  useEffect(() => {
    if (!currentProfileId) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setLogs([]);
      return;
    }

    if (isCloudActive && db) {
      const logsRef = collection(db, "users", currentProfileId, "activities");
      const unsubscribe = onSnapshot(
        logsRef,
        (snapshot) => {
          const logsList: ActivityLog[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            logsList.push({
              id: doc.id,
              rawInput: data.rawInput || "",
              category: data.category || "None",
              co2SavedKg: data.co2SavedKg || 0,
              carbonPoints: Math.max(1, Math.round((data.co2SavedKg || 0) * 10)),
              loggedAt: data.loggedAt || new Date().toISOString(),
            });
          });

          // Sort by date descending
          logsList.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
          setLogs(logsList);
        },
        (error) => {
          console.error("Firestore activities listener error:", error);
        }
      );

      return () => unsubscribe();
    } else {
      const activeProf = profiles.find((p) => p.id === currentProfileId);
      setLogs(activeProf ? activeProf.logs || [] : []);
    }
  }, [isCloudActive, currentProfileId, profiles]);

  // Sync local changes to LocalStorage (only in offline/fallback mode)
  useEffect(() => {
    if (!isCloudActive && profiles.length > 0 && currentProfileId) {
      localStorage.setItem("ecobuddy_profiles", JSON.stringify(profiles));
      localStorage.setItem("ecobuddy_active_profile_id", currentProfileId);
    }
  }, [profiles, currentProfileId, isCloudActive]);

  // Extract active profile values
  const currentProfile = profiles.find((p) => p.id === currentProfileId) || null;

  const carbonScore = currentProfile ? currentProfile.carbonScore : 0;
  const buddyLevel = currentProfile ? currentProfile.buddyLevel : 1;
  const buddyXp = currentProfile ? currentProfile.buddyXp : 0;
  const streak = currentProfile ? currentProfile.streak : 0;
  const greenPoints = currentProfile ? currentProfile.greenPoints : 0;
  const equippedSkin = currentProfile ? currentProfile.equippedSkin : "default";
  const unlockedSkins = currentProfile ? currentProfile.unlockedSkins : ["default"];
  const badges = currentProfile ? currentProfile.badges : [];
  const quests = currentProfile ? currentProfile.quests : [];
  const streakShields = currentProfile ? currentProfile.streakShields || 0 : 0;

  // Daily quest rotation & auto-level-up check on load/mount or change
  useEffect(() => {
    if (isLoading || isConnectionChecking || !currentProfileId || !currentProfile) return;

    const todayStr = getLocalDateString(new Date());
    let needsUpdate = false;
    let updatedQuests = [...currentProfile.quests];
    let updatedRefreshDate = currentProfile.lastQuestRefreshDate || "";

    // 1. Check if daily quests need to be refreshed
    if (updatedRefreshDate !== todayStr) {
      updatedQuests = getRandomQuests(3);
      updatedRefreshDate = todayStr;
      needsUpdate = true;
    }

    // 2. Check if companion needs auto-level-up
    let updatedXp = currentProfile.buddyXp;
    let updatedLvl = currentProfile.buddyLevel;
    let neededXp = LevelProgression.getXpForLevel(updatedLvl);
    while (updatedXp >= neededXp) {
      updatedXp -= neededXp;
      updatedLvl += 1;
      neededXp = LevelProgression.getXpForLevel(updatedLvl);
      needsUpdate = true;
    }

    if (needsUpdate) {
      if (isCloudActive && db) {
        let updatedForm = "seed";
        if (updatedLvl >= 4) {
          updatedForm = "flowering_bonsai";
        } else if (updatedLvl === 3) {
          updatedForm = "sapling";
        } else if (updatedLvl === 2) {
          updatedForm = "sprout";
        }

        const profileRef = doc(db, "users", currentProfileId);
        updateDoc(profileRef, {
          quests: updatedQuests,
          lastQuestRefreshDate: updatedRefreshDate,
          "buddy.level": updatedLvl,
          "buddy.xp": updatedXp,
          "buddy.form": updatedForm,
        }).catch((err) => {
          console.error("Error updating profile rotation/level in Firestore:", err);
        });
      } else {
        // Offline update
        /* eslint-disable-next-line react-hooks/set-state-in-effect */
        setProfiles((prevProfiles) => {
          const updated = prevProfiles.map((p) => {
            if (p.id !== currentProfileId) return p;
            return {
              ...p,
              quests: updatedQuests,
              lastQuestRefreshDate: updatedRefreshDate,
              buddyLevel: updatedLvl,
              buddyXp: updatedXp,
            };
          });
          localStorage.setItem("ecobuddy_profiles", JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [isLoading, isConnectionChecking, currentProfileId, currentProfile, isCloudActive]);

  const createProfile = async (name: string) => {
    const newId = generateProfileId();
    const todayStr = getLocalDateString(new Date());
    const newProfileData = {
      name: name.trim() || "Eco Hero",
      displayName: name.trim() || "Eco Hero",
      deviceUserId: deviceUserId,
      stats: {
        totalCo2SavedKg: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastLoggedDate: null,
      },
      buddy: {
        name: "Seedling",
        level: 1,
        xp: 0,
        form: "seed",
      },
      greenPoints: 0,
      equippedSkin: "default",
      unlockedSkins: ["default"],
      streakShields: 0,
      badges: defaultBadges.map((b) => ({ ...b, unlocked: false })),
      quests: getRandomQuests(3),
      lastQuestRefreshDate: todayStr,
    };

    if (isCloudActive && db) {
      try {
        const docRef = doc(db, "users", newId);
        await setDoc(docRef, newProfileData);
        setCurrentProfileId(newId);
        localStorage.setItem("ecobuddy_active_profile_id", newId);
      } catch (e) {
        console.error("Firestore createProfile error, falling back to local:", e);
        createProfileLocal(name);
      }
    } else {
      createProfileLocal(name);
    }
  };

  const createProfileLocal = (name: string) => {
    const todayStr = getLocalDateString(new Date());
    const newProfile: Profile = {
      id: generateProfileId(),
      name: name.trim() || "Eco Hero",
      displayName: name.trim() || "Eco Hero",
      carbonScore: 0,
      buddyLevel: 1,
      buddyXp: 0,
      streak: 0,
      longestStreak: 0,
      greenPoints: 0,
      equippedSkin: "default",
      unlockedSkins: ["default"],
      logs: [],
      badges: defaultBadges.map((b) => ({ ...b, unlocked: false })),
      quests: getRandomQuests(3),
      streakShields: 0,
      lastQuestRefreshDate: todayStr,
    };

    setProfiles((prev) => {
      const updated = [...prev, newProfile];
      localStorage.setItem("ecobuddy_profiles", JSON.stringify(updated));
      return updated;
    });
    setCurrentProfileId(newProfile.id);
    localStorage.setItem("ecobuddy_active_profile_id", newProfile.id);
  };

  const switchProfile = (profileId: string) => {
    if (profiles.some((p) => p.id === profileId) || profileId === "") {
      setCurrentProfileId(profileId);
      if (profileId) {
        localStorage.setItem("ecobuddy_active_profile_id", profileId);
      } else {
        localStorage.removeItem("ecobuddy_active_profile_id");
      }
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (isCloudActive && db) {
      try {
        await deleteDoc(doc(db, "users", profileId));
        if (currentProfileId === profileId) {
          setCurrentProfileId("");
          localStorage.removeItem("ecobuddy_active_profile_id");
        }
      } catch (e) {
        console.error("Firestore deleteProfile error, falling back to local:", e);
        deleteProfileLocal(profileId);
      }
    } else {
      deleteProfileLocal(profileId);
    }
  };

  const deleteProfileLocal = (profileId: string) => {
    const remaining = profiles.filter((p) => p.id !== profileId);
    setProfiles(remaining);
    localStorage.setItem("ecobuddy_profiles", JSON.stringify(remaining));

    if (currentProfileId === profileId) {
      setCurrentProfileId("");
      localStorage.removeItem("ecobuddy_active_profile_id");
    }
  };

  const addLog = async (rawInput: string, category: string, co2SavedKg: number) => {
    const points = Math.max(1, Math.round(co2SavedKg * 10));

    if (isCloudActive && db && currentProfileId && currentProfile) {
      try {
        const profileRef = doc(db, "users", currentProfileId);
        const activityRef = doc(collection(db, "users", currentProfileId, "activities"));

        // 1. Add activity log document to firestore subcollection (which triggers Cloud Functions)
        await setDoc(activityRef, {
          rawInput,
          category,
          co2SavedKg,
          loggedAt: new Date().toISOString(),
          localDate: getLocalDateString(new Date()),
        });

        // 2. Perform frontend calculated badges, quests, and GP logic
        const updatedGp = currentProfile.greenPoints + points * 10;

        const updatedBadges = currentProfile.badges.map((b) => {
          if (b.id === "1") return { ...b, unlocked: true };

          const allLogs = [
            {
              id: activityRef.id,
              rawInput,
              category: category as ActivityLog["category"],
              co2SavedKg,
              carbonPoints: points,
              loggedAt: new Date().toISOString(),
            },
            ...logs,
          ];
          const catCount = allLogs.filter((l) => l.category === b.category).length;

          if (b.id === "2" && catCount >= 5) return { ...b, unlocked: true };
          if (b.id === "3" && catCount >= 3) return { ...b, unlocked: true };

          const expectedScore = currentProfile.carbonScore + co2SavedKg;
          if (b.id === "6" && expectedScore >= 100) return { ...b, unlocked: true };

          return b;
        });

        // Calculate companion Level and XP reward (client side)
        let updatedXp = currentProfile.buddyXp + points * 3;
        let updatedLvl = currentProfile.buddyLevel;
        let neededXp = LevelProgression.getXpForLevel(updatedLvl);

        while (updatedXp >= neededXp) {
          updatedXp -= neededXp;
          updatedLvl += 1;
          neededXp = LevelProgression.getXpForLevel(updatedLvl);
        }

        let updatedForm = "seed";
        if (updatedLvl >= 4) {
          updatedForm = "flowering_bonsai";
        } else if (updatedLvl === 3) {
          updatedForm = "sapling";
        } else if (updatedLvl === 2) {
          updatedForm = "sprout";
        }

        const expectedScore = parseFloat((currentProfile.carbonScore + co2SavedKg).toFixed(2));

        const updatedQuests = currentProfile.quests.map((q) => {
          if (q.completed) return q;

          let progress = q.progress;
          const matchesCategory = 
            ((q.id === "q1" || q.id === "q6") && category === "Food") ||
            ((q.id === "q1" || q.id === "q5" || q.id === "q9") && category === "Transport") ||
            ((q.id === "q2" || q.id === "q4" || q.id === "q7" || q.id === "q8") && category === "Energy") ||
            ((q.id === "q3" || q.id === "q10") && category === "Waste");

          if (matchesCategory) {
            progress = parseFloat((progress + co2SavedKg).toFixed(2));
          }

          return {
            ...q,
            progress: Math.min(progress, q.targetCo2),
            completed: progress >= q.targetCo2,
          };
        });

        // Calculate streak (client side for cloud mode)
        let newStreak = currentProfile.streak || 0;
        let currentShields = currentProfile.streakShields || 0;
        const todayStr = getLocalDateString(new Date());

        if (logs.length === 0) {
          newStreak = 1;
        } else {
          const lastLogDate = getLocalDateString(new Date(logs[0].loggedAt));
          if (lastLogDate !== todayStr) {
            const diffTime = new Date(todayStr).getTime() - new Date(lastLogDate).getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              newStreak += 1;
            } else if (diffDays > 1) {
              if (currentShields > 0) {
                currentShields -= 1;
                newStreak += 1;
              } else {
                newStreak = 1;
              }
            }
          }
        }
        const newLongestStreak = Math.max(newStreak, currentProfile.longestStreak || currentProfile.streak || 0);

        // 3. Update client-managed properties in the profile document in Firestore
        await updateDoc(profileRef, {
          greenPoints: updatedGp,
          badges: updatedBadges,
          quests: updatedQuests,
          "buddy.xp": updatedXp,
          "buddy.level": updatedLvl,
          "buddy.form": updatedForm,
          "stats.totalCo2SavedKg": expectedScore,
          "stats.currentStreak": newStreak,
          "stats.longestStreak": newLongestStreak,
          "stats.lastLoggedDate": todayStr,
          streakShields: currentShields,
        });
      } catch (e) {
        console.error("Firestore addLog error, falling back to local:", e);
        addLogLocal(rawInput, category, co2SavedKg);
      }
    } else {
      addLogLocal(rawInput, category, co2SavedKg);
    }
  };

  const addLogLocal = (rawInput: string, category: string, co2SavedKg: number) => {
    const points = Math.max(1, Math.round(co2SavedKg * 10));

    setProfiles((prevProfiles) => {
      const updated = prevProfiles.map((p) => {
        if (p.id !== currentProfileId) return p;

        const newLog: ActivityLog = {
          id: generateLogId(),
          rawInput,
          category: category as ActivityLog["category"],
          co2SavedKg,
          carbonPoints: points,
          loggedAt: new Date().toISOString(),
          localDate: getLocalDateString(new Date()),
        };

        const updatedLogs = [newLog, ...p.logs];
        const updatedScore = parseFloat((p.carbonScore + co2SavedKg).toFixed(2));
        const updatedGp = p.greenPoints + points * 10;

        // Level calculations
        let updatedXp = p.buddyXp + points * 3;
        let updatedLvl = p.buddyLevel;
        let neededXp = LevelProgression.getXpForLevel(updatedLvl);

        while (updatedXp >= neededXp) {
          updatedXp -= neededXp;
          updatedLvl += 1;
          neededXp = LevelProgression.getXpForLevel(updatedLvl);
        }

        // Streak check
        let newStreak = p.streak;
        let currentShields = p.streakShields || 0;
        const todayStr = getLocalDateString(new Date());

        if (p.logs.length === 0) {
          newStreak = 1;
        } else {
          const lastLogDate = getLocalDateString(new Date(p.logs[0].loggedAt));
          if (lastLogDate !== todayStr) {
            const diffTime = new Date(todayStr).getTime() - new Date(lastLogDate).getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              newStreak += 1;
            } else if (diffDays > 1) {
              if (currentShields > 0) {
                currentShields -= 1;
                newStreak += 1;
              } else {
                newStreak = 1;
              }
            }
          }
        }

        // Badges check
        const updatedBadges = p.badges.map((b) => {
          if (b.id === "1") return { ...b, unlocked: true };

          const allLogs = [newLog, ...p.logs];
          const catCount = allLogs.filter((l) => l.category === b.category).length;

          if (b.id === "2" && catCount >= 5) return { ...b, unlocked: true };
          if (b.id === "3" && catCount >= 3) return { ...b, unlocked: true };
          if (b.id === "6" && updatedScore >= 100) return { ...b, unlocked: true };

          return b;
        });

        // Quests check
        const updatedQuests = p.quests.map((q) => {
          if (q.completed) return q;

          let progress = q.progress;
          const matchesCategory = 
            ((q.id === "q1" || q.id === "q6") && category === "Food") ||
            ((q.id === "q1" || q.id === "q5" || q.id === "q9") && category === "Transport") ||
            ((q.id === "q2" || q.id === "q4" || q.id === "q7" || q.id === "q8") && category === "Energy") ||
            ((q.id === "q3" || q.id === "q10") && category === "Waste");

          if (matchesCategory) {
            progress = parseFloat((progress + co2SavedKg).toFixed(2));
          }

          return {
            ...q,
            progress: Math.min(progress, q.targetCo2),
            completed: progress >= q.targetCo2,
          };
        });

        return {
          ...p,
          logs: updatedLogs,
          carbonScore: updatedScore,
          greenPoints: updatedGp,
          buddyLevel: updatedLvl,
          buddyXp: updatedXp,
          streak: newStreak,
          longestStreak: Math.max(newStreak, p.longestStreak || p.streak || 0),
          badges: updatedBadges,
          quests: updatedQuests,
          streakShields: currentShields,
        };
      });

      localStorage.setItem("ecobuddy_profiles", JSON.stringify(updated));
      return updated;
    });
  };

  const buySkin = (skinId: string, cost: number): boolean => {
    let success = false;

    if (isCloudActive && db && currentProfileId && currentProfile) {
      if (currentProfile.greenPoints >= cost && !currentProfile.unlockedSkins.includes(skinId)) {
        success = true;
        try {
          const profileRef = doc(db, "users", currentProfileId);
          updateDoc(profileRef, {
            greenPoints: currentProfile.greenPoints - cost,
            unlockedSkins: [...currentProfile.unlockedSkins, skinId],
            equippedSkin: skinId,
          });
        } catch (e) {
          console.error("Firestore buySkin error, falling back local:", e);
          success = buySkinLocal(skinId, cost);
        }
      }
    } else {
      success = buySkinLocal(skinId, cost);
    }
    return success;
  };

  const buySkinLocal = (skinId: string, cost: number): boolean => {
    let success = false;
    setProfiles((prevProfiles) => {
      const updated = prevProfiles.map((p) => {
        if (p.id !== currentProfileId) return p;

        if (p.greenPoints >= cost && !p.unlockedSkins.includes(skinId)) {
          success = true;
          return {
            ...p,
            greenPoints: p.greenPoints - cost,
            unlockedSkins: [...p.unlockedSkins, skinId],
            equippedSkin: skinId,
          };
        }
        return p;
      });
      localStorage.setItem("ecobuddy_profiles", JSON.stringify(updated));
      return updated;
    });
    return success;
  };

  const buyStreakShield = (): boolean => {
    let success = false;
    const cost = 150;

    if (isCloudActive && db && currentProfileId && currentProfile) {
      if (currentProfile.greenPoints >= cost) {
        success = true;
        try {
          const profileRef = doc(db, "users", currentProfileId);
          updateDoc(profileRef, {
            greenPoints: currentProfile.greenPoints - cost,
            streakShields: (currentProfile.streakShields || 0) + 1,
          });
        } catch (e) {
          console.error("Firestore buyStreakShield error, falling back local:", e);
          success = buyStreakShieldLocal();
        }
      }
    } else {
      success = buyStreakShieldLocal();
    }
    return success;
  };

  const buyStreakShieldLocal = (): boolean => {
    let success = false;
    setProfiles((prevProfiles) => {
      const updated = prevProfiles.map((p) => {
        if (p.id !== currentProfileId) return p;

        const cost = 150;
        if (p.greenPoints >= cost) {
          success = true;
          return {
            ...p,
            greenPoints: p.greenPoints - cost,
            streakShields: (p.streakShields || 0) + 1,
          };
        }
        return p;
      });
      localStorage.setItem("ecobuddy_profiles", JSON.stringify(updated));
      return updated;
    });
    return success;
  };

  const equipSkin = async (skinId: string) => {
    if (isCloudActive && db && currentProfileId && currentProfile) {
      if (currentProfile.unlockedSkins.includes(skinId)) {
        try {
          const profileRef = doc(db, "users", currentProfileId);
          await updateDoc(profileRef, {
            equippedSkin: skinId,
          });
        } catch (e) {
          console.error("Firestore equipSkin error, falling back local:", e);
          equipSkinLocal(skinId);
        }
      }
    } else {
      equipSkinLocal(skinId);
    }
  };

  const equipSkinLocal = (skinId: string) => {
    setProfiles((prevProfiles) => {
      const updated = prevProfiles.map((p) => {
        if (p.id !== currentProfileId) return p;
        if (p.unlockedSkins.includes(skinId)) {
          return { ...p, equippedSkin: skinId };
        }
        return p;
      });
      localStorage.setItem("ecobuddy_profiles", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleBadge = async (badgeId: string) => {
    if (isCloudActive && db && currentProfileId && currentProfile) {
      try {
        const profileRef = doc(db, "users", currentProfileId);
        const updatedBadges = currentProfile.badges.map((b) =>
          b.id === badgeId ? { ...b, unlocked: !b.unlocked } : b
        );
        await updateDoc(profileRef, {
          badges: updatedBadges,
        });
      } catch (e) {
        console.error("Firestore toggleBadge error, falling back local:", e);
        toggleBadgeLocal(badgeId);
      }
    } else {
      toggleBadgeLocal(badgeId);
    }
  };

  const toggleBadgeLocal = (badgeId: string) => {
    setProfiles((prevProfiles) => {
      const updated = prevProfiles.map((p) => {
        if (p.id !== currentProfileId) return p;
        return {
          ...p,
          badges: p.badges.map((b) => (b.id === badgeId ? { ...b, unlocked: !b.unlocked } : b)),
        };
      });
      localStorage.setItem("ecobuddy_profiles", JSON.stringify(updated));
      return updated;
    });
  };

  const completeQuest = async (questId: string) => {
    if (isCloudActive && db && currentProfileId && currentProfile) {
      const quest = currentProfile.quests.find((q) => q.id === questId);
      if (!quest) return;

      const isToggledCompleted = !quest.completed;
      const targetCo2 = quest.targetCo2;
      const diffCo2 = isToggledCompleted ? targetCo2 : -targetCo2;

      // 1. Calculate new carbon score
      const newScore = parseFloat((currentProfile.carbonScore + diffCo2).toFixed(2));

      // 2. Calculate GP reward
      const points = Math.max(1, Math.round(targetCo2 * 10));
      const gpDiff = isToggledCompleted ? points * 10 : -(points * 10);
      const newGp = Math.max(0, currentProfile.greenPoints + gpDiff);

      // 3. Calculate companion Level and XP reward
      let newXp = currentProfile.buddyXp + (isToggledCompleted ? points * 3 : -(points * 3));
      let newLevel = currentProfile.buddyLevel;
      if (isToggledCompleted) {
        let neededXp = LevelProgression.getXpForLevel(newLevel);
        while (newXp >= neededXp) {
          newXp -= neededXp;
          newLevel += 1;
          neededXp = LevelProgression.getXpForLevel(newLevel);
        }
      } else {
        if (newXp < 0) {
          newXp = 0;
        }
      }

      try {
        const profileRef = doc(db, "users", currentProfileId);
        const updatedQuests = currentProfile.quests.map((q) =>
          q.id === questId ? { ...q, completed: isToggledCompleted, progress: isToggledCompleted ? targetCo2 : 0 } : q
        );
        
        let newForm = "seed";
        if (newLevel >= 4) {
          newForm = "flowering_bonsai";
        } else if (newLevel === 3) {
          newForm = "sapling";
        } else if (newLevel === 2) {
          newForm = "sprout";
        }

        await updateDoc(profileRef, {
          quests: updatedQuests,
          "stats.totalCo2SavedKg": newScore,
          greenPoints: newGp,
          "buddy.xp": newXp,
          "buddy.level": newLevel,
          "buddy.form": newForm,
        });
      } catch (e) {
        console.error("Firestore completeQuest error, falling back local:", e);
        completeQuestLocal(questId);
      }
    } else {
      completeQuestLocal(questId);
    }
  };

  const completeQuestLocal = (questId: string) => {
    setProfiles((prevProfiles) => {
      const updated = prevProfiles.map((p) => {
        if (p.id !== currentProfileId) return p;

        const quest = p.quests.find((q) => q.id === questId);
        if (!quest) return p;

        const isToggledCompleted = !quest.completed;
        const targetCo2 = quest.targetCo2;
        const diffCo2 = isToggledCompleted ? targetCo2 : -targetCo2;

        const newScore = parseFloat((p.carbonScore + diffCo2).toFixed(2));
        const points = Math.max(1, Math.round(targetCo2 * 10));
        const gpDiff = isToggledCompleted ? points * 10 : -(points * 10);
        const newGp = Math.max(0, p.greenPoints + gpDiff);

        let newXp = p.buddyXp + (isToggledCompleted ? points * 3 : -(points * 3));
        let newLevel = p.buddyLevel;
        if (isToggledCompleted) {
          let neededXp = LevelProgression.getXpForLevel(newLevel);
          while (newXp >= neededXp) {
            newXp -= neededXp;
            newLevel += 1;
            neededXp = LevelProgression.getXpForLevel(newLevel);
          }
        } else {
          if (newXp < 0) {
            newXp = 0;
          }
        }

        return {
          ...p,
          carbonScore: newScore,
          greenPoints: newGp,
          buddyLevel: newLevel,
          buddyXp: newXp,
          quests: p.quests.map((q) => (q.id === questId ? { ...q, completed: isToggledCompleted, progress: isToggledCompleted ? targetCo2 : 0 } : q)),
        };
      });
      localStorage.setItem("ecobuddy_profiles", JSON.stringify(updated));
      return updated;
    });
  };

  const resetState = async () => {
    if (isCloudActive && db && deviceUserId) {
      try {
        const q = query(collection(db, "users"), where("deviceUserId", "==", deviceUserId));
        const querySnapshot = await getDocs(q);
        const deletePromises: Promise<void>[] = [];
        querySnapshot.forEach((doc) => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises);

        setCurrentProfileId("");
        localStorage.clear();
      } catch (e) {
        console.error("Firestore resetState error, falling back local:", e);
        resetStateLocal();
      }
    } else {
      resetStateLocal();
    }
  };

  const resetStateLocal = () => {
    const initialProfile: Profile = {
      id: "default-profile",
      name: "Eco Hero",
      carbonScore: 0,
      buddyLevel: 1,
      buddyXp: 0,
      streak: 0,
      greenPoints: 0,
      equippedSkin: "default",
      unlockedSkins: ["default"],
      logs: [],
      badges: defaultBadges.map((b) => ({ ...b, unlocked: false })),
      quests: defaultQuests.map((q) => ({ ...q, progress: 0, completed: false })),
      streakShields: 0,
    };

    setProfiles([initialProfile]);
    setCurrentProfileId("default-profile");
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        currentProfileId,
        currentProfile,
        carbonScore,
        buddyLevel,
        buddyXp,
        streak,
        greenPoints,
        equippedSkin,
        unlockedSkins,
        logs,
        badges,
        quests,
        skinsCatalog,
        streakShields,
        createProfile,
        switchProfile,
        deleteProfile,
        addLog,
        buySkin,
        buyStreakShield,
        equipSkin,
        resetState,
        toggleBadge,
        completeQuest,
      }}
    >
      {isLoading ? (
        <div className="min-h-screen bg-brand-forest flex flex-col items-center justify-center text-text-primary">
          <div className="p-4 bg-brand-emerald/10 border border-brand-emerald/20 rounded-3xl animate-pulse mb-4">
            <Leaf className="w-8 h-8 text-brand-emerald animate-breathe shrink-0" />
          </div>
          <p className="text-xs font-mono text-text-secondary tracking-widest uppercase">
            Loading Eco Universe...
          </p>
        </div>
      ) : !currentProfileId ? (
        <ProfileSelector isCloudActive={isCloudActive} />
      ) : (
        children
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
