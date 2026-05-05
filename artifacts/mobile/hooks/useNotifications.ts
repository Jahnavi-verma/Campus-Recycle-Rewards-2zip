import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const isSupported = Platform.OS !== "web";

// setNotificationHandler must be called at module level, but crashes in Expo Go SDK 53+
// Wrap in try/catch so it degrades gracefully.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // expo-notifications push features unavailable in this build (Expo Go SDK 53+)
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isSupported) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function scheduleDailyReminders(): Promise<void> {
  if (!isSupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "binGO Morning Nudge",
        body: "Good morning! Start recycling today and keep your streak alive.",
        data: { type: "morning" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Streak Alert!",
        body: "You haven't recycled today. Don't let your streak break!",
        data: { type: "evening" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 18,
        minute: 0,
      },
    });
  } catch {}
}

export async function sendBadgeNotification(badgeName: string): Promise<void> {
  if (!isSupported) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "New Badge Unlocked!",
        body: `You earned the "${badgeName}" badge. Keep going!`,
        data: { type: "badge" },
      },
      trigger: null,
    });
  } catch {}
}

export async function sendLevelUpNotification(level: number, title: string): Promise<void> {
  if (!isSupported) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Level Up!",
        body: `You reached Level ${level}: ${title}. The campus is proud!`,
        data: { type: "levelup" },
      },
      trigger: null,
    });
  } catch {}
}

export async function sendStreakNotification(streak: number): Promise<void> {
  if (!isSupported) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${streak}-Day Streak!`,
        body: `${streak} days of recycling in a row. You're on fire!`,
        data: { type: "streak" },
      },
      trigger: null,
    });
  } catch {}
}

export async function sendChallengeCompleteNotification(bonus: number): Promise<void> {
  if (!isSupported) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Challenge Complete!",
        body: `You finished today's challenge and earned +${bonus} bonus points!`,
        data: { type: "challenge" },
      },
      trigger: null,
    });
  } catch {}
}
