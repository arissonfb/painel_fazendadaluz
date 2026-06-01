import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { fmtDate } from "../utils/farmUtils";
import { colors, spacing, radius, shadow } from "../theme";
import { deleteMovementFromData, formatMovementTypeLabel, getMovementSummary, MOVEMENT_TYPES } from "../utils/livestock";
import { FarmSelectorCard, ScreenHeader, SummaryCard } from "../components/MobileUI";

const FARMS_ORDER = ["arapey", "chiquita", "colorado", "sarandi", "passa-da-guarda"];

export default function MovimentacoesScreen({ navigation }) {
  const { data, pull, save } = useData();
  const [selectedFarm, setSelectedFarm] = useState("__ALL__");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!data) pull().catch(() => {});
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

  const farms = useMemo(() => {
    const items = (data?.farms || []).filter((farm) => farm.id !== "__TOTAL__");
    return FARMS_ORDER.map((id) => items.find((farm) => farm.id === id)).filter(Boolean)
      .concat(items.filter((farm) => !FARMS_ORDER.includes(farm.id)));
  }, [data]);

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const activeFarm = selectedFarm === "__ALL__" ? null : farms.find((farm) => farm.id === selectedFarm);
  const records = selectedFarm === "__ALL__"
    ? farms.flatMap((farm) => (farm.movements || []).map((record) => ({ ...record, farmName: farm.name, farmId: farm.id })))
    : (activeFarm?.movements || []).map((record) => ({ ...record, farmName: activeFarm?.name || "", farmId: activeFarm?.id }));

  const filtered = search.trim()
    ? records.filter((record) =>
        [
          record.code,
          record.farmName,
          record.type,
          record.categoryName,
          record.notes,
          record.purchaseDetails?.origin,
          record.saleDetails?.buyer,
        ].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase())))
    : records;

  const sorted = [...filtered].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const summary = getMovementSummary(records);
  const selectorOptions = [{ value: "__ALL__", label: "Todas as fazendas" }, ...farms.map((farm) => ({ value: farm.id, label: farm.name }))];

  async function handleDelete(record) {
    Alert.alert(
      "Excluir registro",
      `Deseja excluir ${formatMovementTypeLabel(record.type).toLowerCase()} ${record.code || ""}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const next = JSON.parse(JSON.stringify(data));
            deleteMovementFromData(next, record);
            await save(next);
          },
        },
      ],
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
              title="Movimentações"
              actionLabel="Registrar"
              actionIcon="add"
              onAction={() => navigation.navigate("MovimentacaoForm", { editRecord: null, farms, selectedFarmId: activeFarm?.id || farms[0]?.id || "" })}
              tone="accent"
            />

            <FarmSelectorCard
              title="Movimentações da Fazenda"
              value={activeFarm?.name || "Todas as fazendas"}
              helper={activeFarm ? `${activeFarm.movements?.length || 0} registros` : `${farms.length} fazendas`}
              options={selectorOptions}
              selected={selectedFarm}
              onSelect={setSelectedFarm}
              tone="accent"
            />

            <View style={styles.summaryGrid}>
              <View style={styles.summaryCol}>
                <SummaryCard title="Compras" value={summary.compra} helper="entradas" icon="arrow-down-circle" tone="primary" />
              </View>
              <View style={styles.summaryCol}>
                <SummaryCard title="Vendas" value={summary.venda} helper="saídas" icon="arrow-up-circle" tone="danger" />
              </View>
              <View style={styles.summaryCol}>
                <SummaryCard title="Nascimentos" value={summary.nascimento} helper="novos animais" icon="heart" tone="accent" />
              </View>
              <View style={styles.summaryCol}>
                <SummaryCard title="Saldo líquido" value={summary.saldo} helper="impacto no estoque" icon="analytics" tone="blue" />
              </View>
            </View>

            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={colors.textLight} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar código, fazenda, categoria, origem..."
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
          <MovementCard
            record={item}
            onEdit={() => navigation.navigate("MovimentacaoForm", { editRecord: item, farms, selectedFarmId: item.farmId })}
            onDelete={() => handleDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<EmptyState search={search} />}
      />
    </SafeAreaView>
  );
}

function MovementCard({ record, onEdit, onDelete }) {
  const meta = MOVEMENT_TYPES.find((item) => item.value === record.type);
  const accent = meta?.accent || colors.textSecondary;
  const attachments = Array.isArray(record.attachments) ? record.attachments.length : 0;
  const detail = record.type === "compra"
    ? record.purchaseDetails?.origin
    : record.type === "venda"
      ? record.saleDetails?.buyer
      : record.notes;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
          <Ionicons name={record.type === "venda" ? "trending-up" : record.type === "compra" ? "trending-down" : "swap-horizontal"} size={20} color={accent} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardCode}>{record.code || "-"}</Text>
          <Text style={styles.cardTitle}>{formatMovementTypeLabel(record.type)}</Text>
          <Text style={styles.cardFarm}>{record.farmName}</Text>
        </View>
        <View style={styles.qtyWrap}>
          <Text style={[styles.cardQty, { color: accent }]}>{record.type === "compra" || record.type === "nascimento" ? "+" : ""}{record.quantity || 0}</Text>
          <Text style={styles.cardDate}>{fmtDate(record.date)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <InfoPill icon="layers-outline" text={record.categoryName || "Sem categoria"} />
        {record.potreiroName || record.potreiro ? <InfoPill icon="map-outline" text={record.potreiroName || record.potreiro} /> : null}
        {detail ? <InfoPill icon="document-text-outline" text={detail} /> : null}
        {attachments ? <InfoPill icon="attach-outline" text={`${attachments} anexo(s)`} /> : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoPill({ icon, text }) {
  return (
    <View style={styles.infoPill}>
      <Ionicons name={icon} size={13} color={colors.textLight} />
      <Text style={styles.infoPillText}>{text}</Text>
    </View>
  );
}

function EmptyState({ search }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="swap-horizontal-outline" size={48} color={colors.textLight} />
      <Text style={styles.emptyTitle}>{search ? "Nenhuma movimentação encontrada" : "Nenhuma movimentação registrada"}</Text>
      <Text style={styles.emptyText}>{search ? "Tente outros termos." : "Use o botão Registrar para lançar compras, vendas, nascimentos, mortes e ajustes."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  listHeader: { gap: spacing.md, marginBottom: spacing.md },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  summaryCol: { width: "48.5%" },
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
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconWrap: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  cardHeaderText: { flex: 1 },
  cardCode: { fontSize: 12, color: colors.textLight, fontWeight: "700" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  cardFarm: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  qtyWrap: { alignItems: "flex-end" },
  cardQty: { fontSize: 22, fontWeight: "800" },
  cardDate: { fontSize: 11, color: colors.textLight },
  cardBody: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoPillText: { fontSize: 12, color: colors.textSecondary, maxWidth: 240 },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryFaded,
  },
  deleteBtn: { backgroundColor: colors.dangerFaded },
  actionText: { fontSize: 13, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.textSecondary },
  emptyText: { fontSize: 13, color: colors.textLight, textAlign: "center", maxWidth: 280 },
});
