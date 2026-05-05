import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";

const COLORS = [
  "#FFD700", "#FF6B6B", "#4CAF50", "#00BCD4",
  "#FF9800", "#E91E63", "#7C4DFF", "#00E676",
  "#FFEB3B", "#29B6F6", "#FF4081", "#69F0AE",
];

interface PieceConfig {
  id: number;
  delay: number;
  x: number;
  color: string;
  size: number;
  initialRotation: number;
  isCircle: boolean;
  driftX: number;
  duration: number;
}

function ConfettiPiece({ delay, x, color, size, initialRotation, isCircle, driftX, duration }: PieceConfig) {
  const { height: H } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(-80)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(initialRotation)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const nd = false;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: nd }),
        Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: nd }),
        Animated.timing(translateY, {
          toValue: H + 100,
          duration,
          easing: Easing.in(Easing.quad),
          useNativeDriver: nd,
        }),
        Animated.timing(translateX, {
          toValue: driftX,
          duration: duration * 0.75,
          useNativeDriver: nd,
        }),
        Animated.timing(rotate, {
          toValue: initialRotation + 540 + Math.random() * 360,
          duration,
          useNativeDriver: nd,
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(delay + duration * 0.75),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: nd }),
    ]).start();
  }, []);

  const rotateDeg = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: size,
        height: isCircle ? size : size * 0.45,
        backgroundColor: color,
        borderRadius: isCircle ? size / 2 : 2,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: rotateDeg }, { scale }],
      }}
    />
  );
}

export function ConfettiOverlay({ visible }: { visible: boolean }) {
  const { width: W } = useWindowDimensions();

  const pieces = useMemo<PieceConfig[]>(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        delay: Math.random() * 1200,
        x: Math.random() * W,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 14 + 6,
        initialRotation: Math.random() * 360,
        isCircle: Math.random() > 0.55,
        driftX: (Math.random() - 0.5) * 160,
        duration: 2600 + Math.random() * 1400,
      })),
    [visible] // regenerate each time it becomes visible
  );

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} {...p} />
      ))}
    </View>
  );
}
