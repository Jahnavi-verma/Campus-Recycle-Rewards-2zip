import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getDailyFactIndex,
  RECYCLING_FACTS,
} from "@/constants/recyclingFacts";
import { useColors } from "@/hooks/useColors";

const OPENERS = [
  "did you know?",
  "and also...",
  "one more thing:",
  "wait, really?",
  "here's another:",
  "okay this one's wild:",
  "facts, no cap:",
];

export function FactCard() {
  const colors = useColors();
  const [index, setIndex] = useState(getDailyFactIndex());
  const [tapCount, setTapCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const flipAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const fact = RECYCLING_FACTS[index];
  const opener = OPENERS[Math.min(tapCount, OPENERS.length - 1)];
  const total = RECYCLING_FACTS.length;

  const handleTap = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.sequence([
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIndex((prev) => (prev + 1) % total);
      setTapCount((c) => c + 1);
      setCopied(false);

      Animated.spring(flipAnim, {
        toValue: 1,
        tension: 280,
        friction: 16,
        useNativeDriver: false,
      }).start();

      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.03, duration: 80, useNativeDriver: false }),
        Animated.spring(bounceAnim, { toValue: 1, tension: 200, friction: 10, useNativeDriver: false }),
      ]).start();
    });
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(fact.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {}
  };

  const scaleX = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });
  const opacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          transform: [{ scaleX }, { scale: bounceAnim }],
        },
      ]}
    >
      {/* Category strip */}
      <View style={[styles.categoryStrip, { backgroundColor: fact.color }]} />

      <Animated.View style={[styles.inner, { opacity }]}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.openerRow}>
            <Text style={[styles.opener, { color: fact.color }]}>{opener}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.categoryPill, { backgroundColor: `${fact.color}18` }]}>
              <Text style={[styles.categoryText, { color: fact.color }]}>
                {fact.category}
              </Text>
            </View>
            <Text style={[styles.counter, { color: colors.mutedForeground }]}>
              {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </Text>
          </View>
        </View>

        {/* Emoji + Fact */}
        <View style={styles.contentRow}>
          <Text style={styles.emoji}>{fact.emoji}</Text>
          <Text style={[styles.factText, { color: colors.foreground }]}>
            {fact.text}
          </Text>
        </View>

        {/* Footer row */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.copyBtn, { borderColor: colors.border }]}
            onPress={handleCopy}
            activeOpacity={0.7}
          >
            <Feather
              name={copied ? "check" : "copy"}
              size={13}
              color={copied ? colors.eco : colors.mutedForeground}
            />
            <Text style={[styles.copyText, { color: copied ? colors.eco : colors.mutedForeground }]}>
              {copied ? "copied!" : "copy"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTap}
            style={[styles.nextBtn, { backgroundColor: `${fact.color}18` }]}
            activeOpacity={0.75}
          >
            <Text style={[styles.nextText, { color: fact.color }]}>
              next fact →
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    marginHorizontal: 16,
    marginTop: 14,
  },
  categoryStrip: {
    height: 4,
    width: "100%",
  },
  inner: {
    padding: 18,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  openerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  opener: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
    textTransform: "lowercase",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryPill: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: "Outfit_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  counter: {
    fontSize: 11,
    fontFamily: "Outfit_500Medium",
    letterSpacing: 0.5,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  emoji: {
    fontSize: 32,
    lineHeight: 38,
    marginTop: 2,
  },
  factText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    lineHeight: 23,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  copyText: {
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
  },
  nextBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  nextText: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
  },
});
