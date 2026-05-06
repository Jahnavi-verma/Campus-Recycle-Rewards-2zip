import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { TriviaQuestion } from "@/constants/trivia";

interface TriviaModalProps {
  visible: boolean;
  question: TriviaQuestion;
  onClose: () => void;
}

export function TriviaModal({ visible, question, onClose }: TriviaModalProps) {
  const colors = useColors();
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0)).current;

  const isCorrect = selected === question.correctIndex;

  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: false }),
    ]).start();
  };

  const popIn = () => {
    resultScale.setValue(0.5);
    Animated.spring(resultScale, {
      toValue: 1,
      tension: 80,
      friction: 6,
      useNativeDriver: false,
    }).start();
  };

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx !== question.correctIndex) {
      shake();
    } else {
      popIn();
    }
  };

  const handleClose = () => {
    setSelected(null);
    setAnswered(false);
    resultScale.setValue(0);
    onClose();
  };

  const getOptionStyle = (idx: number) => {
    if (!answered) return { backgroundColor: colors.secondary, borderColor: colors.border };
    if (idx === question.correctIndex) return { backgroundColor: "#DCFCE7", borderColor: "#4ADE80" };
    if (idx === selected) return { backgroundColor: "#FEE2E2", borderColor: "#F87171" };
    return { backgroundColor: colors.secondary, borderColor: colors.border, opacity: 0.5 };
  };

  const getOptionTextColor = (idx: number) => {
    if (!answered) return colors.foreground;
    if (idx === question.correctIndex) return "#166534";
    if (idx === selected) return "#991B1B";
    return colors.mutedForeground;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            !answered ? {} : { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          <View style={styles.topRow}>
            <View style={[styles.triviaChip, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.triviaChipText, { color: colors.primary }]}>🧠 bonus trivia</Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.streakNote, { color: colors.mutedForeground }]}>
            Get it right → streak shield for tomorrow 🛡️
          </Text>

          <Text style={[styles.question, { color: colors.foreground }]}>{question.question}</Text>

          <View style={styles.options}>
            {question.options.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.option, getOptionStyle(idx)]}
                onPress={() => handleSelect(idx)}
                activeOpacity={0.8}
                disabled={answered}
              >
                <View style={[
                  styles.optionDot,
                  {
                    backgroundColor: !answered
                      ? colors.primary
                      : idx === question.correctIndex
                        ? "#22C55E"
                        : idx === selected
                          ? "#EF4444"
                          : colors.border,
                  },
                ]}>
                  <Text style={styles.optionDotText}>
                    {["A", "B", "C", "D"][idx]}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: getOptionTextColor(idx) }]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {answered && (
            <Animated.View
              style={[
                styles.resultBox,
                {
                  backgroundColor: isCorrect ? "#DCFCE7" : "#FFF7ED",
                  transform: isCorrect ? [{ scale: resultScale }] : [],
                },
              ]}
            >
              <Text style={styles.resultEmoji}>{isCorrect ? "🎉" : "💡"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultTitle, { color: isCorrect ? "#166534" : "#9A3412" }]}>
                  {isCorrect ? "nailed it! streak protected 🛡️" : "not quite — here's the tea:"}
                </Text>
                <Text style={[styles.resultExplanation, { color: isCorrect ? "#15803D" : "#C2410C" }]}>
                  {question.explanation}
                </Text>
              </View>
            </Animated.View>
          )}

          {answered && (
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.primary }]}
              onPress={handleClose}
              activeOpacity={0.85}
            >
              <Text style={styles.closeBtnText}>
                {isCorrect ? "claim my shield ✊" : "okay, got it"}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    borderRadius: 28,
    padding: 24,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  triviaChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  triviaChipText: { fontSize: 12, fontFamily: "Outfit_700Bold" },
  streakNote: { fontSize: 12, fontFamily: "Outfit_400Regular" },
  question: { fontSize: 17, fontFamily: "Outfit_700Bold", lineHeight: 25 },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
  },
  optionDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  optionDotText: { fontSize: 11, fontFamily: "Outfit_700Bold", color: "#FFFFFF" },
  optionText: { flex: 1, fontSize: 14, fontFamily: "Outfit_500Medium", lineHeight: 20 },
  resultBox: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    alignItems: "flex-start",
  },
  resultEmoji: { fontSize: 22 },
  resultTitle: { fontSize: 13, fontFamily: "Outfit_700Bold", marginBottom: 4 },
  resultExplanation: { fontSize: 12, fontFamily: "Outfit_400Regular", lineHeight: 18 },
  closeBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  closeBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Outfit_700Bold" },
});
