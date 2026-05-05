import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    headline: "Scan.\nRecycle.\nEarn.",
    body: "Turn your everyday recycling into real rewards — right here on the BMSCE campus.",
    icon: "♻",
  },
  {
    id: "2",
    headline: "Every Can\nCounts.",
    body: "Scan the bin's QR code, log your cans and bottles, and watch your points soar.",
    icon: "🥤",
  },
  {
    id: "3",
    headline: "Lead the\nGreen Board.",
    body: "Compete with fellow BMSCE students, earn badges, and make the campus greener.",
    icon: "🏆",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLast = activeIndex === SLIDES.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await completeOnboarding();
      router.replace("/(auth)/login");
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace("/(auth)/login");
  };

  return (
    <LinearGradient
      colors={["#1B5E20", "#2E7D32", "#388E3C"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}
    >
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.slideIcon}>{item.icon}</Text>
            <Text style={styles.headline}>{item.headline}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          const scaleX = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [1, 2.4, 1],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { opacity, transform: [{ scaleX }] }]}
            />
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={handleNext}
        activeOpacity={0.85}
      >
        <Text style={styles.nextBtnText}>
          {isLast ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.campusTag, Platform.OS === "web" ? { marginBottom: 34 } : {}]}>
        BMSCE Campus Recycling Program
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  skipBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  slide: {
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingTop: 40,
  },
  slideIcon: {
    fontSize: 64,
    marginBottom: 32,
  },
  headline: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    lineHeight: 56,
    marginBottom: 20,
  },
  body: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.82)",
    lineHeight: 26,
    maxWidth: 300,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  nextBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    marginBottom: 20,
    minWidth: 220,
    alignItems: "center",
  },
  nextBtnText: {
    color: "#1B5E20",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  campusTag: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
});
