import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth, User } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function LeaderboardRow({
  user,
  rank,
  isCurrentUser,
}: {
  user: User;
  rank: number;
  isCurrentUser: boolean;
}) {
  const colors = useColors();
  const isMedal = rank <= 3;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: isCurrentUser ? colors.secondary : colors.card,
          borderColor: isCurrentUser ? colors.primary : colors.border,
          borderWidth: isCurrentUser ? 2 : 1,
        },
      ]}
    >
      <View style={styles.rankCol}>
        {isMedal ? (
          <Feather name="award" size={22} color={MEDAL_COLORS[rank - 1]} />
        ) : (
          <Text style={[styles.rankText, { color: colors.mutedForeground }]}>
            {rank}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.avatar,
          { backgroundColor: isCurrentUser ? colors.primary : colors.secondary },
        ]}
      >
        <Text
          style={[
            styles.avatarText,
            { color: isCurrentUser ? "#FFFFFF" : colors.primary },
          ]}
        >
          {initials(user.name)}
        </Text>
      </View>

      <View style={styles.nameCol}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.userName,
              { color: colors.foreground },
              isCurrentUser && { fontFamily: "Outfit_700Bold" },
            ]}
            numberOfLines={1}
          >
            {user.name}
          </Text>
          {isCurrentUser && (
            <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.youBadgeText}>You</Text>
            </View>
          )}
        </View>
        <Text style={[styles.usnText, { color: colors.mutedForeground }]}>
          {user.usn} · {user.levelTitle || "Sapling"}
        </Text>
      </View>

      <View style={styles.pointsCol}>
        <Text style={[styles.pointsVal, { color: colors.primary }]}>
          {user.points.toLocaleString()}
        </Text>
        <Text style={[styles.pointsLabel, { color: colors.mutedForeground }]}>
          pts
        </Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { allUsers, user, refreshLeaderboard } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const sorted = [...allUsers].sort((a, b) => b.points - a.points);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLeaderboard();
    setRefreshing(false);
  }, [refreshLeaderboard]);

  const userRank = sorted.findIndex((u) => u.id === user?.id) + 1;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#09090B", "#1E1B4B"]}
        style={[
          styles.header,
          {
            paddingTop:
              Platform.OS === "web" ? 67 + 16 : insets.top + 16,
          },
        ]}
      >
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSub}>BMSCE Campus Rankings</Text>

        {user && userRank > 0 && (
          <View style={styles.myRankChip}>
            <Feather name="trending-up" size={14} color="#FFFFFF" />
            <Text style={styles.myRankText}>
              Your rank: #{userRank} of {sorted.length}
            </Text>
          </View>
        )}
      </LinearGradient>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 + 84 : insets.bottom + 100,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item, index }) => (
          <LeaderboardRow
            user={item}
            rank={index + 1}
            isCurrentUser={item.id === user?.id}
          />
        )}
        scrollEnabled={sorted.length > 0}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  headerTitle: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    color: "#FFFFFF",
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    marginBottom: 16,
  },
  myRankChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  myRankText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
  },
  list: { paddingTop: 16, paddingHorizontal: 16, gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  rankCol: {
    width: 32,
    alignItems: "center",
  },
  rankText: {
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
  },
  nameCol: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
    flex: 1,
  },
  youBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  youBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 0.5,
  },
  usnText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    marginTop: 2,
  },
  pointsCol: {
    alignItems: "flex-end",
  },
  pointsVal: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
  },
  pointsLabel: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
  },
});
