import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RecyclingSession, useAuth } from "@/context/AuthContext";
import { BADGES, getLevelInfo } from "@/constants/gamification";
import { useColors } from "@/hooks/useColors";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  value: string;
  label: string;
  accent?: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Feather name={icon} size={20} color={accent ?? colors.primary} />
      <Text style={[styles.statVal, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function SessionItem({ session }: { session: RecyclingSession }) {
  const colors = useColors();
  const date = new Date(session.timestamp);
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={[
        styles.sessionRow,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.sessionIcon,
          { backgroundColor: session.itemType === "can" ? "#E8F5E9" : "#E0F2F1" },
        ]}
      >
        <Feather
          name={session.itemType === "can" ? "box" : "droplet"}
          size={18}
          color={session.itemType === "can" ? colors.primary : colors.accent}
        />
      </View>
      <View style={styles.sessionInfo}>
        <Text style={[styles.sessionType, { color: colors.foreground }]}>
          {session.quantity}x {session.itemType === "can" ? "Can" : "Bottle"}
          {session.quantity > 1 ? "s" : ""}
        </Text>
        <Text style={[styles.sessionDate, { color: colors.mutedForeground }]}>
          {dateStr}
        </Text>
      </View>
      <View style={styles.sessionRight}>
        <Text style={[styles.sessionPts, { color: colors.primary }]}>
          +{session.pointsEarned}
        </Text>
        <Text style={[styles.sessionPtsLabel, { color: colors.mutedForeground }]}>
          pts
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  if (!user) return null;

  const levelInfo = getLevelInfo(user.points);
  const activityPoints = Math.floor(user.points / 10);
  const earnedBadges = BADGES.filter((b) => user.badges.includes(b.id));

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom:
          Platform.OS === "web" ? 34 + 84 : insets.bottom + 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#1B5E20", "#2E7D32"]}
        style={[styles.header, { paddingTop: topPad }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.avatarLg}>
            <Text style={styles.avatarText}>{initials(user.name)}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userMeta}>
          {user.usn} · {user.email}
        </Text>

        <View style={styles.levelRow}>
          <View style={[styles.levelBadge, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
            <Text style={styles.levelText}>
              Lv.{levelInfo.level} · {levelInfo.title}
            </Text>
          </View>
          {user.streak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: "rgba(255,165,0,0.25)" }]}>
              <Feather name="zap" size={13} color="#FFB300" />
              <Text style={styles.streakText}>{user.streak} day streak</Text>
            </View>
          )}
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${levelInfo.progress * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {(levelInfo.nextLevelPoints - user.points).toLocaleString()} pts to next level
        </Text>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <StatCard
          icon="star"
          value={user.points.toLocaleString()}
          label="Total Points"
        />
        <StatCard
          icon="activity"
          value={activityPoints.toLocaleString()}
          label="Activity Points"
          accent={colors.accent}
        />
        <StatCard
          icon="refresh-cw"
          value={user.totalSessions.toString()}
          label="Sessions"
        />
        <StatCard
          icon="wind"
          value={`${user.carbonReduced.toFixed(2)} kg`}
          label="CO2 Saved"
          accent="#00897B"
        />
      </View>

      {earnedBadges.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Badges
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesRow}
          >
            {earnedBadges.map((badge) => (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.badgeIcon,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Feather
                    name={badge.icon as React.ComponentProps<typeof Feather>["name"]}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text
                  style={[styles.badgeName, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {badge.name}
                </Text>
                <Text
                  style={[
                    styles.badgeDesc,
                    { color: colors.mutedForeground },
                  ]}
                  numberOfLines={2}
                >
                  {badge.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {user.sessions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Recent Activity
          </Text>
          {user.sessions.slice(0, 10).map((s) => (
            <SessionItem key={s.id} session={s} />
          ))}
        </View>
      )}

      {user.sessions.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="inbox" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No recycling sessions yet. Tap Scan to get started!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  avatarLg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  logoutBtn: {
    padding: 8,
  },
  userName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  userMeta: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    marginBottom: 16,
  },
  levelRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  levelBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  levelText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakText: {
    color: "#FFB300",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "44%",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
  },
  statVal: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  badgesRow: {
    gap: 12,
    paddingBottom: 4,
  },
  badgeCard: {
    width: 130,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeName: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  badgeDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 16,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionInfo: { flex: 1 },
  sessionType: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  sessionDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  sessionRight: { alignItems: "flex-end" },
  sessionPts: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  sessionPtsLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
