import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { RecyclingSession } from "@/context/AuthContext";

const WEEKS = 14;
const DAYS = 7;
const CELL = 16;
const GAP = 3;

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getColor(count: number, primaryColor: string): string {
  if (count === 0) return "#E4E4E7";
  if (count === 1) return "#C4B5FD";
  if (count <= 3) return "#A78BFA";
  if (count <= 6) return "#7C3AED";
  return primaryColor;
}

interface RecyclingHeatmapProps {
  sessions: RecyclingSession[];
}

export function RecyclingHeatmap({ sessions }: RecyclingHeatmapProps) {
  const colors = useColors();

  const { grid, months } = useMemo(() => {
    const sessionMap: Record<string, number> = {};
    for (const s of sessions) {
      const key = s.timestamp.split("T")[0];
      sessionMap[key] = (sessionMap[key] ?? 0) + 1;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = WEEKS * DAYS;

    const gridData: Array<{ key: string; count: number; date: Date }> = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = getDateKey(d);
      gridData.push({ key, count: sessionMap[key] ?? 0, date: new Date(d) });
    }

    const monthLabels: Array<{ label: string; colIndex: number }> = [];
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      const cell = gridData[w * DAYS];
      if (cell) {
        const m = cell.date.getMonth();
        if (m !== lastMonth) {
          monthLabels.push({
            label: cell.date.toLocaleDateString("en-IN", { month: "short" }),
            colIndex: w,
          });
          lastMonth = m;
        }
      }
    }

    const cols: Array<Array<{ key: string; count: number }>> = [];
    for (let w = 0; w < WEEKS; w++) {
      cols.push(gridData.slice(w * DAYS, w * DAYS + DAYS));
    }

    return { grid: cols, months: monthLabels };
  }, [sessions]);

  const totalRecycled = sessions.length;
  const activeDays = useMemo(() => {
    const keys = new Set(sessions.map((s) => s.timestamp.split("T")[0]));
    return keys.size;
  }, [sessions]);

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Recycling Activity</Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {activeDays} active day{activeDays !== 1 ? "s" : ""}
          </Text>
          <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>·</Text>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {totalRecycled} session{totalRecycled !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <View style={styles.chartArea}>
        <View style={styles.dayLabels}>
          {DAY_LABELS.map((d, i) => (
            <Text key={i} style={[styles.dayLabel, { color: colors.mutedForeground }]}>{d}</Text>
          ))}
        </View>

        <View style={styles.gridScroll}>
          <View style={styles.monthRow}>
            {months.map((m) => (
              <View
                key={`${m.label}-${m.colIndex}`}
                style={[styles.monthLabel, { left: m.colIndex * (CELL + GAP) }]}
              >
                <Text style={[styles.monthText, { color: colors.mutedForeground }]}>{m.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {grid.map((col, wi) => (
              <View key={wi} style={styles.col}>
                {col.map((cell) => (
                  <View
                    key={cell.key}
                    style={[
                      styles.cell,
                      { backgroundColor: getColor(cell.count, colors.primary) },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>Less</Text>
        {[0, 1, 2, 4, 7].map((n) => (
          <View
            key={n}
            style={[styles.legendCell, { backgroundColor: getColor(n, colors.primary) }]}
          />
        ))}
        <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: { fontSize: 16, fontFamily: "Outfit_700Bold" },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Outfit_400Regular" },
  metaDot: { fontSize: 12 },
  chartArea: { flexDirection: "row", alignItems: "flex-start" },
  dayLabels: { marginRight: 4, paddingTop: 18 },
  dayLabel: {
    fontSize: 9,
    fontFamily: "Outfit_500Medium",
    height: CELL + GAP,
    lineHeight: CELL,
    textAlign: "right",
    width: 10,
  },
  gridScroll: { flex: 1, overflow: "hidden" },
  monthRow: { height: 16, position: "relative", marginBottom: 2 },
  monthLabel: { position: "absolute" },
  monthText: { fontSize: 9, fontFamily: "Outfit_500Medium" },
  grid: { flexDirection: "row", gap: GAP },
  col: { gap: GAP },
  cell: { width: CELL, height: CELL, borderRadius: 3 },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
    marginTop: 10,
  },
  legendCell: { width: 11, height: 11, borderRadius: 2 },
  legendLabel: { fontSize: 10, fontFamily: "Outfit_400Regular", marginHorizontal: 2 },
});
