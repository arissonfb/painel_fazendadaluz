import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { colors, spacing, radius, shadow } from "../theme";
import { calcReproStats, calcStockTotal } from "../utils/farmUtils";
import { shareFarmReport, shareSanitaryReport } from "../utils/reports";
import { SummaryCard } from "../components/MobileUI";

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const { data, lastSync, syncing, pull } = useData();
  const [loggingOut, setLoggingOut] = useState(false);
  const [syncingNow, setSyncingNow] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportingSanitary, setReportingSanitary] = useState(false);

  const farms = useMemo(() => (data?.farms || []).filter((farm) => farm.id !== "__TOTAL__"), [data]);
  const totalAnimals = farms.reduce((sum, farm) => sum + calcStockTotal(farm), 0);
  const totalMovements = farms.reduce((sum, farm) => sum + (farm.movements?.length || 0), 0);
  const totalSanitary = farms.reduce((sum, farm) => sum + (farm.sanitaryRecords?.length || 0), 0);
  const reproStats = calcReproStats(farms.flatMap((farm) => farm.reproductionRecords || []));

  function confirmLogout() {
    Alert.alert("Sair", "Deseja encerrar a sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          await logout();
        },
      },
    ]);
  }

  async function handleSync() {
    setSyncingNow(true);
    try {
      await pull();
      Alert.alert("Sincronizado", "Dados atualizados com sucesso.");
    } catch (error) {
      Alert.alert("Erro", error.message || "Não foi possível sincronizar.");
    } finally {
      setSyncingNow(false);
    }
  }

  async function handleReport() {
    if (!farms.length) {
      Alert.alert("Relatório", "Nenhuma fazenda disponível para gerar o PDF.");
      return;
    }
    setReporting(true);
    try {
      await shareFarmReport(farms[0]);
    } catch (error) {
      Alert.alert("Erro", error.message || "Não foi possível gerar o relatório.");
    } finally {
      setReporting(false);
    }
  }

  async function handleSanitaryReport() {
    if (!farms.length) {
      Alert.alert("Relatório", "Nenhuma fazenda disponível para gerar o PDF.");
      return;
    }
    setReportingSanitary(true);
    try {
      await shareSanitaryReport(farms[0]);
    } catch (error) {
      Alert.alert("Erro", error.message || "Não foi possível gerar o relatório sanitário.");
    } finally {
      setReportingSanitary(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.username || "U").charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.username}</Text>
            <Text style={styles.userRole}>{user?.role === "admin" ? "Administrador do sistema" : "Operador"}</Text>
            <Text style={styles.syncLabel}>Última sincronização: {lastSync ? lastSync.toLocaleString("pt-BR") : "—"}</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard title="Fazendas" value={farms.length} helper="ativas no app" icon="leaf" tone="primary" />
          <SummaryCard title="Animais" value={totalAnimals} helper="estoque total" icon="paw" tone="accent" />
          <SummaryCard title="Sanitário" value={totalSanitary} helper="registros" icon="medkit" tone="blue" />
          <SummaryCard title="Prenhez" value={`${reproStats.taxa}%`} helper={`${reproStats.totalPrenha} prenhas`} icon="heart" tone="danger" />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Operação do sistema</Text>
          <InfoRow icon="swap-horizontal-outline" label="Movimentações registradas" value={String(totalMovements)} />
          <Divider />
          <InfoRow icon="server-outline" label="Base sincronizada" value="Render + PostgreSQL" />
          <Divider />
          <InfoRow icon="cloud-done-outline" label="Status" value={syncing ? "Sincronizando..." : "Online"} />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <ActionRow
            icon="sync-outline"
            label="Sincronizar agora"
            helper="Atualiza os dados com o sistema web"
            color={colors.primary}
            loading={syncing || syncingNow}
            onPress={handleSync}
          />
          <Divider />
          <ActionRow
            icon="document-text-outline"
            label="Relatório geral PDF"
            helper="Movimentações, reprodução e estoque"
            color={colors.blue}
            loading={reporting}
            onPress={handleReport}
          />
          <Divider />
          <ActionRow
            icon="medkit-outline"
            label="Relatório sanitário PDF"
            helper="Todos os registros de manejo sanitário"
            color={colors.accent}
            loading={reportingSanitary}
            onPress={handleSanitaryReport}
          />
          <Divider />
          <ActionRow
            icon="log-out-outline"
            label="Sair do sistema"
            helper="Encerra a sessão atual"
            color={colors.danger}
            loading={loggingOut}
            onPress={confirmLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionRow({ icon, label, helper, color, loading, onPress }) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} disabled={loading} activeOpacity={0.75}>
      <View style={styles.infoLeft}>
        <View style={[styles.actionIcon, { backgroundColor: `${color}22` }]}>
          {loading ? <ActivityIndicator size="small" color={color} /> : <Ionicons name={icon} size={18} color={color} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.actionLabel, { color }]}>{label}</Text>
          <Text style={styles.actionHelper}>{helper}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow.md,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 24, fontWeight: "800", color: colors.textInverse },
  userName: { fontSize: 20, fontWeight: "800", color: colors.textInverse },
  userRole: { fontSize: 13, color: "rgba(255,255,255,0.86)", marginTop: 4 },
  syncLabel: { fontSize: 12, color: "rgba(255,255,255,0.82)", marginTop: 6 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    ...shadow.sm,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  infoLabel: { fontSize: 15, color: colors.text },
  infoValue: { fontSize: 15, fontWeight: "700", color: colors.text },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: { fontSize: 15, fontWeight: "700" },
  actionHelper: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.md },
});
