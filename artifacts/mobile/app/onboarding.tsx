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

const SLIDES = [
  {
    id: "0",
    gradient: ["#00251A", "#004D40", "#00695C"] as [string, string, string],
    accent: "#A7FFEB",
    emoji: "♻",
    emojiBg: "rgba(167,255,235,0.12)",
    title: "binGO",
    titleSize: 80,
    sub: "Your campus recycling companion",
    body: "Turn everyday waste into rewards. Built exclusively for BMSCE students.",
    circleColors: ["rgba(167,255,235,0.08)", "rgba(0,191,165,0.10)", "rgba(255,255,255,0.05)"],
  },
  {
    id: "1",
    gradient: ["#0A2900", "#1B5E20", "#2E7D32"] as [string, string, string],
    accent: "#CCFF90",
    emoji: "🥤",
    emojiBg: "rgba(204,255,144,0.10)",
    title: "Scan.\nLog.\nEarn.",
    titleSize: 60,
    sub: "Three taps, real rewards",
    body: "Scan the bin's QR code, log your cans & bottles, and watch your score climb.",
    circleColors: ["rgba(204,255,144,0.07)", "rgba(76,175,80,0.10)", "rgba(255,255,255,0.04)"],
  },
  {
    id: "2",
    gradient: ["#1A1A00", "#33691E", "#558B2F"] as [string, string, string],
    accent: "#FFD180",
    emoji: "🏆",
    emojiBg: "rgba(255,209,128,0.12)",
    title: "Lead the\nGreen\nBoard.",
    titleSize: 54,
    sub: "Campus-wide competition",
    body: "Compete with BMSCE students, earn badges, rise the ranks, and make your campus proud.",
    circleColors: ["rgba(255,209,128,0.08)", "rgba(255,193,7,0.07)", "rgba(255,255,255,0.04)"],
  },
];

interface FloatCircleProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

function FloatCircle({ x, y, size, color, delay, duration }: FloatCircleProps) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(anim, { toValue: 1, duration, delay, useNativeDriver: false }),
          Animated.timing(scaleAnim, { toValue: 1.08, duration, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: false }),
          Animated.timing(scaleAnim, { toValue: 1, duration, useNativeDriver: false }),
        ]),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -28] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ translateY }, { scale: scaleAnim }],
      }}
    />
  );
}

interface SlideProps {
  slide: (typeof SLIDES)[0];
  index: number;
  scrollX: Animated.Value;
}

function Slide({ slide, index, scrollX }: SlideProps) {
  const inputRange = [(index - 1) * W, index * W, (index + 1) * W];

  const titleTranslate = scrollX.interpolate({
    inputRange,
    outputRange: [60, 0, -60],
    extrapolate: "clamp",
  });

  const contentOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });

  const emojiScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.7, 1, 0.7],
    extrapolate: "clamp",
  });

  const CIRCLES = [
    { x: -60, y: H * 0.05, size: 200, color: slide.circleColors[0], delay: 0, duration: 3800 },
    { x: W * 0.6, y: H * 0.1, size: 160, color: slide.circleColors[1], delay: 600, duration: 4200 },
    { x: W * 0.2, y: H * 0.55, size: 240, color: slide.circleColors[2], delay: 1200, duration: 5000 },
    { x: -40, y: H * 0.65, size: 120, color: slide.circleColors[0], delay: 300, duration: 3400 },
    { x: W * 0.75, y: H * 0.5, size: 100, color: slide.circleColors[1], delay: 900, duration: 4600 },
  ];

  return (
    <View style={{ width: W }}>
      {CIRCLES.map((c, i) => (
        <FloatCircle key={i} {...c} />
      ))}

      <Animated.View style={[styles.slideContent, { opacity: contentOpacity }]}>
        <Animated.View
          style={[
            styles.emojiCircle,
            {
              backgroundColor: slide.emojiBg,
              transform: [{ scale: emojiScale }],
            },
          ]}
        >
          <Text style={styles.emojiText}>{slide.emoji}</Text>
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY: titleTranslate }] }}>
          <Text
            style={[
              styles.slideTitle,
              { fontSize: slide.titleSize, lineHeight: slide.titleSize * 1.1 },
            ]}
          >
            {slide.title}
          </Text>
        </Animated.View>

        <View style={[styles.accentBadge, { backgroundColor: `${slide.accent}20`, borderColor: `${slide.accent}40` }]}>
          <Text style={[styles.accentBadgeText, { color: slide.accent }]}>
            {slide.sub}
          </Text>
        </View>

        <Text style={styles.bodyText}>{slide.body}</Text>
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
  const btnScale = useRef(new Animated.Value(1)).current;

  const slide = SLIDES[activeIndex];
  const isLast = activeIndex === SLIDES.length - 1;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(btnScale, { toValue: 1.03, duration: 900, useNativeDriver: false }),
        Animated.timing(btnScale, { toValue: 1, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, []);

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
      <LinearGradient
        colors={slide.gradient}
        style={StyleSheet.absoluteFill}
      />

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
          const idx = Math.round(e.nativeEvent.contentOffset.x / W);
          setActiveIndex(idx);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Slide slide={item} index={index} scrollX={scrollX} />
        )}
        style={{ paddingTop: Platform.OS === "web" ? 60 : insets.top + 8 }}
      />

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 28 }]}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: "rgba(255,255,255,0.5)" }]}>
            {isLast ? "" : "Skip"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const width = scrollX.interpolate({
              inputRange: [(i - 1) * W, i * W, (i + 1) * W],
              outputRange: [8, 28, 8],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * W, i * W, (i + 1) * W],
              outputRange: [0.35, 1, 0.35],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width, opacity, backgroundColor: slide.accent }]}
              />
            );
          })}
        </View>

        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: slide.accent }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={[styles.nextBtnText, { color: "#003322" }]}>
              {isLast ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Text style={styles.campusTag}>BMSCE Campus Recycling Program</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slideContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  emojiCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  emojiText: {
    fontSize: 72,
  },
  slideTitle: {
    fontFamily: "Outfit_800ExtraBold",
    color: "#FFFFFF",
    letterSpacing: -1.5,
    marginBottom: 20,
  },
  accentBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  accentBadgeText: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.3,
  },
  bodyText: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 26,
    maxWidth: 300,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  skipBtn: {
    minWidth: 50,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    fontFamily: "Outfit_500Medium",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minWidth: 100,
    alignItems: "center",
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 0.2,
  },
  campusTag: {
    textAlign: "center",
    color: "rgba(255,255,255,0.25)",
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 0.5,
    paddingBottom: 8,
  },
});
