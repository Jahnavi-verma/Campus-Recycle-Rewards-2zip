import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface BinSpot {
  id: string;
  name: string;
  location: string;
  binType: "can" | "bottle" | "both";
  x: number;
  y: number;
  qrCode: string;
  isActive: boolean;
}

interface Building {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

const MAP_W = 360;
const MAP_H = 520;

const BUILDINGS: Building[] = [
  { id: "main", label: "Main Block", shortLabel: "Main", x: 130, y: 30, w: 100, h: 70, color: "#4C1D95" },
  { id: "cs", label: "CS Block", shortLabel: "CS", x: 30, y: 130, w: 80, h: 60, color: "#1E40AF" },
  { id: "ec", label: "EC Block", shortLabel: "EC", x: 250, y: 130, w: 80, h: 60, color: "#065F46" },
  { id: "me", label: "ME Block", shortLabel: "ME", x: 30, y: 250, w: 80, h: 60, color: "#92400E" },
  { id: "lib", label: "Library", shortLabel: "Lib", x: 140, y: 210, w: 80, h: 55, color: "#831843" },
  { id: "cv", label: "CV Block", shortLabel: "CV", x: 250, y: 250, w: 80, h: 60, color: "#134E4A" },
  { id: "canteen", label: "Canteen", shortLabel: "Food", x: 130, y: 370, w: 100, h: 55, color: "#7C2D12" },
  { id: "sports", label: "Sports Complex", shortLabel: "Sports", x: 30, y: 400, w: 80, h: 60, color: "#1E3A5F" },
  { id: "hostel", label: "Hostel Block", shortLabel: "Hostel", x: 250, y: 390, w: 80, h: 60, color: "#3B1F5E" },
];

const BIN_SPOTS: BinSpot[] = [
  {
    id: "B001", name: "Main Block Entrance", location: "Ground Floor, Main Block",
    binType: "both", x: 178, y: 105, qrCode: "BINGO:any:B001", isActive: true,
  },
  {
    id: "B002", name: "CS Block Corridor", location: "1st Floor, CS Block",
    binType: "can", x: 68, y: 125, qrCode: "BINGO:can:B002", isActive: true,
  },
  {
    id: "B003", name: "EC Block Lobby", location: "Ground Floor, EC Block",
    binType: "bottle", x: 292, y: 125, qrCode: "BINGO:bottle:B003", isActive: true,
  },
  {
    id: "B004", name: "ME Block Workshop", location: "Workshop Area, ME Block",
    binType: "can", x: 68, y: 245, qrCode: "BINGO:can:B004", isActive: true,
  },
  {
    id: "B005", name: "Library Reading Hall", location: "Ground Floor, Library",
    binType: "both", x: 178, y: 205, qrCode: "BINGO:any:B005", isActive: true,
  },
  {
    id: "B006", name: "CV Block Exit", location: "Ground Floor, CV Block",
    binType: "bottle", x: 292, y: 245, qrCode: "BINGO:bottle:B006", isActive: true,
  },
  {
    id: "B007", name: "Canteen Entrance", location: "Near Canteen Gate",
    binType: "both", x: 178, y: 365, qrCode: "BINGO:any:B007", isActive: true,
  },
  {
    id: "B008", name: "Sports Ground", location: "Near Sports Complex",
    binType: "can", x: 68, y: 395, qrCode: "BINGO:can:B008", isActive: false,
  },
  {
    id: "B009", name: "Hostel Common Area", location: "Block H, Hostel",
    binType: "both", x: 292, y: 390, qrCode: "BINGO:any:B009", isActive: true,
  },
];

const BIN_TYPE_COLOR: Record<string, string> = {
  can: "#43A047",
  bottle: "#1E88E5",
  both: "#6C63FF",
};

const BIN_TYPE_LABEL: Record<string, string> = {
  can: "Cans",
  bottle: "Bottles",
  both: "All",
};

function BuildingRect({ building }: { building: Building }) {
  return (
    <View
      style={[
        styles.building,
        {
          left: building.x,
          top: building.y,
          width: building.w,
          height: building.h,
          backgroundColor: building.color + "CC",
          borderColor: building.color,
        },
      ]}
    >
      <Text style={styles.buildingLabel} numberOfLines={2}>
        {building.shortLabel}
      </Text>
    </View>
  );
}

function BinPin({
  spot,
  index,
  isSelected,
  onPress,
}: {
  spot: BinSpot;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const pinColor = spot.isActive ? BIN_TYPE_COLOR[spot.binType] : "#9CA3AF";
  return (
    <TouchableOpacity
      style={[
        styles.binPin,
        {
          left: spot.x - 14,
          top: spot.y - 14,
          backgroundColor: isSelected ? "#FFFFFF" : pinColor,
          borderColor: pinColor,
          borderWidth: isSelected ? 2.5 : 1.5,
          elevation: isSelected ? 8 : 4,
          shadowOpacity: isSelected ? 0.3 : 0.15,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.pinNum, { color: isSelected ? pinColor : "#FFFFFF" }]}>
        {index + 1}
      </Text>
    </TouchableOpacity>
  );
}

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<BinSpot | null>(null);
  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;

  const handlePinPress = (spot: BinSpot) => {
    setSelected((prev) => (prev?.id === spot.id ? null : spot));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#09090B", "#1E1B4B"]}
        style={[styles.header, { paddingTop: topPad }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Campus Map</Text>
            <Text style={styles.headerSub}>
              {BIN_SPOTS.filter((b) => b.isActive).length} active recycling bins
            </Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: "rgba(108,99,255,0.3)" }]}>
            <Feather name="map-pin" size={14} color="#A78BFA" />
            <Text style={styles.headerBadgeText}>BMSCE</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { type: "can", label: "Cans" },
            { type: "bottle", label: "Bottles" },
            { type: "both", label: "All Items" },
          ].map((l) => (
            <View key={l.type} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: BIN_TYPE_COLOR[l.type] }]} />
              <Text style={styles.legendLabel}>{l.label}</Text>
            </View>
          ))}
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#9CA3AF" }]} />
            <Text style={styles.legendLabel}>Inactive</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Canvas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.mapWrapper}>
            <View style={[styles.mapCanvas, { backgroundColor: "#1A1A2E" }]}>
              {/* Roads */}
              <View style={[styles.roadH, { top: 110, backgroundColor: "#2D2D4E" }]} />
              <View style={[styles.roadH, { top: 230, backgroundColor: "#2D2D4E" }]} />
              <View style={[styles.roadH, { top: 350, backgroundColor: "#2D2D4E" }]} />
              <View style={[styles.roadV, { left: 122, backgroundColor: "#2D2D4E" }]} />
              <View style={[styles.roadV, { left: 238, backgroundColor: "#2D2D4E" }]} />

              {/* Buildings */}
              {BUILDINGS.map((b) => (
                <BuildingRect key={b.id} building={b} />
              ))}

              {/* Bin Pins */}
              {BIN_SPOTS.map((spot, idx) => (
                <BinPin
                  key={spot.id}
                  spot={spot}
                  index={idx}
                  isSelected={selected?.id === spot.id}
                  onPress={() => handlePinPress(spot)}
                />
              ))}

              {/* North indicator */}
              <View style={styles.northIndicator}>
                <Feather name="navigation" size={16} color="#FFFFFF" />
                <Text style={styles.northText}>N</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Selected Bin Detail */}
        {selected ? (
          <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.detailTop}>
              <View style={[styles.detailIconWrap, { backgroundColor: BIN_TYPE_COLOR[selected.binType] + "22" }]}>
                <Feather
                  name={selected.binType === "bottle" ? "droplet" : selected.binType === "can" ? "box" : "refresh-cw"}
                  size={24}
                  color={BIN_TYPE_COLOR[selected.binType]}
                />
              </View>
              <View style={styles.detailInfo}>
                <Text style={[styles.detailName, { color: colors.foreground }]}>
                  {selected.name}
                </Text>
                <Text style={[styles.detailLocation, { color: colors.mutedForeground }]}>
                  {selected.location}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
                <Feather name="x" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={styles.detailMeta}>
              <View style={[styles.detailTag, { backgroundColor: BIN_TYPE_COLOR[selected.binType] + "18" }]}>
                <Text style={[styles.detailTagText, { color: BIN_TYPE_COLOR[selected.binType] }]}>
                  Accepts: {BIN_TYPE_LABEL[selected.binType]}
                </Text>
              </View>
              <View style={[
                styles.detailTag,
                { backgroundColor: selected.isActive ? "#E8F5E9" : "#FEF2F2" },
              ]}>
                <Feather
                  name={selected.isActive ? "check-circle" : "x-circle"}
                  size={12}
                  color={selected.isActive ? "#43A047" : "#DC2626"}
                />
                <Text style={[
                  styles.detailTagText,
                  { color: selected.isActive ? "#43A047" : "#DC2626" },
                ]}>
                  {selected.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>

            <View style={[styles.qrRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="maximize" size={14} color={colors.mutedForeground} />
              <Text style={[styles.qrCode, { color: colors.mutedForeground }]}>
                QR: {selected.qrCode}
              </Text>
            </View>
          </View>
        ) : (
          /* Bin List */
          <View style={styles.binList}>
            <Text style={[styles.binListTitle, { color: colors.foreground }]}>
              All Recycling Bins
            </Text>
            {BIN_SPOTS.map((spot, idx) => (
              <TouchableOpacity
                key={spot.id}
                style={[
                  styles.binListRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => handlePinPress(spot)}
                activeOpacity={0.8}
              >
                <View style={[styles.binListNum, { backgroundColor: BIN_TYPE_COLOR[spot.binType] + (spot.isActive ? "FF" : "66") }]}>
                  <Text style={styles.binListNumText}>{idx + 1}</Text>
                </View>
                <View style={styles.binListInfo}>
                  <Text style={[styles.binListName, { color: spot.isActive ? colors.foreground : colors.mutedForeground }]}>
                    {spot.name}
                  </Text>
                  <Text style={[styles.binListSub, { color: colors.mutedForeground }]}>
                    {spot.location} · {BIN_TYPE_LABEL[spot.binType]}
                  </Text>
                </View>
                <Feather
                  name={spot.isActive ? "check-circle" : "x-circle"}
                  size={16}
                  color={spot.isActive ? "#43A047" : "#DC2626"}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBadgeText: {
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
    color: "#A78BFA",
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  mapWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  mapCanvas: {
    width: MAP_W,
    height: MAP_H,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
  },
  roadH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
  },
  roadV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 12,
  },
  building: {
    position: "absolute",
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  buildingLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  binPin: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  pinNum: {
    fontSize: 11,
    fontFamily: "Outfit_700Bold",
  },
  northIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    alignItems: "center",
    gap: 2,
  },
  northText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
  },
  detailCard: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  detailTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  detailInfo: { flex: 1 },
  detailName: {
    fontSize: 15,
    fontFamily: "Outfit_700Bold",
  },
  detailLocation: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    marginTop: 2,
  },
  closeBtn: { padding: 4 },
  detailMeta: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  detailTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  detailTagText: {
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
  },
  qrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  qrCode: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
  },
  binList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  binListTitle: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
    marginBottom: 4,
  },
  binListRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  binListNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  binListNumText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Outfit_700Bold",
  },
  binListInfo: { flex: 1 },
  binListName: {
    fontSize: 14,
    fontFamily: "Outfit_600SemiBold",
  },
  binListSub: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    marginTop: 2,
  },
});
