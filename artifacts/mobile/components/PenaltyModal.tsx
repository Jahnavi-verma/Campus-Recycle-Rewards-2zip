import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  penaltyPoints: number;
  wrongItem: string;
  expectedItem: string;
  onClose: () => void;
}

export function PenaltyModal({ visible, penaltyPoints, wrongItem, expectedItem, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      shakeAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 24,
              transform: [
                { scale: scaleAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <View style={styles.iconWrap}>
            <Text style={styles.warningIcon}>⚠️</Text>
          </View>

          <Text style={[styles.title, { color: "#DC2626" }]}>
            Wrong Item!
          </Text>

          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            This bin is for{" "}
            <Text style={[styles.bold, { color: colors.foreground }]}>
              {expectedItem}s only
            </Text>
            {". "}
            You tried to recycle a{" "}
            <Text style={[styles.bold, { color: "#DC2626" }]}>{wrongItem}</Text>.
          </Text>

          <View style={styles.penaltyBox}>
            <Text style={styles.penaltyEmoji}>💔</Text>
            <View>
              <Text style={styles.penaltyPoints}>-{penaltyPoints} points</Text>
              <Text style={styles.penaltyLabel}>deducted from your score</Text>
            </View>
          </View>

          <View style={[styles.tipBox, { backgroundColor: "#FFF8E1", borderColor: "#FFE082" }]}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              Always check the bin label before recycling to avoid penalties.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: "#DC2626" }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.closeBtnText}>Understood</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    gap: 16,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  warningIcon: { fontSize: 36 },
  title: {
    fontSize: 26,
    fontFamily: "Outfit_700Bold",
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    textAlign: "center",
    lineHeight: 23,
  },
  bold: {
    fontFamily: "Outfit_700Bold",
  },
  penaltyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FEF2F2",
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 18,
    width: "100%",
  },
  penaltyEmoji: { fontSize: 28 },
  penaltyPoints: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    color: "#DC2626",
  },
  penaltyLabel: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: "#9CA3AF",
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    width: "100%",
  },
  tipIcon: { fontSize: 16, marginTop: 1 },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: "#5D4037",
    lineHeight: 19,
  },
  closeBtn: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  closeBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
  },
});
