import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { calcReproStats, calcStockTotal, fmtDate } from "../utils/farmUtils";
import { colors, spacing, radius, typography, shadow } from "../theme";
import { getMovementSummary } from "../utils/livestock";

const FARMS_ORDER = ["arapey", "chiquita", "colorado", "sarandi", "passa-da-guarda"];

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { data, syncing, lastSync, pull, TOTAL_ID } = useData();
  const [selectedFarm, setSelectedFarm] = useState(TOTAL_ID);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    if (!data) {
      setInitialLoading(true);
      pull().catch(() => {}).finally(() => setInitialLoading(false));
    }
  }, [data, pull]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await pull(); } catch { }
    setRefreshing(false);
  }, [pull]);

  if (initialLoading || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.bodySmall, { marginTop: spacing.md }]}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const farms = (data.farms || []).filter((farm) => farm && farm.id !== TOTAL_ID);
  const sortedFarms = FARMS_ORDER
    .map((id) => farms.find((farm) => farm.id === id))
    .filter(Boolean)
    .concat(farms.filter((farm) => !FARMS_ORDER.includes(farm.id)));

  const isTotal = selectedFarm === TOTAL_ID;
  const activeFarms = isTotal ? sortedFarms : sortedFarms.filter((farm) => farm.id === selectedFarm);
  const repRecords = activeFarms.flatMap((farm) => farm.reproductionRecords || []);
  const repStats = calcReproStats(repRecords);
  const totalAnimals = activeFarms.reduce((sum, farm) => sum + calcStockTotal(farm), 0);
  const totalSanitary = activeFarms.reduce((sum, farm) => sum + (farm.sanitaryRecords || []).length, 0);
  const totalMovements = activeFarms.reduce((sum, farm) => sum + (farm.movements || []).length, 0);
  const movementSummary = getMovementSummary(activeFarms.flatMap((farm) => farm.movements || []));
  const currentFarmName = isTotal ? "Todas as fazendas" : (activeFarms[0]?.name || selectedFarm);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        {/* ── HERO BRANDING ───────────────────────────────────── */}
        <View style={styles.brandHero}>
          <View style={styles.brandTopRow}>
            <View>
              <Text style={styles.brandEyebrow}>PAINEL PECUÁRIO</Text>
              <Text style={styles.brandName}>Fazendas Da Luz</Text>
            </View>
            <View style={[styles.syncBadge, syncing && styles.syncBadgeActive]}>
              <Ionicons name={syncing ? "sync" : "cloud-done-outline"} size={12} color={syncing ? colors.accent : "#a8c4b0"} />
              <Text style={[styles.syncBadgeText, syncing && { color: colors.accent }]}>{syncing ? "Sync..." : "Online"}</Text>
            </View>
          </View>

          <Text style={styles.heroGreeting}>Olá, {user?.username}</Text>
          <Text style={styles.heroNumber}>{totalAnimals.toLocaleString("pt-BR")}</Text>
          <Text style={styles.heroSub}>
            animais em estoque · {currentFarmName}
          </Text>

          <View style={styles.heroStrip}>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{repStats.taxa}%</Text>
              <Text style={styles.heroMetricLabel}>Prenhez</Text>
            </View>
            <View style={styles.heroStripDiv} />
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{totalSanitary}</Text>
              <Text style={styles.heroMetricLabel}>Sanitário</Text>
            </View>
            <View style={styles.heroStripDiv} />
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{totalMovements}</Text>
              <Text style={styles.heroMetricLabel}>Movimentos</Text>
            </View>
            <View style={styles.heroStripDiv} />
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{repStats.aguardando}</Text>
              <Text style={styles.heroMetricLabel}>Pendentes</Text>
            </View>
          </View>
        </View>

        {/* ── SELETOR DE FAZENDA ─────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, isTotal && styles.tabActive]} onPress={() => setSelectedFarm(TOTAL_ID)}>
              <Text style={[styles.tabText, isTotal && styles.tabTextActive]}>Total</Text>
            </TouchableOpacity>
            {sortedFarms.map((farm) => {
              const active = selectedFarm === farm.id;
              return (
                <TouchableOpacity key={farm.id} style={[styles.tab, active && styles.tabActive]} onPress={() => setSelectedFarm(farm.id)}>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{farm.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* ── KPIs PRINCIPAIS ────────────────────────────────── */}
        <View style={styles.kpiRow}>
          <KpiCard
            icon="paw"
            iconColor={colors.primary}
            iconBg={colors.primaryFaded}
            label="Estoque total"
            value={totalAnimals.toLocaleString("pt-BR")}
            unit="animais"
          />
          <KpiCard
            icon="heart-circle"
            iconColor={colors.accent}
            iconBg={colors.accentFaded}
            label="Taxa de prenhez"
            value={`${repStats.taxa}%`}
            unit="reprodução"
          />
        </View>

        {/* ── REPRODUÇÃO ─────────────────────────────────────── */}
        <SectionTitle title="Reprodução" onPress={() => navigation.navigate("Reproducao")} />
        <View style={styles.kpiGrid}>
          <SmallKpi label="Inseminações" value={repStats.totalInsem} color={colors.blue} icon="flask" />
          <SmallKpi label="Entouradas" value={repStats.totalEntour} color={colors.accent} icon="paw" />
          <SmallKpi label="Prenhas" value={repStats.totalPrenha} color={colors.primary} icon="checkmark-circle" />
          <SmallKpi label="Falhadas" value={repStats.totalFalhada} color={colors.danger} icon="close-circle" />
          <SmallKpi label="Aguardando" value={repStats.aguardando} color={colors.textSecondary} icon="time" />
          <SmallKpi label="Taxa" value={`${repStats.taxa}%`} color={colors.primary} icon="analytics" isHighlight />
        </View>

        {/* ── MÓDULOS ────────────────────────────────────────── */}
        <SectionTitle title="Operação diária" />
        <View style={styles.moduleGrid}>
          <ModuleCard
            title="Reprodução"
            subtitle={`${repStats.totalPrenha} prenhas · ${repStats.aguardando} aguardando`}
            icon="heart-circle"
            color={colors.primary}
            onPress={() => navigation.navigate("Reproducao")}
          />
          <ModuleCard
            title="Sanitário"
            subtitle={`${totalSanitary} registros · ${activeFarms.reduce((acc, farm) => acc + (farm.sanitaryProducts?.length || 0), 0)} produtos`}
            icon="medkit"
            color={colors.blue}
            onPress={() => navigation.navigate("Sanitario")}
          />
          <ModuleCard
            title="Movimentações"
            subtitle={`Saldo ${movementSummary.saldo > 0 ? "+" : ""}${movementSummary.saldo} · ${movementSummary.venda} vendas`}
            icon="swap-horizontal"
            color={colors.accent}
            onPress={() => navigation.navigate("Movimentacoes")}
          />
          <ModuleCard
            title="Perfil e relatórios"
            subtitle="Sincronização, PDF e administração"
            icon="person-circle"
            color={colors.danger}
            onPress={() => navigation.navigate("Perfil")}
          />
        </View>

        {/* ── ESTOQUE POR FAZENDA ────────────────────────────── */}
        {isTotal ? (
          <>
            <SectionTitle title="Estoque por fazenda" />
            <View style={styles.farmsList}>
              {sortedFarms.map((farm) => {
                const stock = calcStockTotal(farm);
                const stats = calcReproStats(farm.reproductionRecords || []);
                return (
                  <TouchableOpacity key={farm.id} style={styles.farmCard} onPress={() => setSelectedFarm(farm.id)} activeOpacity={0.85}>
                    <View style={styles.farmDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.farmCardName}>{farm.name}</Text>
                      <Text style={styles.farmCardSub}>{farm.currency || "Rebanho ativo"}</Text>
                    </View>
                    <View style={styles.farmCardStat}>
                      <Text style={styles.farmCardNumber}>{stock.toLocaleString("pt-BR")}</Text>
                      <Text style={styles.farmCardUnit}>animais</Text>
                    </View>
                    <View style={styles.farmCardStat}>
                      <Text style={[styles.farmCardNumber, { color: colors.accent }]}>{stats.taxa}%</Text>
                      <Text style={styles.farmCardUnit}>prenhez</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title, onPress }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress} style={{ marginLeft: "auto" }}>
          <Text style={styles.sectionLink}>Ver tudo</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function KpiCard({ icon, iconColor, iconBg, label, value, unit }) {
  return (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      {unit ? <Text style={styles.kpiUnit}>{unit}</Text> : null}
    </View>
  );
}

function SmallKpi({ label, value, color, icon, isHighlight }) {
  return (
    <View style={[styles.smallKpi, isHighlight && { backgroundColor: colors.primaryFaded }]}>
      <Ionicons name={icon} size={16} color={color} style={{ marginBottom: 4 }} />
      <Text style={[styles.smallKpiValue, { color }]}>{value}</Text>
      <Text style={styles.smallKpiLabel}>{label}</Text>
    </View>
  );
}

function ModuleCard({ title, subtitle, icon, color, onPress }) {
  return (
    <TouchableOpacity style={styles.moduleCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.moduleAccentBar, { backgroundColor: color }]} />
      <View style={[styles.moduleIconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.moduleTitle}>{title}</Text>
      <Text style={styles.moduleSubtitle}>{subtitle}</Text>
      <View style={styles.moduleFooter}>
        <Text style={[styles.moduleAction, { color }]}>Acessar</Text>
        <Ionicons name="arrow-forward" size={14} color={color} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 120 },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },

  // ── BRAND HERO ──────────────────────────────────────────────
  brandHero: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    marginBottom: spacing.md,
  },
  brandTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  brandEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.accent,
    letterSpacing: 2,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 2,
    letterSpacing: -0.3,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  syncBadgeActive: { backgroundColor: "rgba(201,140,79,0.15)" },
  syncBadgeText: { fontSize: 11, fontWeight: "600", color: "#a8c4b0" },
  heroGreeting: { fontSize: 13, color: "#a8c4b0", marginBottom: 4 },
  heroNumber: {
    fontSize: 56,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -2,
    lineHeight: 60,
  },
  heroSub: { fontSize: 13, color: "#a8c4b0", marginBottom: spacing.md },
  heroStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  heroMetric: { flex: 1, alignItems: "center" },
  heroMetricValue: { fontSize: 18, fontWeight: "800", color: "#ffffff" },
  heroMetricLabel: { fontSize: 10, color: "#a8c4b0", marginTop: 2, fontWeight: "600" },
  heroStripDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.12)", marginVertical: 4 },

  // ── FARM TABS ───────────────────────────────────────────────
  tabsScroll: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  tabs: { flexDirection: "row", gap: spacing.sm, paddingRight: spacing.md },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
  tabTextActive: { color: colors.textInverse },

  // ── KPI ROW ─────────────────────────────────────────────────
  kpiRow: { flexDirection: "row", gap: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.md },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  kpiIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  kpiValue: { fontSize: 26, fontWeight: "800", color: colors.text },
  kpiLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginTop: 2 },
  kpiUnit: { fontSize: 11, color: colors.textLight, marginTop: 1 },

  // ── SECTION TITLE ───────────────────────────────────────────
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: colors.accent },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: colors.text },
  sectionLink: { fontSize: 13, color: colors.primary, fontWeight: "700" },

  // ── KPI GRID (reprodução) ───────────────────────────────────
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  smallKpi: {
    width: "30.5%",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  smallKpiValue: { fontSize: 20, fontWeight: "800" },
  smallKpiLabel: { fontSize: 10, fontWeight: "700", color: colors.textLight, marginTop: 2, textAlign: "center" },

  // ── MODULE CARDS ────────────────────────────────────────────
  moduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  moduleCard: {
    width: "48.5%",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  moduleAccentBar: { height: 4, width: "100%" },
  moduleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  moduleTitle: { fontSize: 15, fontWeight: "800", color: colors.text, paddingHorizontal: spacing.md },
  moduleSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 17, paddingHorizontal: spacing.md },
  moduleFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  moduleAction: { fontSize: 12, fontWeight: "700" },

  // ── FARM CARDS ──────────────────────────────────────────────
  farmsList: { gap: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.md },
  farmCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  farmDot: { width: 4, height: 22, borderRadius: 2, backgroundColor: colors.primary },
  farmCardName: { fontSize: 14, fontWeight: "800", color: colors.text },
  farmCardSub: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  farmCardStat: { alignItems: "flex-end", marginRight: spacing.xs },
  farmCardNumber: { fontSize: 16, fontWeight: "800", color: colors.text },
  farmCardUnit: { fontSize: 10, color: colors.textLight },
});
