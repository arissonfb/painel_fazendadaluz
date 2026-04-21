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
    try {
      await pull();
    } catch {
      // ignore
    }
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
        <View style={styles.heroCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Ola, {user?.username}</Text>
            <Text style={styles.headerSub}>{lastSync ? `Atualizado ${fmtDate(lastSync.toISOString())}` : "Fazendas Da Luz"}</Text>
            <Text style={styles.heroTitle}>{currentFarmName}</Text>
            <Text style={styles.heroText}>Visao premium do manejo com reproducao, sanitario, movimentacao e relatorios.</Text>
          </View>
          <View style={[styles.syncChip, syncing && styles.syncChipActive]}>
            <Ionicons name={syncing ? "sync" : "cloud-done-outline"} size={14} color={syncing ? colors.accent : colors.primary} />
            <Text style={[styles.syncLabel, syncing && { color: colors.accent }]}>{syncing ? "Sync..." : "Online"}</Text>
          </View>
        </View>

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

        <View style={styles.quickRibbon}>
          <QuickRibbonItem icon="sparkles" label="Inicio" helper="Painel geral" />
          <QuickRibbonItem icon="heart-circle" label="Reproducao" helper={`${repStats.aguardando} pendentes`} />
          <QuickRibbonItem icon="medkit" label="Sanitario" helper={`${totalSanitary} manejos`} />
          <QuickRibbonItem icon="swap-horizontal" label="Movimentacao" helper={`${totalMovements} registros`} />
          <QuickRibbonItem icon="person-circle" label="Perfil" helper="Relatorios e sync" />
        </View>

        <View style={styles.kpiRow}>
          <KpiCard icon="paw" iconColor={colors.primary} iconBg={colors.primaryFaded} label="Estoque total" value={totalAnimals.toLocaleString("pt-BR")} unit="animais" />
          <KpiCard icon="heart-circle" iconColor={colors.accent} iconBg={colors.accentFaded} label="Taxa de prenhez" value={`${repStats.taxa}%`} unit="reproducao" />
        </View>

        <SectionTitle title="Reproducao" onPress={() => navigation.navigate("Reproducao")} />
        <View style={styles.kpiGrid}>
          <SmallKpi label="Inseminacoes" value={repStats.totalInsem} color={colors.blue} />
          <SmallKpi label="Entouradas" value={repStats.totalEntour} color={colors.accent} />
          <SmallKpi label="Prenhas" value={repStats.totalPrenha} color={colors.primary} />
          <SmallKpi label="Falhadas" value={repStats.totalFalhada} color={colors.danger} />
          <SmallKpi label="Aguardando" value={repStats.aguardando} color={colors.textSecondary} />
          <SmallKpi label="Taxa" value={`${repStats.taxa}%`} color={colors.primary} isHighlight />
        </View>

        <SectionTitle title="Operacao diaria" />
        <View style={styles.moduleGrid}>
          <ModuleCard title="Reproducao" subtitle={`${repStats.totalPrenha} prenhas | ${repStats.aguardando} aguardando`} icon="heart-circle" color={colors.primary} onPress={() => navigation.navigate("Reproducao")} />
          <ModuleCard title="Sanitario" subtitle={`${totalSanitary} registros | ${activeFarms.reduce((acc, farm) => acc + (farm.sanitaryProducts?.length || 0), 0)} produtos`} icon="medkit" color={colors.blue} onPress={() => navigation.navigate("Sanitario")} />
          <ModuleCard title="Movimentacoes" subtitle={`Saldo ${movementSummary.saldo} | ${movementSummary.venda} vendas`} icon="swap-horizontal" color={colors.accent} onPress={() => navigation.navigate("Movimentacoes")} />
          <ModuleCard title="Perfil e relatorios" subtitle="Sincronizacao, PDF e administracao" icon="person-circle" color={colors.danger} onPress={() => navigation.navigate("Perfil")} />
        </View>

        {isTotal ? (
          <>
            <SectionTitle title="Estoque por fazenda" />
            <View style={styles.farmsList}>
              {sortedFarms.map((farm) => {
                const stock = calcStockTotal(farm);
                const stats = calcReproStats(farm.reproductionRecords || []);
                return (
                  <TouchableOpacity key={farm.id} style={styles.farmCard} onPress={() => setSelectedFarm(farm.id)} activeOpacity={0.85}>
                    <View style={styles.farmCardLeft}>
                      <View style={styles.farmDot} />
                      <View>
                        <Text style={styles.farmCardName}>{farm.name}</Text>
                        <Text style={styles.farmCardCurrency}>{farm.currency || "Rebanho ativo"}</Text>
                      </View>
                    </View>
                    <View style={styles.farmCardRight}>
                      <Text style={styles.farmCardStock}>{stock.toLocaleString("pt-BR")}</Text>
                      <Text style={styles.farmCardUnit}>animais</Text>
                    </View>
                    <View style={styles.farmCardRepro}>
                      <Text style={styles.farmCardTaxa}>{stats.taxa}%</Text>
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
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.sectionLink}>Ver tudo</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function KpiCard({ icon, iconColor, iconBg, label, value, unit, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.kpiCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.kpiIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      {unit ? <Text style={styles.kpiUnit}>{unit}</Text> : null}
    </Wrapper>
  );
}

function SmallKpi({ label, value, color, isHighlight }) {
  return (
    <View style={[styles.smallKpi, isHighlight && { backgroundColor: colors.primaryFaded }]}>
      <Text style={[styles.smallKpiValue, { color }]}>{value}</Text>
      <Text style={styles.smallKpiLabel}>{label}</Text>
    </View>
  );
}

function ModuleCard({ title, subtitle, icon, color, onPress }) {
  return (
    <TouchableOpacity style={styles.moduleCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.moduleIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.moduleTitle}>{title}</Text>
      <Text style={styles.moduleSubtitle}>{subtitle}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textLight} style={{ marginTop: spacing.sm }} />
    </TouchableOpacity>
  );
}

function QuickRibbonItem({ icon, label, helper }) {
  return (
    <View style={styles.ribbonItem}>
      <View style={styles.ribbonIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={styles.ribbonLabel}>{label}</Text>
      <Text style={styles.ribbonHelper}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 112 },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.md,
    marginBottom: spacing.md,
  },
  greeting: { fontSize: 20, fontWeight: "800", color: colors.text },
  headerSub: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  heroTitle: { fontSize: 24, fontWeight: "800", color: colors.primary, marginTop: spacing.sm },
  heroText: { fontSize: 13, color: colors.textSecondary, marginTop: 6, lineHeight: 18, maxWidth: "90%" },
  syncChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.primaryFaded,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    marginTop: spacing.md,
  },
  syncChipActive: { backgroundColor: colors.accentFaded },
  syncLabel: { fontSize: 11, fontWeight: "700", color: colors.primary },
  tabsScroll: { marginBottom: spacing.md },
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
  quickRibbon: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  ribbonItem: {
    width: "30.5%",
    minHeight: 88,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  ribbonIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryFaded,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  ribbonLabel: { fontSize: 12, fontWeight: "800", color: colors.text },
  ribbonHelper: { fontSize: 10, color: colors.textSecondary, marginTop: 4, lineHeight: 14 },
  kpiRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
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
  kpiValue: { fontSize: 24, fontWeight: "800", color: colors.text },
  kpiLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginTop: 2 },
  kpiUnit: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: colors.text },
  sectionLink: { fontSize: 13, color: colors.primary, fontWeight: "700" },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
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
  moduleGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  moduleCard: {
    width: "48.5%",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  moduleIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  moduleTitle: { fontSize: 15, fontWeight: "800", color: colors.text },
  moduleSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 6, lineHeight: 17 },
  farmsList: { gap: spacing.sm, marginBottom: spacing.md },
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
  farmCardLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  farmDot: { width: 4, height: 22, borderRadius: 2, backgroundColor: colors.primary },
  farmCardName: { fontSize: 14, fontWeight: "800", color: colors.text },
  farmCardCurrency: { fontSize: 11, color: colors.textLight },
  farmCardRight: { alignItems: "flex-end", marginRight: spacing.sm },
  farmCardRepro: { alignItems: "flex-end", marginRight: spacing.xs },
  farmCardStock: { fontSize: 16, fontWeight: "800", color: colors.text },
  farmCardTaxa: { fontSize: 16, fontWeight: "800", color: colors.primary },
  farmCardUnit: { fontSize: 10, color: colors.textLight },
});
