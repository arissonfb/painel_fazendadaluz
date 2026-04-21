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
import { createUUID, generateSanCode, todayISO } from "../utils/farmUtils";
import { colors, spacing, radius } from "../theme";
import { getFarmCategoryOptions, getFarmPotreiroOptions, SANITARY_VIAS } from "../utils/livestock";
import { getAttachmentLabelCount, pickMediaAsset, uploadAssetToCloudinary } from "../utils/media";
import { Field, ModalPicker, OptionRow, Section, StyledInput } from "../components/MobileUI";

export default function SanitarioFormScreen({ route, navigation }) {
  const { editRecord, farms = [], selectedFarmId } = route.params || {};
  const { data, save } = useData();
  const isEdit = Boolean(editRecord);

  const [farmId, setFarmId] = useState(editRecord?.farmId || selectedFarmId || farms[0]?.id || "");
  const [date, setDate] = useState(editRecord?.date || todayISO());
  const [name, setName] = useState(editRecord?.name || "");
  const [categoryName, setCategoryName] = useState(editRecord?.categoryName || "");
  const [potreiro, setPotreiro] = useState(editRecord?.potreiro || "");
  const [quantity, setQuantity] = useState(String(editRecord?.quantity || ""));
  const [product, setProduct] = useState(editRecord?.product || "");
  const [dosage, setDosage] = useState(editRecord?.dosage || "");
  const [via, setVia] = useState(editRecord?.via || "");
  const [responsible, setResponsible] = useState(editRecord?.responsible || "");
  const [notes, setNotes] = useState(editRecord?.notes || "");
  const [attachments, setAttachments] = useState(editRecord?.attachments || []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const selectedFarm = farms.find((farm) => farm.id === farmId);
  const categoryOptions = getFarmCategoryOptions(selectedFarm).map((item) => ({ value: item.label, label: item.label }));
  const productOptions = (selectedFarm?.sanitaryProducts || []).map((item) => ({ value: item, label: item }));
  const productOptionsWithOther = productOptions.concat({ value: "__other__", label: "Outros" });
  const selectedProductOption = productOptions.some((item) => item.value === product) ? product : "__other__";
  const potreiroOptions = getFarmPotreiroOptions(selectedFarm).map((item) => ({ value: item.label, label: item.label }));

  async function handleAddAttachment() {
    setUploading(true);
    try {
      const assets = await pickMediaAsset({ allowsMultipleSelection: true });
      if (!assets.length) return;
      const uploaded = [];
      for (const asset of assets) {
        uploaded.push(await uploadAssetToCloudinary(asset));
      }
      setAttachments((current) => current.concat(uploaded));
    } catch (error) {
      Alert.alert("Erro", error.message || "Nao foi possivel anexar a midia.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!farmId) return Alert.alert("Atencao", "Selecione a fazenda.");
    if (!date) return Alert.alert("Atencao", "Informe a data.");

    setSaving(true);
    try {
      const next = JSON.parse(JSON.stringify(data));
      const farm = next.farms.find((item) => item.id === farmId);
      if (!farm) throw new Error("Fazenda nao encontrada.");

      const record = {
        id: editRecord?.id || createUUID(),
        code: editRecord?.code || generateSanCode(farm),
        farmId,
        date,
        name: name.trim() || product.trim() || "Manejo sanitario",
        categoryName: categoryName.trim(),
        categoryId: categoryName.trim(),
        potreiro: potreiro.trim(),
        quantity: Number(quantity) || 0,
        product: product.trim(),
        dosage: dosage.trim(),
        via: via.trim(),
        responsible: responsible.trim(),
        notes: notes.trim(),
        attachments,
        createdAt: editRecord?.createdAt || new Date().toISOString(),
      };

      if (record.product && !farm.sanitaryProducts.includes(record.product)) {
        farm.sanitaryProducts.push(record.product);
      }

      if (isEdit) {
        const index = (farm.sanitaryRecords || []).findIndex((item) => item.id === editRecord.id);
        if (index >= 0) farm.sanitaryRecords[index] = record;
        else farm.sanitaryRecords.push(record);
      } else {
        farm.sanitaryRecords.push(record);
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
          <Text style={styles.headerEyebrow}>MANEJO SANITARIO</Text>
          <Text style={styles.title}>{isEdit ? "Atualizar registro sanitario" : "Novo registro sanitario"}</Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving || uploading}>
          {saving ? <ActivityIndicator size="small" color={colors.textInverse} /> : <Text style={styles.saveBtnText}>Salvar registro</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Section title="Manejo sanitario" subtitle="Fluxo direto por fazenda, categoria e produto">
          <View style={styles.row}>
            <View style={styles.col}>
              <Field label="Fazenda">
                <ModalPicker
                  options={farms.map((farm) => ({ value: farm.id, label: farm.name }))}
                  value={farmId}
                  onChange={setFarmId}
                  placeholder="Selecione a fazenda"
                />
              </Field>
            </View>
            <View style={styles.col}>
              <Field label="Data">
                <StyledInput value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" keyboardType="numeric" />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Field label="Categoria">
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
                <StyledInput value={quantity} onChangeText={setQuantity} placeholder="0" keyboardType="numeric" />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Field label="Produto utilizado">
                <ModalPicker
                  options={productOptionsWithOther}
                  value={selectedProductOption}
                  onChange={(value) => {
                    if (value === "__other__") {
                      if (productOptions.some((item) => item.value === product)) setProduct("");
                      return;
                    }
                    setProduct(value);
                  }}
                  placeholder="Selecione o produto"
                />
                {selectedProductOption === "__other__" ? (
                  <View style={{ marginTop: spacing.sm }}>
                    <StyledInput value={product} onChangeText={setProduct} placeholder="Digite a nova vacina / medicamento" />
                  </View>
                ) : null}
              </Field>
            </View>
            <View style={styles.col}>
              <Field label="Potreiro de destino">
                <ModalPicker
                  options={potreiroOptions.length ? potreiroOptions : [{ value: "", label: "Sem potreiro" }]}
                  value={potreiro}
                  onChange={setPotreiro}
                  placeholder="Selecione o potreiro"
                  allowCustom
                />
              </Field>
            </View>
          </View>

          <Field label="Observacoes">
            <StyledInput value={notes} onChangeText={setNotes} placeholder="Ex.: lote revisado apos manejo" multiline numberOfLines={3} />
          </Field>

          <Field label="Nome do procedimento (opcional)">
            <StyledInput value={name} onChangeText={setName} placeholder="Ex.: vacinacao, vermifugacao..." />
          </Field>

          <View style={styles.row}>
            <View style={styles.col}>
              <Field label="Dosagem (opcional)">
                <StyledInput value={dosage} onChangeText={setDosage} placeholder="Ex.: 2 ml / 100 kg" />
              </Field>
            </View>
            <View style={styles.col}>
              <Field label="Responsavel (opcional)">
                <StyledInput value={responsible} onChangeText={setResponsible} placeholder="Tecnico / operador" />
              </Field>
            </View>
          </View>

          <Field label="Via (opcional)">
            <OptionRow options={SANITARY_VIAS.map((item) => ({ value: item, label: item }))} selected={via} onSelect={setVia} tone="blue" />
          </Field>
        </Section>

        <Section title="Anexos" subtitle={getAttachmentLabelCount(attachments)}>
          <TouchableOpacity style={styles.attachmentBtn} onPress={handleAddAttachment} disabled={uploading}>
            {uploading ? <ActivityIndicator size="small" color={colors.blue} /> : <Ionicons name="attach" size={18} color={colors.blue} />}
            <Text style={styles.attachmentBtnText}>{uploading ? "Enviando midia..." : "Adicionar foto ou video"}</Text>
          </TouchableOpacity>

          {attachments.length ? (
            <View style={styles.attachmentList}>
              {attachments.map((attachment) => (
                <View key={attachment.id} style={styles.attachmentItem}>
                  <Ionicons name={attachment.type === "video" ? "videocam" : "image"} size={16} color={colors.primary} />
                  <Text style={styles.attachmentText} numberOfLines={1}>{attachment.name}</Text>
                  <TouchableOpacity onPress={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}>
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}
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
  closeBtn: { padding: 4 },
  headerTitleWrap: { flex: 1, paddingHorizontal: spacing.sm },
  headerEyebrow: { fontSize: 11, fontWeight: "700", color: colors.textSecondary, letterSpacing: 0.7 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 2 },
  saveBtn: {
    backgroundColor: colors.blue,
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
  attachmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: colors.blueFaded,
  },
  attachmentBtnText: { color: colors.blue, fontWeight: "700" },
  attachmentList: { gap: spacing.sm },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachmentText: { flex: 1, fontSize: 13, color: colors.textSecondary },
});
