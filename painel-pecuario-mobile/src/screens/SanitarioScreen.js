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
import { FarmSelectorCard, ScreenHeader, SummaryCard } from "../components/MobileUI";

const FARMS_ORDER = ["arapey", "chiquita", "colorado", "sarandi", "passa-da-guarda"];

export default function SanitarioScreen({ navigation }) {
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
    ? farms.flatMap((farm) => (farm.sanitaryRecords || []).map((record) => ({ ...record, farmName: farm.name, farmId: farm.id })))
    : (activeFarm?.sanitaryRecords || []).map((record) => ({ ...record, farmName: activeFarm?.name || "", farmId: activeFarm?.id }));

  const filtered = search.trim()
    ? records.filter((record) =>
        [record.code, record.name, record.product, record.categoryName, record.potreiro, record.farmName]
          .some((value) => String(value || "").toLowerCase().includes(search.toLowerCase())))
    : records;

  const sorted = [...filtered].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const thisMonth = new Date().toISOString().slice(0, 7);
  const summaryMonth = records.filter((record) => record.date?.slice(0, 7) === thisMonth).length;
  const uniqueProducts = new Set(records.map((record) => record.product).filter(Boolean)).size;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await pull();
    } catch {
      // ignore
    }
    setRefreshing(false);
  }, [pull]);

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
          farm.sanitaryRecords = (farm.sanitaryRecords || []).filter((item) => item.id !== record.id);
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
              title="Sanitário"
              actionLabel="Registrar"
              actionIcon="add"
              onAction={() => navigation.navigate("SanitarioForm", { editRecord: null, farms, selectedFarmId: activeFarm?.id || farms[0]?.id || "" })}
              tone="blue"
            />

            <FarmSelectorCard
              title="Fazenda do manejo"
              value={activeFarm?.name || "Todas as fazendas"}
              helper={activeFarm ? `${activeFarm.sanitaryProducts?.length || 0} produtos` : `${farms.length} fazendas`}
              options={[{ value: "__ALL__", label: "Todas as fazendas" }, ...farms.map((farm) => ({ value: farm.id, label: farm.name }))]}
              selected={selectedFarm}
              onSelect={setSelectedFarm}
              tone="blue"
            />

            <View style={styles.summaryGrid}>
              <SummaryCard title="Aplicações" value={records.length} helper="total" icon="medkit" tone="blue" />
              <SummaryCard title="Este mês" value={summaryMonth} helper="período atual" icon="calendar" tone="primary" />
              <SummaryCard title="Produtos" value={uniqueProducts} helper="diferentes" icon="flask" tone="accent" />
            </View>

            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={colors.textLight} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar produto, procedimento, categoria..."
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
          <SanitaryCard
            record={item}
            onEdit={() => navigation.navigate("SanitarioForm", { editRecord: item, farms, selectedFarmId: item.farmId })}
            onDelete={() => handleDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<EmptyState search={search} />}
      />
    </SafeAreaView>
  );
}

function SanitaryCard({ record, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeadText}>
          <Text style={styles.cardCode}>{record.code || "-"}</Text>
          <Text style={styles.cardTitle}>{record.name || record.product || "Manejo sanitário"}</Text>
          <Text style={styles.cardFarm}>{record.farmName}</Text>
        </View>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={12} color={colors.blue} />
          <Text style={styles.dateText}>{fmtDate(record.date)}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        {record.product ? <InfoPill icon="flask-outline" text={record.product} /> : null}
        {record.categoryName ? <InfoPill icon="layers-outline" text={record.categoryName} /> : null}
        {record.potreiro ? <InfoPill icon="map-outline" text={record.potreiro} /> : null}
        {record.via ? <InfoPill icon="navigate-outline" text={record.via} /> : null}
        {record.quantity ? <InfoPill icon="people-outline" text={`${record.quantity} animais`} /> : null}
        {Array.isArray(record.attachments) && record.attachments.length ? <InfoPill icon="attach-outline" text={`${record.attachments.length} anexo(s)`} /> : null}
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
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function EmptyState({ search }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="medkit-outline" size={48} color={colors.textLight} />
      <Text style={styles.emptyTitle}>{search ? "Nenhum registro encontrado" : "Nenhum registro sanitário"}</Text>
      <Text style={styles.emptyText}>{search ? "Tente outros termos." : "Registre vacinas, medicamentos e manejos da fazenda por aqui."}</Text>
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
  cardHeadText: { flex: 1 },
  cardCode: { fontSize: 12, color: colors.textLight, fontWeight: "700" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 2 },
  cardFarm: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.blueFaded,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  dateText: { fontSize: 12, fontWeight: "700", color: colors.blue },
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
  infoText: { fontSize: 12, color: colors.textSecondary, maxWidth: 240 },
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
