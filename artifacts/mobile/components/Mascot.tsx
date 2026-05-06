import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface MascotConfig {
  emoji: string;
  name: string;
  tagline: string;
  bgColor: string;
  glowColor: string;
}

function getMascotForLevel(level: number): MascotConfig {
  if (level <= 1) return {
    emoji: "🌱",
    name: "Sprout",
    tagline: "just getting started...",
    bgColor: "#DCFCE7",
    glowColor: "#86EFAC",
  };
  if (level === 2) return {
    emoji: "🌿",
    name: "Sapling",
    tagline: "the bins know your face.",
    bgColor: "#D1FAE5",
    glowColor: "#6EE7B7",
  };
  if (level === 3) return {
    emoji: "🌳",
    name: "Grove",
    tagline: "the campus feels it.",
    bgColor: "#ECFDF5",
    glowColor: "#34D399",
  };
  if (level <= 5) return {
    emoji: "🌲",
    name: "Forest",
    tagline: "recycling runs in your veins.",
    bgColor: "#F0FDF4",
    glowColor: "#4ADE80",
  };
  if (level <= 8) return {
    emoji: "⚡🌲",
    name: "Thundergrove",
    tagline: "you're literally powering the planet.",
    bgColor: "#FEFCE8",
    glowColor: "#FDE047",
  };
  return {
    emoji: "🏆🌳",
    name: "EcoLegend",
    tagline: "campus hall of fame. no cap.",
    bgColor: "#FFF7ED",
    glowColor: "#FB923C",
  };
}

interface MascotProps {
  level: number;
  streak: number;
}

export function Mascot({ level, streak }: MascotProps) {
  const colors = useColors();
  const mascot = getMascotForLevel(level);
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1600, useNativeDriver: false }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1600, useNativeDriver: false }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 1800, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Animated.View
        style={[
          styles.glowRing,
          {
            backgroundColor: mascot.glowColor,
            opacity: glowAnim,
            transform: [{ translateY: floatAnim }],
          },
        ]}
      />
      <Animated.Text style={[styles.emoji, { transform: [{ translateY: floatAnim }] }]}>
        {mascot.emoji}
      </Animated.Text>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.mascotName, { color: colors.foreground }]}>{mascot.name}</Text>
          <View style={[styles.levelPill, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.levelPillText, { color: colors.primary }]}>Lv.{level}</Text>
          </View>
        </View>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>{mascot.tagline}</Text>
        {streak >= 3 && (
          <View style={styles.streakRow}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>
              {streak} day streak — {streak >= 14 ? "on fire" : streak >= 7 ? "unstoppable" : "keep it up"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    overflow: "hidden",
  },
  glowRing: {
    position: "absolute",
    left: 10,
    top: "50%",
    width: 68,
    height: 68,
    borderRadius: 34,
    marginTop: -34,
  },
  emoji: {
    fontSize: 42,
    lineHeight: 52,
    width: 60,
    textAlign: "center",
  },
  info: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  mascotName: { fontSize: 17, fontFamily: "Outfit_700Bold" },
  levelPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelPillText: { fontSize: 11, fontFamily: "Outfit_700Bold" },
  tagline: { fontSize: 13, fontFamily: "Outfit_400Regular", lineHeight: 19 },
  streakRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  streakFire: { fontSize: 13 },
  streakLabel: { fontSize: 12, fontFamily: "Outfit_500Medium" },
});
