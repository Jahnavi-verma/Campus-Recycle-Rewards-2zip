import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  computeChallengeProgress,
  DailyChallengeTemplate,
} from "@/constants/gamification";
import { RecyclingSession } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  challenge: DailyChallengeTemplate;
  todaySessions: RecyclingSession[];
}

export function DailyChallengeCard({ challenge, todaySessions }: Props) {
  const colors = useColors();
  const progress = computeChallengeProgress(
    challenge,
    todaySessions.map((s) => ({
      itemType: s.itemType,
      quantity: s.quantity,
      pointsEarned: s.pointsEarned,
    }))
  );
  const clampedProgress = Math.min(1, progress / challenge.target);
  const isComplete = clampedProgress >= 1;

  const progressWidth = useSharedValue(0);
  React.useEffect(() => {
    progressWidth.value = withSpring(clampedProgress, {
      tension: 50,
      friction: 8,
    });
    if (isComplete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [clampedProgress, isComplete]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <LinearGradient
      colors={
        isComplete
          ? ["#1B5E20", "#2E7D32"]
          : ["#E8F5E9", "#C8E6C9"]
      }
      style={[
        styles.card,
        { borderColor: isComplete ? colors.primary : colors.border },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          <View style={styles.labelRow}>
            <Feather
              name="target"
              size={12}
              color={isComplete ? "rgba(255,255,255,0.8)" : colors.accent}
            />
            <Text
              style={[
                styles.label,
                { color: isComplete ? "rgba(255,255,255,0.8)" : colors.accent },
              ]}
            >
              DAILY CHALLENGE
            </Text>
          </View>
          <Text
            style={[
              styles.description,
              { color: isComplete ? "#FFFFFF" : colors.foreground },
            ]}
          >
            {challenge.emoji}{"  "}{challenge.description}
          </Text>
        </View>

        <View
          style={[
            styles.bonusChip,
            {
              backgroundColor: isComplete
                ? "rgba(255,255,255,0.2)"
                : colors.primary,
            },
          ]}
        >
          <Text style={styles.bonusText}>+{challenge.bonusPoints}</Text>
          <Text style={styles.bonusSub}>pts</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View
          style={[
            styles.progressBg,
            { backgroundColor: isComplete ? "rgba(255,255,255,0.2)" : "#B2DFDB" },
          ]}
        >
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: isComplete ? "#FFFFFF" : colors.primary,
              },
              progressStyle,
            ]}
          />
        </View>

        <View style={styles.progressFooter}>
          <Text
            style={[
              styles.progressText,
              { color: isComplete ? "rgba(255,255,255,0.9)" : colors.mutedForeground },
            ]}
          >
            {Math.min(progress, challenge.target)} / {challenge.target}{" "}
            {challenge.type === "points" ? "pts" : "items"}
          </Text>

          {isComplete ? (
            <View style={styles.completedRow}>
              <Feather name="check-circle" size={14} color="#FFFFFF" />
              <Text style={styles.completedText}>Completed!</Text>
            </View>
          ) : (
            <Text
              style={[styles.remainText, { color: colors.mutedForeground }]}
            >
              {challenge.target - progress} more to go
            </Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  leftGroup: {
    flex: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    lineHeight: 22,
  },
  bonusChip: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 56,
  },
  bonusText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  bonusSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  progressSection: {
    gap: 8,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  remainText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
