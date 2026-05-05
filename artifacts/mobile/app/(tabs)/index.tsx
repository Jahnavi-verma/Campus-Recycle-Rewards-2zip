import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth, User } from "@/context/AuthContext";
import { getDailyFact } from "@/constants/recyclingFacts";
import { getLevelInfo } from "@/constants/gamification";
import { useColors } from "@/hooks/useColors";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function MiniLeaderRow({
  user,
  rank,
  isCurrentUser,
}: {
  user: User;
  rank: number;
  isCurrentUser: boolean;
}) {
  const colors = useColors();
  const MEDAL = ["#FFD700", "#C0C0C0", "#CD7F32"];

  return (
    <View
      style={[
        styles.miniRow,
        {
          backgroundColor: isCurrentUser ? colors.secondary : "transparent",
          borderRadius: 12,
        },
      ]}
    >
      <View style={styles.miniRank}>
        {rank <= 3 ? (
          <Feather name="award" size={16} color={MEDAL[rank - 1]} />
        ) : (
          <Text style={[styles.miniRankNum, { color: colors.mutedForeground }]}>
            {rank}
          </Text>
        )}
      </View>
      <View
        style={[
          styles.miniAvatar,
          { backgroundColor: isCurrentUser ? colors.primary : colors.secondary },
        ]}
      >
        <Text
          style={[
            styles.miniAvatarText,
            { color: isCurrentUser ? "#FFFFFF" : colors.primary },
          ]}
        >
          {initials(user.name)}
        </Text>
      </View>
      <Text
        style={[
          styles.miniName,
          { color: colors.foreground },
          isCurrentUser && { fontFamily: "Inter_700Bold" },
        ]}
        numberOfLines={1}
      >
        {user.name}
        {isCurrentUser ? " (you)" : ""}
      </Text>
      <Text style={[styles.miniPts, { color: colors.primary }]}>
        {user.points.toLocaleString()}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, allUsers } = useAuth();

  if (!user) return null;

  const levelInfo = getLevelInfo(user.points);
  const activityPoints = Math.floor(user.points / 10);
  const fact = getDailyFact();
  const sorted = [...allUsers].sort((a, b) => b.points - a.points).slice(0, 5);
  const firstName = user.name.split(" ")[0];
  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 100;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#1B5E20", "#2E7D32", "#43A047"]}
        style={[styles.hero, { paddingTop: topPad }]}
      >
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.greetingSub}>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
          <View style={[styles.levelChip, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
            <Text style={styles.levelChipText}>
              Lv.{levelInfo.level} · {levelInfo.title}
            </Text>
          </View>
        </View>

        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Total Points</Text>
          <Text style={styles.pointsVal}>{user.points.toLocaleString()}</Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${levelInfo.progress * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {(levelInfo.nextLevelPoints - user.points).toLocaleString()} pts to{" "}
            Lv.{levelInfo.level + 1}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.metricsRow}>
        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="activity" size={22} color={colors.accent} />
          <Text style={[styles.metricVal, { color: colors.foreground }]}>
            {activityPoints.toLocaleString()}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
            Activity Points
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="wind" size={22} color="#00897B" />
          <Text style={[styles.metricVal, { color: colors.foreground }]}>
            {user.carbonReduced.toFixed(2)} kg
          </Text>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
            CO2 Reduced
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="zap" size={22} color="#FFB300" />
          <Text style={[styles.metricVal, { color: colors.foreground }]}>
            {user.streak}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
            Day Streak
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.scanCta, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/(tabs)/scan")}
        activeOpacity={0.85}
      >
        <Feather name="camera" size={20} color="#FFFFFF" />
        <Text style={styles.scanCtaText}>Start Recycling Session</Text>
        <Feather name="arrow-right" size={18} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <View
        style={[
          styles.factCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.factHeader}>
          <Feather name="book-open" size={16} color={colors.accent} />
          <Text style={[styles.factHeaderText, { color: colors.accent }]}>
            Today's Recycling Fact
          </Text>
        </View>
        <Text style={[styles.factText, { color: colors.foreground }]}>
          {fact}
        </Text>
      </View>

      <View style={[styles.leaderSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.leaderHeader}>
          <Feather name="award" size={18} color="#FFD700" />
          <Text style={[styles.leaderTitle, { color: colors.foreground }]}>
            Top 5 on Campus
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/leaderboard")}
            style={styles.seeAllBtn}
          >
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              See all
            </Text>
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {sorted.map((u, i) => (
          <MiniLeaderRow
            key={u.id}
            user={u}
            rank={i + 1}
            isCurrentUser={u.id === user.id}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    lineHeight: 34,
  },
  greetingSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  levelChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  levelChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  pointsCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 20,
  },
  pointsLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  pointsVal: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginBottom: 16,
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
  progressText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
  },
  metricsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
  },
  metricVal: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
    textAlign: "center",
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 14,
  },
  scanCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 18,
  },
  scanCtaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    flex: 1,
    textAlign: "center",
  },
  factCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
  },
  factHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  factHeaderText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  factText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 23,
  },
  leaderSection: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  leaderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  leaderTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  miniRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 10,
    marginBottom: 4,
  },
  miniRank: {
    width: 22,
    alignItems: "center",
  },
  miniRankNum: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  miniAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  miniAvatarText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  miniName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  miniPts: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
