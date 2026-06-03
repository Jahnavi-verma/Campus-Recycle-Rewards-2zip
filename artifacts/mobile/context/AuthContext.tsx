import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  CO2_PER_BOTTLE,
  CO2_PER_CAN,
  POINTS_PER_BOTTLE,
  POINTS_PER_CAN,
  getLevelInfo,
  getMultiplier,
  getTodaysChallenge,
  computeChallengeProgress,
} from "@/constants/gamification";

export interface RecyclingSession {
  id: string;
  itemType: "can" | "bottle";
  quantity: number;
  pointsEarned: number;
  carbonReduced: number;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  usn: string;
  passwordHash: string;
  profilePicture?: string;
  isGoogleUser?: boolean;
  points: number;
  totalSessions: number;
  carbonReduced: number;
  streak: number;
  lastSessionDate: string | null;
  badges: string[];
  joinedAt: string;
  sessions: RecyclingSession[];
}

export interface SessionResult {
  pointsEarned: number;
  basePoints: number;
  multiplier: number;
  carbonReduced: number;
  newBadges: string[];
  leveledUp: boolean;
  newLevel: number;
  newTitle: string;
  challengeCompleted: boolean;
  challengeBonus: number;
}

interface AuthContextType {
  user: User | null;
  allUsers: User[];
  hasSeenOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  login: (
    identifier: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (
    name: string,
    email: string,
    profilePicture?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    usn: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  addRecyclingSession: (
    itemType: "can" | "bottle",
    quantity: number
  ) => Promise<SessionResult>;
  deductPoints: (amount: number) => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
}

const KEYS = {
  USERS: "@bingo:users",
  CURRENT_USER_ID: "@bingo:currentUserId",
  HAS_SEEN_ONBOARDING: "@bingo:hasSeenOnboarding",
  SEEDED: "@bingo:seeded",
};

const MOCK_USERS: User[] = [
  {
    id: "m1",
    name: "Arjun Sharma",
    email: "arjun.s@bmsce.ac.in",
    usn: "1BM22CS001",
    passwordHash: "",
    points: 3240,
    totalSessions: 45,
    carbonReduced: 3.2,
    streak: 8,
    lastSessionDate: new Date().toISOString().split("T")[0],
    badges: ["first_recycle", "ten_items", "fifty_items", "points_1k"],
    joinedAt: "2025-01-01",
    sessions: [],
  },
  {
    id: "m2",
    name: "Priya Nair",
    email: "priya.n@bmsce.ac.in",
    usn: "1BM22EC012",
    passwordHash: "",
    points: 2980,
    totalSessions: 38,
    carbonReduced: 2.9,
    streak: 5,
    lastSessionDate: new Date().toISOString().split("T")[0],
    badges: ["first_recycle", "ten_items", "points_1k"],
    joinedAt: "2025-01-02",
    sessions: [],
  },
  {
    id: "m3",
    name: "Karthik Rao",
    email: "karthik.r@bmsce.ac.in",
    usn: "1BM22ME023",
    passwordHash: "",
    points: 2650,
    totalSessions: 31,
    carbonReduced: 2.4,
    streak: 3,
    lastSessionDate: null,
    badges: ["first_recycle", "ten_items"],
    joinedAt: "2025-01-05",
    sessions: [],
  },
  {
    id: "m4",
    name: "Sneha Patel",
    email: "sneha.p@bmsce.ac.in",
    usn: "1BM22CS034",
    passwordHash: "",
    points: 2100,
    totalSessions: 28,
    carbonReduced: 2.1,
    streak: 2,
    lastSessionDate: null,
    badges: ["first_recycle", "ten_items"],
    joinedAt: "2025-01-10",
    sessions: [],
  },
  {
    id: "m5",
    name: "Rahul Verma",
    email: "rahul.v@bmsce.ac.in",
    usn: "1BM22IS045",
    passwordHash: "",
    points: 1850,
    totalSessions: 22,
    carbonReduced: 1.8,
    streak: 0,
    lastSessionDate: null,
    badges: ["first_recycle"],
    joinedAt: "2025-01-12",
    sessions: [],
  },
  {
    id: "m6",
    name: "Deepa Krishnan",
    email: "deepa.k@bmsce.ac.in",
    usn: "1BM22CS056",
    passwordHash: "",
    points: 1520,
    totalSessions: 18,
    carbonReduced: 1.4,
    streak: 4,
    lastSessionDate: null,
    badges: ["first_recycle"],
    joinedAt: "2025-01-15",
    sessions: [],
  },
  {
    id: "m7",
    name: "Vikram Hegde",
    email: "vikram.h@bmsce.ac.in",
    usn: "1BM22EC067",
    passwordHash: "",
    points: 1200,
    totalSessions: 14,
    carbonReduced: 1.1,
    streak: 1,
    lastSessionDate: null,
    badges: ["first_recycle"],
    joinedAt: "2025-01-18",
    sessions: [],
  },
  {
    id: "m8",
    name: "Ananya Kumar",
    email: "ananya.k@bmsce.ac.in",
    usn: "1BM22CS078",
    passwordHash: "",
    points: 980,
    totalSessions: 11,
    carbonReduced: 0.9,
    streak: 0,
    lastSessionDate: null,
    badges: ["first_recycle"],
    joinedAt: "2025-01-20",
    sessions: [],
  },
  {
    id: "m9",
    name: "Rohan Bhat",
    email: "rohan.b@bmsce.ac.in",
    usn: "1BM22ME089",
    passwordHash: "",
    points: 720,
    totalSessions: 8,
    carbonReduced: 0.7,
    streak: 2,
    lastSessionDate: null,
    badges: [],
    joinedAt: "2025-02-01",
    sessions: [],
  },
  {
    id: "m10",
    name: "Meera Singh",
    email: "meera.s@bmsce.ac.in",
    usn: "1BM22IS090",
    passwordHash: "",
    points: 450,
    totalSessions: 5,
    carbonReduced: 0.4,
    streak: 0,
    lastSessionDate: null,
    badges: [],
    joinedAt: "2025-02-10",
    sessions: [],
  },
];

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash + c) & 0xffffffff;
  }
  return hash.toString(36);
}

function computeStreak(
  user: User
): { streak: number; lastSessionDate: string } {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];
  if (user.lastSessionDate === today)
    return { streak: user.streak, lastSessionDate: today };
  if (user.lastSessionDate === yesterday)
    return { streak: user.streak + 1, lastSessionDate: today };
  return { streak: 1, lastSessionDate: today };
}

function computeBadges(user: User): string[] {
  const badges = new Set(user.badges);
  const totalItems = user.sessions.reduce((s, r) => s + r.quantity, 0);
  const totalCans = user.sessions
    .filter((s) => s.itemType === "can")
    .reduce((s, r) => s + r.quantity, 0);
  const totalBottles = user.sessions
    .filter((s) => s.itemType === "bottle")
    .reduce((s, r) => s + r.quantity, 0);
  const maxCombo = Math.max(...user.sessions.map((s) => s.quantity), 0);
  const hour = new Date().getHours();

  if (user.sessions.length >= 1) badges.add("first_recycle");
  if (totalItems >= 10) badges.add("ten_items");
  if (totalItems >= 50) badges.add("fifty_items");
  if (totalItems >= 100) badges.add("hundred_items");
  if (user.streak >= 7) badges.add("week_streak");
  if (user.streak >= 30) badges.add("month_streak");
  if (user.points >= 1000) badges.add("points_1k");
  if (user.points >= 5000) badges.add("points_5k");
  if (maxCombo >= 10) badges.add("combo_master");
  if (totalCans >= 25) badges.add("can_king");
  if (totalBottles >= 25) badges.add("bottle_boss");
  if (hour < 9) badges.add("early_bird");

  return Array.from(badges);
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async (): Promise<User[]> => {
    const raw = await AsyncStorage.getItem(KEYS.USERS);
    return raw ? (JSON.parse(raw) as User[]) : [];
  }, []);

  const saveUsers = useCallback(async (users: User[]) => {
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
    setAllUsers(users);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const seen = await AsyncStorage.getItem(KEYS.HAS_SEEN_ONBOARDING);
        setHasSeenOnboarding(seen === "true");

        const seeded = await AsyncStorage.getItem(KEYS.SEEDED);
        if (!seeded) {
          await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
          await AsyncStorage.setItem(KEYS.SEEDED, "true");
          setAllUsers(MOCK_USERS);
        } else {
          const users = await loadUsers();
          setAllUsers(users);
        }

        const uid = await AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
        if (uid) {
          const users = await loadUsers();
          const found = users.find((u) => u.id === uid);
          if (found) setUser(found);
        }
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [loadUsers]);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(KEYS.HAS_SEEN_ONBOARDING, "true");
    setHasSeenOnboarding(true);
  };

  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const id = identifier.toLowerCase().trim();
    const users = await loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === id || u.usn.toLowerCase() === id
    );
    if (!found)
      return {
        success: false,
        error: "No account found with these credentials.",
      };
    if (found.passwordHash !== simpleHash(password))
      return { success: false, error: "Incorrect password." };
    await AsyncStorage.setItem(KEYS.CURRENT_USER_ID, found.id);
    setUser(found);
    return { success: true };
  };

  const googleLogin = async (
    name: string,
    email: string,
    profilePicture?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const emailLower = email.toLowerCase().trim();
    const users = await loadUsers();

    const existing = users.find((u) => u.email.toLowerCase() === emailLower);
    if (existing) {
      const updated = { ...existing, profilePicture, isGoogleUser: true };
      const updatedUsers = users.map((u) => u.id === existing.id ? updated : u);
      await saveUsers(updatedUsers);
      await AsyncStorage.setItem(KEYS.CURRENT_USER_ID, existing.id);
      setUser(updated);
      return { success: true };
    }

    const nameParts = name.trim().split(" ");
    const autoUsn = "GOOGLE_" + Date.now().toString().slice(-6);
    const newUser: User = {
      id: "g_" + Date.now().toString() + Math.random().toString(36).slice(2, 9),
      name: name.trim(),
      email: emailLower,
      usn: autoUsn,
      passwordHash: "",
      profilePicture: profilePicture ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(nameParts.join("+"))}&background=6C63FF&color=fff&size=128`,
      isGoogleUser: true,
      points: 0,
      totalSessions: 0,
      carbonReduced: 0,
      streak: 0,
      lastSessionDate: null,
      badges: [],
      joinedAt: new Date().toISOString().split("T")[0],
      sessions: [],
    };

    const updated = [...users, newUser];
    await saveUsers(updated);
    await AsyncStorage.setItem(KEYS.CURRENT_USER_ID, newUser.id);
    setUser(newUser);
    return { success: true };
  };

  const signup = async (
    name: string,
    email: string,
    usn: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const emailLower = email.toLowerCase().trim();
    const usnUpper = usn.toUpperCase().trim();

    if (!emailLower.endsWith("@bmsce.ac.in")) {
      return {
        success: false,
        error: "Only @bmsce.ac.in email addresses are allowed.",
      };
    }

    const users = await loadUsers();
    if (users.find((u) => u.email.toLowerCase() === emailLower)) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }
    if (users.find((u) => u.usn.toUpperCase() === usnUpper)) {
      return { success: false, error: "This USN is already registered." };
    }

    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      name: name.trim(),
      email: emailLower,
      usn: usnUpper,
      passwordHash: simpleHash(password),
      points: 0,
      totalSessions: 0,
      carbonReduced: 0,
      streak: 0,
      lastSessionDate: null,
      badges: [],
      joinedAt: new Date().toISOString().split("T")[0],
      sessions: [],
    };

    const updated = [...users, newUser];
    await saveUsers(updated);
    await AsyncStorage.setItem(KEYS.CURRENT_USER_ID, newUser.id);
    setUser(newUser);
    return { success: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem(KEYS.CURRENT_USER_ID);
    setUser(null);
  };

  const addRecyclingSession = async (
    itemType: "can" | "bottle",
    quantity: number
  ): Promise<SessionResult> => {
    if (!user) throw new Error("Not logged in");

    const basePoints =
      itemType === "can"
        ? POINTS_PER_CAN * quantity
        : POINTS_PER_BOTTLE * quantity;
    const carbonReduced =
      itemType === "can"
        ? CO2_PER_CAN * quantity
        : CO2_PER_BOTTLE * quantity;

    const { total: multiplier } = getMultiplier(user.streak, quantity);
    const pointsEarned = Math.round(basePoints * multiplier);

    const session: RecyclingSession = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      itemType,
      quantity,
      pointsEarned,
      carbonReduced,
      timestamp: new Date().toISOString(),
    };

    const { streak: newStreak, lastSessionDate } = computeStreak(user);

    const prevLevel = getLevelInfo(user.points).level;

    const updatedUser: User = {
      ...user,
      points: user.points + pointsEarned,
      totalSessions: user.totalSessions + 1,
      carbonReduced: user.carbonReduced + carbonReduced,
      streak: newStreak,
      lastSessionDate,
      sessions: [session, ...user.sessions],
    };

    const prevBadges = new Set(user.badges);
    updatedUser.badges = computeBadges(updatedUser);
    const newBadges = updatedUser.badges.filter((b) => !prevBadges.has(b));

    const newLevelInfo = getLevelInfo(updatedUser.points);
    const leveledUp = newLevelInfo.level > prevLevel;

    const challenge = getTodaysChallenge();
    const today = new Date().toISOString().split("T")[0];
    const todaySessions = updatedUser.sessions.filter(
      (s) => s.timestamp.split("T")[0] === today
    );
    const prevTodaySessions = user.sessions.filter(
      (s) => s.timestamp.split("T")[0] === today
    );
    const prevProgress = computeChallengeProgress(
      challenge,
      prevTodaySessions.map((s) => ({
        itemType: s.itemType,
        quantity: s.quantity,
        pointsEarned: s.pointsEarned,
      }))
    );
    const newProgress = computeChallengeProgress(
      challenge,
      todaySessions.map((s) => ({
        itemType: s.itemType,
        quantity: s.quantity,
        pointsEarned: s.pointsEarned,
      }))
    );
    const challengeCompleted =
      prevProgress < challenge.target && newProgress >= challenge.target;
    const challengeBonus = challengeCompleted ? challenge.bonusPoints : 0;

    if (challengeBonus > 0) {
      updatedUser.points += challengeBonus;
    }

    const users = await loadUsers();
    const updated = users.map((u) => (u.id === user.id ? updatedUser : u));
    await saveUsers(updated);
    setUser(updatedUser);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    return {
      pointsEarned,
      basePoints,
      multiplier,
      carbonReduced,
      newBadges,
      leveledUp,
      newLevel: newLevelInfo.level,
      newTitle: newLevelInfo.title,
      challengeCompleted,
      challengeBonus,
    };
  };

  const deductPoints = async (amount: number): Promise<void> => {
    if (!user) return;
    const newPoints = Math.max(0, user.points - amount);
    const updatedUser: User = { ...user, points: newPoints };
    const users = await loadUsers();
    const updated = users.map((u) => (u.id === user.id ? updatedUser : u));
    await saveUsers(updated);
    setUser(updatedUser);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const refreshLeaderboard = async () => {
    const users = await loadUsers();
    setAllUsers(users);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        hasSeenOnboarding,
        isLoading,
        completeOnboarding,
        login,
        googleLogin,
        signup,
        logout,
        addRecyclingSession,
        deductPoints,
        refreshLeaderboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
