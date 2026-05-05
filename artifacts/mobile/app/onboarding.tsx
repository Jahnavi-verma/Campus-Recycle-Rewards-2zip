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

const { width: W, height: H } = Dimensions.get("window");

// Each slide has its own personality
const SLIDES = [
  {
    id: "0",
    // Dark moody intro
    gradient: ["#09090B", "#0F0F23"] as [string, string],
    darkText: false,
    accent: "#A78BFA",
    accentDim: "rgba(167,139,250,0.15)",
    emoji: "♻",
    preTitle: "made for bmsce.  🌿",
    title: "binGO.",
    titleSize: 84,
    body: "toss a can. scan the bin. earn points.\nthat's literally the whole thing.",
    circleColors: [
      "rgba(139,92,246,0.10)",
      "rgba(167,139,250,0.07)",
      "rgba(109,40,217,0.08)",
      "rgba(255,255,255,0.03)",
    ],
  },
  {
    id: "1",
    // Warm cream — total contrast flip
    gradient: ["#FFFCF0", "#FFF7E0"] as [string, string],
    darkText: true,
    accent: "#F97316",
    accentDim: "rgba(249,115,22,0.12)",
    emoji: "🥤",
    preTitle: "ok here's how it works.",
    title: "three steps.\nthat's it.",
    titleSize: 56,
    body: "scan the bin's QR code → pick cans or bottles → confirm. points appear. repeat.",
    circleColors: [
      "rgba(251,191,36,0.10)",
      "rgba(249,115,22,0.07)",
      "rgba(234,88,12,0.06)",
      "rgba(253,230,138,0.15)",
    ],
  },
  {
    id: "2",
    // Deep indigo — competitive energy
    gradient: ["#1E1B4B", "#312E81"] as [string, string],
    darkText: false,
    accent: "#FCD34D",
    accentDim: "rgba(252,211,77,0.15)",
    emoji: "🏆",
    preTitle: "1000+ students are already in.",
    title: "where's\nyour name?",
    titleSize: 62,
    body: "streaks, badges, daily challenges, multipliers. the leaderboard won't climb itself.",
    circleColors: [
      "rgba(99,102,241,0.15)",
      "rgba(129,140,248,0.10)",
      "rgba(165,180,252,0.07)",
      "rgba(255,255,255,0.04)",
    ],
  },
];

interface FloatCircleProps {
  x: number; y: number; size: number;
  color: string; delay: number; duration: number;
}

function FloatCircle({ x, y, size, color, delay, duration }: FloatCircleProps) {
  const anim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, delay, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });
  return (
    <Animated.View style={{
      position: "absolute", left: x, top: y,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, transform: [{ translateY }],
    }} />
  );
}

function Slide({
  slide, index, scrollX,
}: {
  slide: typeof SLIDES[0]; index: number; scrollX: Animated.Value;
}) {
  const range = [(index - 1) * W, index * W, (index + 1) * W];
  const textColor = slide.darkText ? "#18181B" : "#FFFFFF";
  const bodyColor = slide.darkText ? "rgba(24,24,27,0.6)" : "rgba(255,255,255,0.6)";

  const contentOpacity = scrollX.interpolate({
    inputRange: range, outputRange: [0, 1, 0], extrapolate: "clamp",
  });
  const titleSlide = scrollX.interpolate({
    inputRange: range, outputRange: [50, 0, -50], extrapolate: "clamp",
  });
  const emojiScale = scrollX.interpolate({
    inputRange: range, outputRange: [0.75, 1, 0.75], extrapolate: "clamp",
  });

  const CIRCLES = [
    { x: -70, y: H * 0.04, size: 220, color: slide.circleColors[0], delay: 0, duration: 4200 },
    { x: W * 0.6, y: H * 0.08, size: 170, color: slide.circleColors[1], delay: 700, duration: 3800 },
    { x: W * 0.15, y: H * 0.52, size: 260, color: slide.circleColors[2], delay: 1400, duration: 5000 },
    { x: W * 0.7, y: H * 0.55, size: 110, color: slide.circleColors[3] ?? slide.circleColors[0], delay: 400, duration: 4600 },
  ];

  return (
    <View style={{ width: W, height: H, overflow: "hidden" }}>
      <LinearGradient colors={slide.gradient} style={StyleSheet.absoluteFill} />

      {CIRCLES.map((c, i) => <FloatCircle key={i} {...c} />)}

      <Animated.View style={[styles.slideContent, { opacity: contentOpacity }]}>
        {/* Pre-title */}
        <Text style={[styles.preTitle, { color: slide.accent }]}>
          {slide.preTitle}
        </Text>

        {/* Emoji */}
        <Animated.View style={[styles.emojiWrap, {
          backgroundColor: slide.accentDim,
          borderColor: `${slide.accent}30`,
          transform: [{ scale: emojiScale }],
        }]}>
          <Text style={styles.emojiText}>{slide.emoji}</Text>
        </Animated.View>

        {/* Headline */}
        <Animated.Text style={[
          styles.slideTitle,
          { fontSize: slide.titleSize, color: textColor, transform: [{ translateY: titleSlide }] },
        ]}>
          {slide.title}
        </Animated.Text>

        {/* Body */}
        <Text style={[styles.bodyText, { color: bodyColor }]}>{slide.body}</Text>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slide = SLIDES[activeIndex];
  const isLast = activeIndex === SLIDES.length - 1;
  const textColor = slide.darkText ? "#18181B" : "#FFFFFF";
  const mutedColor = slide.darkText ? "rgba(24,24,27,0.4)" : "rgba(255,255,255,0.4)";

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
    <View style={styles.root}>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / W));
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Slide slide={item} index={index} scrollX={scrollX} />
        )}
        style={{ paddingTop: Platform.OS === "web" ? 60 : insets.top + 12 }}
      />

      <View style={[styles.footer, {
        bottom: Platform.OS === "web" ? 44 : insets.bottom + 24,
      }]}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const w = scrollX.interpolate({
              inputRange: [(i - 1) * W, i * W, (i + 1) * W],
              outputRange: [7, 24, 7],
              extrapolate: "clamp",
            });
            const op = scrollX.interpolate({
              inputRange: [(i - 1) * W, i * W, (i + 1) * W],
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View key={i} style={[styles.dot, {
                width: w, opacity: op, backgroundColor: slide.accent,
              }]} />
            );
          })}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          {!isLast && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: mutedColor }]}>skip</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: slide.accent }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={[styles.nextBtnText, { color: slide.darkText ? "#FFFFFF" : "#18181B" }]}>
              {isLast ? "let's go →" : "next →"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slideContent: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 16,
  },
  preTitle: {
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
    letterSpacing: 0.5,
    marginBottom: 20,
    textTransform: "lowercase",
  },
  emojiWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderWidth: 1.5,
  },
  emojiText: { fontSize: 52 },
  slideTitle: {
    fontFamily: "Outfit_800ExtraBold",
    lineHeight: undefined,
    letterSpacing: -2,
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    lineHeight: 26,
    maxWidth: 300,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 16,
    gap: 20,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: { height: 7, borderRadius: 4 },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipBtn: { paddingVertical: 8, paddingRight: 16 },
  skipText: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
  },
  nextBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginLeft: "auto",
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 0.1,
  },
});
