import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import {
  CO2_PER_BOTTLE,
  CO2_PER_CAN,
  POINTS_PER_BOTTLE,
  POINTS_PER_CAN,
} from "@/constants/gamification";
import { useColors } from "@/hooks/useColors";

type ItemType = "can" | "bottle";
type FlowStep = "idle" | "scanned" | "logging" | "success";

export default function ScanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addRecyclingSession } = useAuth();

  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<FlowStep>("idle");
  const [itemType, setItemType] = useState<ItemType>("can");
  const [quantity, setQuantity] = useState(1);
  const [lastResult, setLastResult] = useState<{
    pointsEarned: number;
    carbonReduced: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const scannedRef = useRef(false);
  const successScale = useRef(new Animated.Value(0)).current;

  const pointsPreview =
    itemType === "can"
      ? POINTS_PER_CAN * quantity
      : POINTS_PER_BOTTLE * quantity;

  const co2Preview =
    itemType === "can"
      ? CO2_PER_CAN * quantity
      : CO2_PER_BOTTLE * quantity;

  const handleBarCodeScanned = useCallback(() => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("scanned");
  }, []);

  const handleStartManual = () => {
    scannedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep("scanned");
  };

  const handleConfirm = async () => {
    setSaving(true);
    const result = await addRecyclingSession(itemType, quantity);
    setSaving(false);
    setLastResult(result);
    setStep("success");

    Animated.spring(successScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 7,
    }).start();
  };

  const handleReset = () => {
    scannedRef.current = false;
    setStep("idle");
    setQuantity(1);
    setItemType("can");
    setLastResult(null);
    successScale.setValue(0);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.permText, { color: colors.mutedForeground }]}>
          Checking camera permissions…
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <View
          style={[styles.permCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="camera-off" size={48} color={colors.mutedForeground} />
          <Text style={[styles.permTitle, { color: colors.foreground }]}>
            Camera Access Needed
          </Text>
          <Text style={[styles.permBody, { color: colors.mutedForeground }]}>
            binGO uses your camera to scan the recycling bin's QR code.
          </Text>
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: "#000000" }]}>
      {step === "idle" && (
        <>
          {Platform.OS !== "web" ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "code128", "ean13", "upc_a"],
              }}
              onBarcodeScanned={handleBarCodeScanned}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.webCamPlaceholder]}>
              <Feather name="camera" size={60} color="rgba(255,255,255,0.3)" />
              <Text style={styles.webCamText}>Camera preview (native only)</Text>
            </View>
          )}

          <View style={[styles.overlay, { paddingTop: topPad + 16 }]}>
            <Text style={styles.scanTitle}>Scan Bin QR Code</Text>
            <Text style={styles.scanSub}>
              Point your camera at the QR code on the recycling bin
            </Text>
          </View>

          <View style={styles.frameCont}>
            <View style={styles.frameOuter}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>

          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 },
            ]}
          >
            <TouchableOpacity
              style={styles.manualBtn}
              onPress={handleStartManual}
              activeOpacity={0.8}
            >
              <Feather name="edit-3" size={16} color="#FFFFFF" />
              <Text style={styles.manualBtnText}>Manual Entry</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === "scanned" && (
        <View
          style={[
            styles.logSheet,
            { backgroundColor: colors.background, paddingTop: topPad + 24, paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View style={styles.logHandle} />

          <View style={styles.logHeader}>
            <View style={[styles.successDot, { backgroundColor: "#43A047" }]}>
              <Feather name="check" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.logTitle, { color: colors.foreground }]}>
              Bin Verified! Log Your Items
            </Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Item Type
          </Text>
          <View style={[styles.toggleRow, { backgroundColor: colors.secondary }]}>
            {(["can", "bottle"] as ItemType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.toggleOpt,
                  itemType === t && { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  setItemType(t);
                  Haptics.selectionAsync();
                }}
              >
                <Feather
                  name={t === "can" ? "box" : "droplet"}
                  size={18}
                  color={itemType === t ? "#FFFFFF" : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.toggleText,
                    {
                      color:
                        itemType === t ? "#FFFFFF" : colors.mutedForeground,
                    },
                  ]}
                >
                  {t === "can" ? "Can" : "Bottle"}
                </Text>
                <Text
                  style={[
                    styles.togglePts,
                    {
                      color:
                        itemType === t
                          ? "rgba(255,255,255,0.8)"
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {t === "can" ? `${POINTS_PER_CAN} pts` : `${POINTS_PER_BOTTLE} pts`} each
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Quantity
          </Text>
          <View style={[styles.quantityRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: colors.card }]}
              onPress={() => {
                if (quantity > 1) {
                  setQuantity((q) => q - 1);
                  Haptics.selectionAsync();
                }
              }}
            >
              <Feather name="minus" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.qtyVal, { color: colors.foreground }]}>
              {quantity}
            </Text>
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: colors.card }]}
              onPress={() => {
                if (quantity < 50) {
                  setQuantity((q) => q + 1);
                  Haptics.selectionAsync();
                }
              }}
            >
              <Feather name="plus" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={["#E8F5E9", "#C8E6C9"]}
            style={styles.previewCard}
          >
            <View style={styles.previewRow}>
              <View style={styles.previewItem}>
                <Text style={[styles.previewVal, { color: colors.primary }]}>
                  +{pointsPreview}
                </Text>
                <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>
                  Points
                </Text>
              </View>
              <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
              <View style={styles.previewItem}>
                <Text style={[styles.previewVal, { color: colors.accent }]}>
                  {co2Preview.toFixed(2)} kg
                </Text>
                <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>
                  CO2 Saved
                </Text>
              </View>
            </View>
          </LinearGradient>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Feather name="check-circle" size={20} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>
              {saving ? "Saving…" : "Confirm Session"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleReset} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {step === "success" && lastResult && (
        <View
          style={[
            styles.successScreen,
            { backgroundColor: colors.background },
          ]}
        >
          <Animated.View
            style={[
              styles.successBubble,
              { transform: [{ scale: successScale }] },
            ]}
          >
            <LinearGradient
              colors={["#2E7D32", "#43A047"]}
              style={styles.successCircle}
            >
              <Feather name="check" size={56} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Session Logged!
          </Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Great job recycling on campus
          </Text>

          <View style={styles.rewardRow}>
            <View style={[styles.rewardCard, { backgroundColor: "#E8F5E9" }]}>
              <Feather name="star" size={22} color={colors.primary} />
              <Text style={[styles.rewardVal, { color: colors.primary }]}>
                +{lastResult.pointsEarned}
              </Text>
              <Text style={[styles.rewardLabel, { color: colors.mutedForeground }]}>
                Points Earned
              </Text>
            </View>
            <View style={[styles.rewardCard, { backgroundColor: "#E0F2F1" }]}>
              <Feather name="wind" size={22} color={colors.accent} />
              <Text style={[styles.rewardVal, { color: colors.accent }]}>
                {lastResult.carbonReduced.toFixed(2)} kg
              </Text>
              <Text style={[styles.rewardLabel, { color: colors.mutedForeground }]}>
                CO2 Reduced
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={handleReset}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Scan Another</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const FRAME = 240;
const CORNER = 28;
const CORNER_W = 4;

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  scanTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  scanSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  frameCont: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  frameOuter: {
    width: FRAME,
    height: FRAME,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#FFFFFF",
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W, borderBottomRightRadius: 4 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: 24,
  },
  manualBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  manualBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  webCamPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    gap: 12,
  },
  webCamText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  logSheet: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 28,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  successDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    gap: 6,
  },
  toggleOpt: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 4,
  },
  toggleText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  togglePts: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
    borderWidth: 1,
  },
  qtyBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyVal: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    minWidth: 60,
    textAlign: "center",
  },
  previewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewItem: {
    flex: 1,
    alignItems: "center",
  },
  previewVal: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  previewLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  previewDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 12,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  successBubble: {
    marginBottom: 32,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  successSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 40,
    textAlign: "center",
  },
  rewardRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    marginBottom: 40,
  },
  rewardCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  rewardVal: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  rewardLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  doneBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: "center",
    minWidth: 200,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  permCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    maxWidth: 320,
  },
  permTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  permBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  permText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  permBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 4,
  },
  permBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
