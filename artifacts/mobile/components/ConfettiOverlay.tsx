import React, { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const COLORS = [
  "#FFD700",
  "#FF6B6B",
  "#4CAF50",
  "#00BCD4",
  "#FF9800",
  "#E91E63",
  "#7C4DFF",
  "#00E676",
  "#FFEB3B",
  "#29B6F6",
];

interface PieceConfig {
  id: number;
  delay: number;
  x: number;
  color: string;
  size: number;
  initialRotation: number;
  isCircle: boolean;
}

function ConfettiPiece({
  delay,
  x,
  color,
  size,
  initialRotation,
  isCircle,
}: PieceConfig) {
  const { height: H } = useWindowDimensions();
  const translateY = useSharedValue(-80);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(initialRotation);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withTiming(1, { duration: 100 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    translateY.value = withDelay(
      delay,
      withTiming(H + 80, {
        duration: 2800 + Math.random() * 1200,
        easing: Easing.in(Easing.quad),
      })
    );
    translateX.value = withDelay(
      delay,
      withTiming((Math.random() - 0.5) * 120, { duration: 2000 })
    );
    rotate.value = withDelay(
      delay,
      withTiming(initialRotation + 540 + Math.random() * 360, {
        duration: 3000,
      })
    );
    opacity.value = withDelay(
      delay + 2200,
      withTiming(0, { duration: 600 })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          top: 0,
          width: size,
          height: isCircle ? size : size * 0.5,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : 2,
        },
        animStyle,
      ]}
    />
  );
}

interface Props {
  visible: boolean;
}

export function ConfettiOverlay({ visible }: Props) {
  const { width: W } = useWindowDimensions();

  const pieces = useMemo<PieceConfig[]>(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        delay: Math.random() * 1400,
        x: Math.random() * W,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 12 + 5,
        initialRotation: Math.random() * 360,
        isCircle: Math.random() > 0.5,
      })),
    [W]
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
