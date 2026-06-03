import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Step {
  emoji: string;
  title: string;
  description: string;
  color: string;
}

const STEPS: Step[] = [
  {
    emoji: "✊",
    title: "Crush the Can",
    description: "Flatten cans or crush bottles to save space inside the bin.",
    color: "#E8F5E9",
  },
  {
    emoji: "🫧",
    title: "Shake Out Residue",
    description: "Give it a quick shake to remove any liquid or food residue.",
    color: "#E3F2FD",
  },
  {
    emoji: "♻️",
    title: "Place It Gently",
    description: "Gently place the item inside the bin slot — don't throw!",
    color: "#F3E5F5",
  },
];

interface Props {
  visible: boolean;
  binType?: "can" | "bottle" | "any";
  onGotIt: () => void;
}

export function RecyclingInstructionsModal({ visible, binType, onGotIt }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const binLabel =
    binType === "can" ? "🥤 Cans Only" :
    binType === "bottle" ? "💧 Bottles Only" :
    "♻️ All Items";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.handle} />

          <Text style={[styles.title, { color: colors.foreground }]}>
            Before You Recycle
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Follow these steps for a clean, valid scan
          </Text>

          {binType && binType !== "any" && (
            <View style={[styles.binTypePill, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.binTypeText, { color: colors.primary }]}>
                This bin accepts: {binLabel}
              </Text>
            </View>
          )}

          <View style={styles.stepsContainer}>
            {STEPS.map((step, idx) => (
              <View
                key={idx}
                style={[styles.stepCard, { backgroundColor: step.color }]}
              >
                <View style={styles.stepLeft}>
                  <View style={[styles.stepNum, { backgroundColor: "rgba(0,0,0,0.08)" }]}>
                    <Text style={styles.stepNumText}>{idx + 1}</Text>
                  </View>
                </View>
                <View style={styles.stepEmoji}>
                  <Text style={styles.stepEmojiText}>{step.emoji}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.warningRow, { backgroundColor: "#FFF8E1", borderColor: "#FFE082" }]}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Placing the wrong item type will result in a <Text style={styles.warningBold}>-10 point penalty</Text>.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.gotItBtn, { backgroundColor: colors.primary }]}
            onPress={onGotIt}
            activeOpacity={0.85}
          >
            <Text style={styles.gotItText}>Got it — Let's Go! ♻️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    marginBottom: 16,
  },
  binTypePill: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  binTypeText: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
  },
  stepsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  stepLeft: { alignItems: "center" },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    color: "#333",
  },
  stepEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepEmojiText: { fontSize: 22 },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 15,
    fontFamily: "Outfit_700Bold",
    color: "#1A1A2E",
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: "#444",
    lineHeight: 18,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 20,
  },
  warningIcon: { fontSize: 18 },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: "#5D4037",
    lineHeight: 19,
  },
  warningBold: {
    fontFamily: "Outfit_700Bold",
    color: "#E65100",
  },
  gotItBtn: {
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
  },
  gotItText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
  },
});
