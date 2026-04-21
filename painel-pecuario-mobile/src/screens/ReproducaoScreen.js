import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "../context/DataContext";
import { calcReproStats, fmtDate, fmtTime } from "../utils/farmUtils";
import { colors, spacing, radius, shadow } from "../theme";
import { FarmSelectorCard, ScreenHeader, SummaryCard } from "../components/MobileUI";

const FARMS_ORDER = ["arapey", "chiquita", "colorado", "sarandi", "passa-da-guarda"];

export default function ReproducaoScreen({ navigation }) {
  const { data, pull, save } = useData();
  const [selectedFarm, setSelectedFarm] = useState("__ALL__");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!data) pull().catch(() => {});
  }, [data, pull]);

  const farms = useMemo(() => {
    const items = (data?.farms || []).filter((farm) => farm.id !== "__TOTAL__");
    return FARMS_ORDER.map((id) => items.find((farm) => farm.id === id)).filter(Boolean)
      .concat(items.filter((farm) => !FARMS_ORDER.includes(farm.id)));
  }, [data]);

  const activeFarm = selectedFarm === "__ALL__" ? null : farms.find((farm) => farm.id === selectedFarm);
  const records = selectedFarm === "__ALL__"
    ? farms.flatMap((farm) => (farm.reproductionRecords || []).map((record) => ({ ...record, farmName: farm.name, farmId: farm.id })))
    : (activeFarm?.reproductionRecords || []).map((record) => ({ ...record, farmName: activeFarm?.name || "", farmId: activeFarm?.id }));

  const filtered = search.trim()
    ? records.filter((record) =>
        [record.code, record.farmName, record.categoryName, record.potreiro, record.type, record.notes]
          .some((value) => String(value || "").toLowerCase().includes(search.toLowerCase())))
    : records;

  const sorted = [...filtered].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const stats = calcReproStats(records);

  useEffect(() => {
    if (selectedFarm !== "__ALL__" && !activeFarm && farms.length) {
      setSelectedFarm(farms[0].id);
    }
  }, [activeFarm, farms, selectedFarm]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await pull();
    } catch {
      // ignore
    }
    setRefreshing(false);
  };

  async function handleDelete(record) {
    Alert.alert("Excluir registro", `Deseja excluir ${record.code || "este registro"}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const next = JSON.parse(JSON.stringify(data));
          const farm = next.farms.find((item) => item.id === record.farmId);
          if (!farm) return;
          farm.reproductionRecords = (farm.reproductionRecords || []).filter((item) => item.id !== record.id);
          await save(next);
        },
      },
    ]);
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={(
          <View style={styles.listHeader}>
            <ScreenHeader
              title="Reprodução"
              actionLabel="Registrar"
              actionIcon="add"
              onAction={() => navigation.navigate("ReproducaoForm", { editRecord: null, farms, selectedFarmId: activeFarm?.id || farms[0]?.id || "" })}
              tone="primary"
            />

            <FarmSelectorCard
              title="Fazenda da Reprodução"
              value={activeFarm?.name || "Todas as fazendas"}
              helper={activeFarm ? `${activeFarm.reproductionRecords?.length || 0} registros` : `${farms.length} fazendas`}
              options={[{ value: "__ALL__", label: "Todas as fazendas" }, ...farms.map((farm) => ({ value: farm.id, label: farm.name }))]}
              selected={selectedFarm}
              onSelect={setSelectedFarm}
              tone="primary"
            />

            <View style={styles.summaryGrid}>
              <SummaryCard title="Inseminações" value={stats.totalInsem} helper="lançamentos" icon="heart" tone="primary" />
              <SummaryCard title="Entouradas" value={stats.totalEntour} helper="lançamentos" icon="ellipse" tone="accent" />
              <SummaryCard title="Prenhas" value={stats.totalPrenha} helper="confirmadas" icon="checkmark-circle" tone="blue" />
              <SummaryCard title="Taxa" value={`${stats.taxa}%`} helper="índice atual" icon="analytics" tone="danger" />
            </View>

            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={colors.textLight} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar código, fazenda, categoria, potreiro..."
                placeholderTextColor={colors.textLight}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={18} color={colors.textLight} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <ReproCard
            record={item}
            onEdit={() => navigation.navigate("ReproducaoForm", { editRecord: item, farms, selectedFarmId: item.farmId })}
            onRegisterResult={() => navigation.navigate("ReproducaoForm", {
              editRecord: item,
              farms,
              selectedFarmId: item.farmId,
              mode: "verification",
            })}
            onDelete={() => handleDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<EmptyState search={search} />}
      />
    </SafeAreaView>
  );
}

function ReproCard({ record, onEdit, onRegisterResult, onDelete }) {
  const isPrenha = record.verificationDate && (record.quantityPegou || 0) > 0;
  const isFalhada = record.verificationDate && (record.quantityPegou || 0) === 0;
  const isAguardando = !record.verificationDate;
  const statusColor = isAguardando ? colors.accent : isPrenha ? colors.primary : colors.danger;
  const statusLabel = isAguardando ? "Aguardando" : isPrenha ? "Prenha" : "Falhada";
  const typeLabel = record.type === "inseminacao" ? "Inseminação" : "Entourada";
  const typeColor = record.type === "inseminacao" ? colors.primary : colors.accent;
  const taxa = record.verificationDate && record.quantity > 0
    ? `${(((Number(record.quantityPegou || 0) / Number(record.quantity || 1)) * 100)).toFixed(1)}%`
    : "-";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardCode}>{record.code || "-"}</Text>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColor}22` }]}>
            <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCell label="Fazenda" value={record.farmName} />
        <MetricCell label="Data evento" value={`${fmtDate(record.date)} ${fmtTime(record.time)}`} />
        <MetricCell label="Categoria" value={record.categoryName || "-"} />
        <MetricCell label="Qtd." value={String(record.quantity || 0)} strong />
        <MetricCell label="Potreiro" value={record.potreiro || "-"} />
        <MetricCell label="Data verif." value={record.verificationDate ? `${fmtDate(record.verificationDate)} ${fmtTime(record.verificationTime)}` : "-"} />
        <MetricCell label="Prenha" value={record.quantityPegou != null ? String(record.quantityPegou) : "-"} positive />
        <MetricCell label="Falhada" value={record.quantityFalhou != null ? String(record.quantityFalhou) : "-"} negative />
        <MetricCell label="% Prenhez" value={taxa} strong />
      </View>

      {record.notes ? (
        <View style={styles.notesBand}>
          <Ionicons name="document-text-outline" size={14} color={colors.textLight} />
          <Text style={styles.notesText} numberOfLines={2}>{record.notes}</Text>
        </View>
      ) : null}

      {record.verificationNotes ? (
        <View style={styles.notesBand}>
          <Ionicons name="checkmark-circle-outline" size={14} color={colors.primary} />
          <Text style={styles.notesText} numberOfLines={2}>{record.verificationNotes}</Text>
        </View>
      ) : null}

      {!record.verificationDate ? (
        <View style={styles.pendingInline}>
          <Text style={styles.pendingInlineText}>Diagnóstico pendente para este evento</Text>
        </View>
      ) : null}

      <View style={styles.cardActions}>
        {!record.verificationDate ? (
          <TouchableOpacity style={[styles.actionBtn, styles.actionWarn]} onPress={onRegisterResult}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.accent }]}>Registrar</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionDelete]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MetricCell({ label, value, positive, negative, strong }) {
  const tone = positive ? colors.primary : negative ? colors.danger : colors.text;
  return (
    <View style={styles.metricCell}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: tone }, strong && styles.metricValueStrong]}>{value}</Text>
    </View>
  );
}

function EmptyState({ search }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="heart-circle-outline" size={48} color={colors.textLight} />
      <Text style={styles.emptyTitle}>{search ? "Nenhum registro encontrado" : "Nenhum registro de reprodução"}</Text>
      <Text style={styles.emptyText}>{search ? "Tente outros termos." : "Toque em Registrar para adicionar o primeiro manejo."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  listHeader: { gap: spacing.md, marginBottom: spacing.md },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, ...shadow.sm },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  cardCode: { fontSize: 12, color: colors.textLight, fontWeight: "700" },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  typeBadgeText: { fontSize: 11, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  statusText: { fontSize: 12, fontWeight: "700" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  metricCell: {
    width: "30.5%",
    minHeight: 64,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: { fontSize: 10, fontWeight: "700", color: colors.textLight, textTransform: "uppercase", letterSpacing: 0.5 },
  metricValue: { fontSize: 13, color: colors.text, marginTop: 6 },
  metricValueStrong: { fontWeight: "800", fontSize: 15 },
  notesBand: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  notesText: { flex: 1, fontSize: 12, color: colors.textSecondary },
  pendingInline: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.accentFaded,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pendingInlineText: { color: colors.accent, fontWeight: "700", fontSize: 12 },
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryFaded,
  },
  actionWarn: { backgroundColor: colors.accentFaded },
  actionDelete: { backgroundColor: colors.dangerFaded },
  actionText: { fontSize: 13, fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.textSecondary },
  emptyText: { fontSize: 13, color: colors.textLight, textAlign: "center", maxWidth: 280 },
});
