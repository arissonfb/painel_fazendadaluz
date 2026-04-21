import React, { useState } from "react";
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
import { createUUID, currentTimeHM, generateRepCode, todayISO } from "../utils/farmUtils";
import { colors, spacing, radius } from "../theme";
import { REPRODUCTION_CATEGORIES } from "../utils/livestock";
import { Field, ModalPicker, Section, StyledInput } from "../components/MobileUI";

export default function ReproducaoFormScreen({ route, navigation }) {
  const { editRecord, farms = [], selectedFarmId, mode = "event" } = route.params || {};
  const { data, save } = useData();
  const isEdit = Boolean(editRecord);
  const verificationOnly = mode === "verification";

  const [farmId, setFarmId] = useState(editRecord?.farmId || selectedFarmId || farms[0]?.id || "");
  const [type, setType] = useState(editRecord?.type || "inseminacao");
  const [date, setDate] = useState(editRecord?.date || todayISO());
  const [time, setTime] = useState(editRecord?.time || currentTimeHM());
  const [categoryName, setCategoryName] = useState(editRecord?.categoryName || "");
  const [quantity, setQuantity] = useState(String(editRecord?.quantity || ""));
  const [bullInfo, setBullInfo] = useState(editRecord?.bullInfo || "");
  const [techInfo, setTechInfo] = useState(editRecord?.techInfo || "");
  const [notes, setNotes] = useState(editRecord?.notes || "");
  const [verifDate, setVerifDate] = useState(editRecord?.verificationDate || todayISO());
  const [verifTime, setVerifTime] = useState(editRecord?.verificationTime || currentTimeHM());
  const [quantityPrenha, setQuantityPrenha] = useState(String(editRecord?.quantityPegou || ""));
  const [verifNotes, setVerifNotes] = useState(editRecord?.verificationNotes || "");
  const [saving, setSaving] = useState(false);

  const selectedFarm = farms.find((farm) => farm.id === farmId);
  const categoryOptions = REPRODUCTION_CATEGORIES.map((label) => ({ value: label, label }));

  const quantityNum = verificationOnly ? Number(editRecord?.quantity || 0) : Number(quantity) || 0;
  const quantityPrenhaNum = Number(quantityPrenha) || 0;
  const quantityFalhou = verificationOnly ? Math.max(0, quantityNum - quantityPrenhaNum) : 0;

  async function handleSave() {
    if (!farmId) return Alert.alert("Atencao", "Selecione a fazenda.");
    if (!verificationOnly && !date) return Alert.alert("Atencao", "Informe a data.");
    if (!verificationOnly && (!quantityNum || quantityNum <= 0)) return Alert.alert("Atencao", "Informe a quantidade (> 0).");
    if (verificationOnly && !verifDate) return Alert.alert("Atencao", "Informe a data da verificação.");

    setSaving(true);
    try {
      const next = JSON.parse(JSON.stringify(data));
      const farm = next.farms.find((item) => item.id === farmId);
      if (!farm) throw new Error("Fazenda nao encontrada.");
      if (!Array.isArray(farm.reproductionRecords)) farm.reproductionRecords = [];

      const record = {
        id: editRecord?.id || createUUID(),
        code: editRecord?.code || generateRepCode(farm),
        farmId,
        type: verificationOnly ? editRecord?.type : type,
        date: verificationOnly ? editRecord?.date : date,
        time: verificationOnly ? (editRecord?.time || currentTimeHM()) : time,
        categoryName: verificationOnly ? editRecord?.categoryName : categoryName.trim(),
        categoryId: verificationOnly ? editRecord?.categoryName : categoryName.trim(),
        quantity: quantityNum,
        bullInfo: verificationOnly ? (editRecord?.bullInfo || "") : (type === "entourada" ? bullInfo.trim() : ""),
        techInfo: verificationOnly ? (editRecord?.techInfo || "") : (type === "inseminacao" ? techInfo.trim() : ""),
        verificationDate: verificationOnly ? verifDate : null,
        verificationTime: verificationOnly ? verifTime : null,
        quantityPegou: verificationOnly ? quantityPrenhaNum : null,
        quantityFalhou: verificationOnly ? quantityFalhou : null,
        verificationNotes: verificationOnly ? verifNotes.trim() : "",
        notes: verificationOnly ? (editRecord?.notes || "") : notes.trim(),
        createdAt: editRecord?.createdAt || new Date().toISOString(),
      };

      if (isEdit) {
        const index = farm.reproductionRecords.findIndex((item) => item.id === editRecord.id);
        if (index >= 0) farm.reproductionRecords[index] = record;
        else farm.reproductionRecords.push(record);
      } else {
        farm.reproductionRecords.push(record);
      }

      await save(next);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", error.message || "Nao foi possivel salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerEyebrow}>
            {verificationOnly ? "DIAGNÓSTICO DE GESTAÇÃO" : "REPRODUÇÃO"}
          </Text>
          <Text style={styles.title}>
            {verificationOnly ? "Registrar resultado" : (isEdit ? "Atualizar evento reprodutivo" : "Novo evento reprodutivo")}
          </Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={colors.textInverse} /> : <Text style={styles.saveBtnText}>{verificationOnly ? "Confirmar" : "Salvar evento"}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!verificationOnly ? (
          <Section title="Reprodução" subtitle="Evento reprodutivo por fazenda e categoria">
            <Field label="Fazenda">
              <ModalPicker
                options={farms.map((farm) => ({ value: farm.id, label: farm.name }))}
                value={farmId}
                onChange={setFarmId}
                placeholder="Selecione a fazenda"
              />
            </Field>

            <Field label="Tipo de evento">
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeCard, type === "inseminacao" && styles.typeCardActive]}
                  onPress={() => setType("inseminacao")}
                >
                  <Ionicons name="flask" size={24} color={type === "inseminacao" ? colors.textInverse : colors.primary} />
                  <Text style={[styles.typeCardText, type === "inseminacao" && styles.typeCardTextActive]}>{"Inseminação\nArtificial"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeCard, type === "entourada" && styles.typeCardActive]}
                  onPress={() => setType("entourada")}
                >
                  <Ionicons name="paw" size={24} color={type === "entourada" ? colors.textInverse : colors.primary} />
                  <Text style={[styles.typeCardText, type === "entourada" && styles.typeCardTextActive]}>Entourada</Text>
                </TouchableOpacity>
              </View>
            </Field>

            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Data do evento">
                  <StyledInput value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" keyboardType="numeric" />
                </Field>
              </View>
              <View style={styles.col}>
                <Field label="Hora do evento">
                  <StyledInput value={time} onChangeText={setTime} placeholder="HH:MM" keyboardType="numbers-and-punctuation" />
                </Field>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Categoria dos animais">
                  <ModalPicker
                    options={categoryOptions}
                    value={categoryName}
                    onChange={setCategoryName}
                    placeholder="Selecione a categoria"
                    allowCustom
                  />
                </Field>
              </View>
              <View style={styles.col}>
                <Field label="Quantidade de animais">
                  <StyledInput value={quantity} onChangeText={setQuantity} placeholder="Ex.: 50" keyboardType="numeric" />
                </Field>
              </View>
            </View>

            {type === "entourada" ? (
              <Field label="Touro responsável">
                <StyledInput value={bullInfo} onChangeText={setBullInfo} placeholder="Ex.: Touro 18 / lote 2" />
              </Field>
            ) : (
              <Field label="Técnico responsável">
                <StyledInput value={techInfo} onChangeText={setTechInfo} placeholder="Ex.: Dr. Joao Silva" />
              </Field>
            )}

            <Field label="Observações">
              <StyledInput value={notes} onChangeText={setNotes} placeholder="Ex.: Lote sincronizado, protocolo IATF" multiline numberOfLines={3} />
            </Field>
          </Section>
        ) : (
          <>
            <Section title="Diagnóstico de gestação" subtitle="Registro do resultado do evento">
              <View style={styles.eventSummary}>
                <Text style={styles.summaryBadge}>{editRecord?.type === "inseminacao" ? "Inseminação" : "Entourada"}</Text>
                <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Fazenda:</Text> {selectedFarm?.name || "-"}</Text>
                <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Data do evento:</Text> {editRecord?.date || "-"} {editRecord?.time || ""}</Text>
                <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Categoria:</Text> {editRecord?.categoryName || "-"}</Text>
                <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Total no evento:</Text> {editRecord?.quantity || 0} animais</Text>
              </View>
            </Section>

            <Section title="Resultado">
              <View style={styles.row}>
                <View style={styles.col}>
                  <Field label="Data da Verificação">
                    <StyledInput value={verifDate} onChangeText={setVerifDate} placeholder="DD/MM/AAAA" keyboardType="numeric" />
                  </Field>
                </View>
                <View style={styles.col}>
                  <Field label="Hora da Verificação">
                    <StyledInput value={verifTime} onChangeText={setVerifTime} placeholder="HH:MM" keyboardType="numbers-and-punctuation" />
                  </Field>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Field label="Qtd. prenha">
                    <StyledInput value={quantityPrenha} onChangeText={setQuantityPrenha} placeholder="Ex.: 35" keyboardType="numeric" />
                  </Field>
                </View>
                <View style={styles.col}>
                  <Field label="Qtd. falhada (calculado)">
                    <StyledInput value={String(quantityFalhou)} editable={false} />
                  </Field>
                </View>
              </View>

              <Field label="Observações">
                <StyledInput value={verifNotes} onChangeText={setVerifNotes} placeholder="Ex.: Diagnóstico por ultrassom, 30 dias após o evento" multiline numberOfLines={2} />
              </Field>
            </Section>
          </>
        )}
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
  closeBtn: { padding: 4 },
  headerTitleWrap: { flex: 1, paddingHorizontal: spacing.sm },
  headerEyebrow: { fontSize: 11, fontWeight: "700", color: colors.textSecondary, letterSpacing: 0.7 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 2 },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    minWidth: 96,
    alignItems: "center",
  },
  saveBtnText: { color: colors.textInverse, fontWeight: "700", fontSize: 14 },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.sm },
  col: { flex: 1 },
  typeRow: { flexDirection: "row", gap: spacing.sm },
  typeCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    gap: 8,
    minHeight: 80,
    justifyContent: "center",
  },
  typeCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeCardText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    lineHeight: 18,
  },
  typeCardTextActive: {
    color: colors.textInverse,
  },
  eventSummary: {
    backgroundColor: colors.primaryFaded,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 6,
  },
  summaryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#d6e5da",
    color: colors.primary,
    fontWeight: "700",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  summaryText: { fontSize: 13, color: colors.text },
  summaryLabel: { fontWeight: "700", color: colors.textSecondary },
});
