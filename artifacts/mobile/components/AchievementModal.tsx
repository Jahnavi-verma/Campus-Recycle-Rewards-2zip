import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BADGES } from "@/constants/gamification";
import { useColors } from "@/hooks/useColors";

export interface AchievementData {
  type: "badge" | "levelup" | "challenge";
  badgeId?: string;
  level?: number;
  levelTitle?: string;
  bonusPoints?: number;
  multiplier?: number;
}

interface Props {
  visible: boolean;
  data: AchievementData | null;
  onClose: () => void;
}

export function AchievementModal({ visible, data, onClose }: Props) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -10, duration: 150, useNativeDriver: false }),
          Animated.spring(bounceAnim, { toValue: 0, tension: 100, friction: 5, useNativeDriver: false }),
        ]).start();
      });
    }
  }, [visible]);

  if (!data) return null;

  const badge = data.badgeId ? BADGES.find((b) => b.id === data.badgeId) : null;

  const getGradient = (): [string, string] => {
    if (data.type === "levelup") return ["#1B5E20", "#2E7D32"];
    if (data.type === "challenge") return ["#E65100", "#FF9800"];
    return [badge?.color ?? "#FFB300", badge?.color ? `${badge.color}99` : "#FFD54F"];
  };

  const getTitle = () => {
    if (data.type === "levelup") return "Level Up!";
    if (data.type === "challenge") return "Challenge Complete!";
    return "Badge Unlocked!";
  };

  const getSubtitle = () => {
    if (data.type === "levelup")
      return `You reached Level ${data.level}: ${data.levelTitle}`;
    if (data.type === "challenge")
      return `+${data.bonusPoints} bonus points earned`;
    return badge?.description ?? "";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: bounceAnim },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          <LinearGradient colors={getGradient()} style={styles.iconBg}>
            {data.type === "badge" && badge ? (
              <Feather
                name={badge.icon as React.ComponentProps<typeof Feather>["name"]}
                size={52}
                color="#FFFFFF"
              />
            ) : data.type === "levelup" ? (
              <Text style={styles.levelEmoji}>⬆</Text>
            ) : (
              <Feather name="check-circle" size={52} color="#FFFFFF" />
            )}
          </LinearGradient>

          <View style={styles.sparkleRow}>
            {["✨", "⭐", "✨"].map((s, i) => (
              <Text key={i} style={styles.sparkle}>{s}</Text>
            ))}
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>
            {getTitle()}
          </Text>

          {data.type === "badge" && badge && (
            <Text style={[styles.badgeName, { color: badge.color ?? colors.primary }]}>
              {badge.name}
            </Text>
          )}

          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {getSubtitle()}
          </Text>

          {data.type === "levelup" && (
            <View style={[styles.pill, { backgroundColor: colors.secondary }]}>
              <Feather name="trending-up" size={14} color={colors.primary} />
              <Text style={[styles.pillText, { color: colors.primary }]}>
                Keep climbing the leaderboard!
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Awesome!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
  },
  iconBg: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  levelEmoji: {
    fontSize: 48,
    color: "#FFFFFF",
  },
  sparkleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  sparkle: {
    fontSize: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: "Outfit_700Bold",
    marginBottom: 4,
    textAlign: "center",
  },
  badgeName: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
  },
  btn: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
    width: "100%",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
  },
});
