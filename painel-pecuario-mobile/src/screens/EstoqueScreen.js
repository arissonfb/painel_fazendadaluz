import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "../context/DataContext";
import { colors, spacing, radius } from "../theme";
import { slugify, SPECIES_OPTIONS, DEFAULT_SPECIES, normalizeSpecies } from "../utils/livestock";
import { FarmSelectorCard, Field, OptionRow, Section, StyledInput } from "../components/MobileUI";

export default function EstoqueScreen({ route }) {
  const { farms = [], selectedFarmId } = route.params || {};
  const { data, save } = useData();
  const [farmId, setFarmId] = useState(selectedFarmId || farms[0]?.id || "");
  const [species, setSpecies] = useState(DEFAULT_SPECIES);
  const [rows, setRows] = useState([]);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedFarm = farms.find((farm) => farm.id === farmId);

  useEffect(() => {
    const categories = (selectedFarm?.categories || []).filter(
      (category) => normalizeSpecies(category.species) === normalizeSpecies(species),
    );
    setRows(categories.map((category) => ({ id: category.id, name: category.name, quantity: String(category.quantity || 0) })));
  }, [farmId, species, selectedFarm]);

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0),
    [rows],
  );

  function updateRowQuantity(id, value) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, quantity: value } : row)));
  }

  function removeRow(id) {
    Alert.alert("Remover categoria", "Tem certeza que deseja remover esta categoria do estoque?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: () => setRows((current) => current.filter((row) => row.id !== id)) },
    ]);
  }

  function addCategory() {
    const name = newName.trim();
    if (!name) {
      Alert.alert("Atenção", "Informe o nome da categoria.");
      return;
    }
    const id = slugify(`${name}-${Date.now()}`);
    setRows((current) => [...current, { id, name, quantity: String(Number(newQuantity) || 0) }]);
    setNewName("");
    setNewQuantity("");
  }

  async function handleSave() {
    if (!selectedFarm) return;
    setSaving(true);
    try {
      const next = JSON.parse(JSON.stringify(data));
      const farm = next.farms.find((item) => item.id === farmId);
      if (!farm) throw new Error("Fazenda não encontrada.");

      const normalizedSpecies = normalizeSpecies(species);
      const otherSpeciesCategories = (farm.categories || []).filter(
        (category) => normalizeSpecies(category.species) !== normalizedSpecies,
      );
      const updatedCategories = rows.map((row) => {
        const existing = (farm.categories || []).find((category) => category.id === row.id);
        return {
          id: row.id,
          name: row.name.trim(),
          species: normalizedSpecies,
          quantity: Number(row.quantity) || 0,
          allocation: existing?.allocation,
        };
      });

      farm.categories = [...otherSpeciesCategories, ...updatedCategories];
      await save(next);
      Alert.alert("Estoque atualizado", "As categorias e quantidades foram salvas.");
    } catch (error) {
      Alert.alert("Erro", error.message || "Não foi possível salvar o estoque.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>ESTOQUE</Text>
          <Text style={styles.title}>Categorias e quantidades</Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={colors.textInverse} /> : <Text style={styles.saveBtnText}>Salvar</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FarmSelectorCard
          title="Fazenda"
          value={selectedFarm?.name || "Selecione uma fazenda"}
          helper={`${rows.length} categorias · ${total} animais`}
          options={farms.map((farm) => ({ value: farm.id, label: farm.name }))}
          selected={farmId}
          onSelect={setFarmId}
          tone="primary"
        />

        <Section title="Espécie" subtitle="Escolha entre bovinos e ovinos">
          <OptionRow options={SPECIES_OPTIONS} selected={species} onSelect={setSpecies} />
        </Section>

        <Section title="Categorias" subtitle={`Total: ${total} animais`}>
          {rows.length ? (
            rows.map((row) => (
              <View key={row.id} style={styles.row}>
                <Text style={styles.rowName} numberOfLines={2}>{row.name}</Text>
                <View style={styles.rowQtyWrap}>
                  <StyledInput
                    value={row.quantity}
                    onChangeText={(value) => updateRowQuantity(row.id, value)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <TouchableOpacity onPress={() => removeRow(row.id)} style={styles.removeBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma categoria cadastrada para esta espécie.</Text>
          )}
        </Section>

        <Section title="Adicionar categoria">
          <Field label="Nome da categoria">
            <StyledInput value={newName} onChangeText={setNewName} placeholder="Ex.: Cordeiro" />
          </Field>
          <Field label="Quantidade inicial">
            <StyledInput value={newQuantity} onChangeText={setNewQuantity} placeholder="0" keyboardType="numeric" />
          </Field>
          <TouchableOpacity style={styles.addBtn} onPress={addCategory} activeOpacity={0.8}>
            <Ionicons name="add" size={18} color={colors.textInverse} />
            <Text style={styles.addBtnText}>Adicionar categoria</Text>
          </TouchableOpacity>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerEyebrow: { fontSize: 11, fontWeight: "700", color: colors.textSecondary, letterSpacing: 0.7 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 2 },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    minWidth: 78,
    alignItems: "center",
  },
  saveBtnText: { color: colors.textInverse, fontWeight: "700", fontSize: 14 },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  rowName: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
  rowQtyWrap: { width: 90 },
  removeBtn: { padding: 6 },
  emptyText: { fontSize: 13, color: colors.textLight, fontStyle: "italic" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  addBtnText: { color: colors.textInverse, fontWeight: "700", fontSize: 14 },
});
