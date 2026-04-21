import React, { useMemo, useState } from "react";
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
import { createUUID, generateMovCode, todayISO } from "../utils/farmUtils";
import { colors, spacing, radius } from "../theme";
import {
  getFarmCategoryOptions,
  MOVEMENT_REFERENCE_PRESETS,
  MOVEMENT_TYPES,
  upsertMovementInData,
  MEDIA_SUPPORTED_MOVEMENT_TYPES,
} from "../utils/livestock";
import { getAttachmentLabelCount, pickMediaAsset, uploadAssetToCloudinary } from "../utils/media";
import { Field, FarmSelectorCard, ModalPicker, OptionRow, Section, StyledInput } from "../components/MobileUI";

export default function MovimentacaoFormScreen({ route, navigation }) {
  const { editRecord, farms = [], selectedFarmId } = route.params || {};
  const { data, save } = useData();
  const isEdit = Boolean(editRecord);

  const [farmId, setFarmId] = useState(editRecord?.farmId || selectedFarmId || farms?.[0]?.id || "");
  const [type, setType] = useState(editRecord?.type || "compra");
  const [date, setDate] = useState(editRecord?.date || todayISO());
  const [categoryName, setCategoryName] = useState(editRecord?.categoryName || "");
  const [quantity, setQuantity] = useState(String(editRecord?.quantity || ""));
  const [origin, setOrigin] = useState(editRecord?.purchaseDetails?.origin || "");
  const [supplier, setSupplier] = useState(editRecord?.purchaseDetails?.supplier || "");
  const [buyer, setBuyer] = useState(editRecord?.saleDetails?.buyer || "");
  const [destination, setDestination] = useState(editRecord?.saleDetails?.destination || "");
  const [weight, setWeight] = useState(String(editRecord?.weight || ""));
  const [valuePerKg, setValuePerKg] = useState(String(editRecord?.valuePerKg || ""));
  const [valuePerHead, setValuePerHead] = useState(String(editRecord?.valuePerHead || ""));
  const [totalValue, setTotalValue] = useState(String(editRecord?.value || ""));
  const [notes, setNotes] = useState(editRecord?.notes || "");
  const [attachments, setAttachments] = useState(editRecord?.attachments || []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const selectedFarm = farms.find((farm) => farm.id === farmId);
  const preset = MOVEMENT_REFERENCE_PRESETS[type] || MOVEMENT_REFERENCE_PRESETS.compra;
  const rawCategoryOptions = getFarmCategoryOptions(selectedFarm, preset.categories);
  const categoryPickerOptions = rawCategoryOptions.map((o) => ({ value: o.label, label: o.label }));
  const movementTypeOptions = MOVEMENT_TYPES.map((item) => ({ value: item.value, label: item.label }));

  const quantityNumber = Number(quantity || 0);
  const weightNumber = Number(weight || 0);
  const unitWeight = quantityNumber > 0 && weightNumber > 0 ? (weightNumber / quantityNumber).toFixed(2) : "";
  const computedTotal = useMemo(() => {
    if (Number(totalValue || 0) > 0) return Number(totalValue);
    if (Number(valuePerKg || 0) > 0 && weightNumber > 0) return Number(valuePerKg) * weightNumber;
    if (Number(valuePerHead || 0) > 0 && quantityNumber > 0) return Number(valuePerHead) * quantityNumber;
    return 0;
  }, [quantityNumber, totalValue, valuePerHead, valuePerKg, weightNumber]);

  async function handleAddAttachment() {
    if (!MEDIA_SUPPORTED_MOVEMENT_TYPES.has(type)) {
      Alert.alert("Anexos", "Esse tipo de movimentacao nao exige anexo de foto ou video.");
      return;
    }

    setUploading(true);
    try {
      const assets = await pickMediaAsset({ allowsMultipleSelection: true });
      if (!assets.length) return;
      const uploaded = [];
      for (const asset of assets) {
        const uploadedItem = await uploadAssetToCloudinary(asset);
        uploaded.push(uploadedItem);
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
    if (!type) return Alert.alert("Atencao", "Selecione o tipo.");
    if (!date) return Alert.alert("Atencao", "Informe a data.");
    if (!quantityNumber || quantityNumber < 1) return Alert.alert("Atencao", "Informe uma quantidade valida.");
    if (!categoryName.trim()) return Alert.alert("Atencao", "Selecione ou informe a categoria.");

    setSaving(true);
    try {
      const next = JSON.parse(JSON.stringify(data));
      const farm = next.farms.find((item) => item.id === farmId);
      if (!farm) throw new Error("Fazenda nao encontrada.");

      const record = {
        id: editRecord?.id || createUUID(),
        code: editRecord?.code || generateMovCode(farm),
        farmId,
        type,
        date,
        categoryName: categoryName.trim(),
        categoryId: categoryName.trim(),
        quantity: quantityNumber,
        weight: weightNumber || null,
        valuePerKg: Number(valuePerKg || 0) || null,
        valuePerHead: Number(valuePerHead || 0) || null,
        value: computedTotal || null,
        notes: notes.trim(),
        purchaseDetails: type === "compra" ? {
          origin: origin.trim(),
          supplier: supplier.trim(),
        } : null,
        saleDetails: type === "venda" ? {
          buyer: buyer.trim(),
          destination: destination.trim(),
        } : null,
        attachments,
        createdAt: editRecord?.createdAt || new Date().toISOString(),
      };

      if (type === "ajuste") {
        record.delta = quantityNumber;
      }

      upsertMovementInData(next, record, editRecord || null);
      await save(next);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", error.message || "Nao foi possivel salvar a movimentacao.");
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
          <Text style={styles.headerEyebrow}>{isEdit ? "EDITAR MOVIMENTACAO" : "NOVO LANCAMENTO"}</Text>
          <Text style={styles.title}>{preset.title}</Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving || uploading}>
          {saving ? <ActivityIndicator size="small" color={colors.textInverse} /> : <Text style={styles.saveBtnText}>Salvar</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FarmSelectorCard
          title="Fazenda do registro"
          value={selectedFarm?.name || "Selecione uma fazenda"}
          helper={selectedFarm ? `${selectedFarm.categories?.length || 0} categorias` : "Escolha a unidade"}
          options={farms.map((farm) => ({ value: farm.id, label: farm.name }))}
          selected={farmId}
          onSelect={setFarmId}
          tone="accent"
        />

        <Section title="Evento" subtitle={preset.detailTitle}>
          <Field label="Tipo">
            <OptionRow options={movementTypeOptions} selected={type} onSelect={setType} tone="accent" />
          </Field>
          <Field label="Data">
            <StyledInput value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" keyboardType="numeric" />
          </Field>
          <Field label="Categoria">
            <ModalPicker
              options={categoryPickerOptions}
              value={categoryName}
              onChange={setCategoryName}
              placeholder="Selecione a categoria"
              allowCustom
              tone="accent"
            />
          </Field>
          <Field label="Quantidade">
            <StyledInput value={quantity} onChangeText={setQuantity} placeholder="0" keyboardType="numeric" />
          </Field>
        </Section>

        {(type === "compra" || type === "venda") ? (
          <Section title={type === "compra" ? "Detalhes comerciais" : "Detalhes da venda"}>
            {type === "compra" ? (
              <>
                <Field label="Propriedade / origem">
                  <StyledInput value={origin} onChangeText={setOrigin} placeholder="Ex.: Estancia Santa Rosa" />
                </Field>
                <Field label="Fornecedor">
                  <StyledInput value={supplier} onChangeText={setSupplier} placeholder="Nome do vendedor ou leilao" />
                </Field>
              </>
            ) : (
              <>
                <Field label="Comprador">
                  <StyledInput value={buyer} onChangeText={setBuyer} placeholder="Frigorifico, cliente, corretor..." />
                </Field>
                <Field label="Destino">
                  <StyledInput value={destination} onChangeText={setDestination} placeholder="Destino da carga" />
                </Field>
              </>
            )}
            <Field label="Peso total (kg)" hint={unitWeight ? `${unitWeight} kg/cabeca` : "opcional"}>
              <StyledInput value={weight} onChangeText={setWeight} placeholder="0" keyboardType="decimal-pad" />
            </Field>
            <Field label="Valor por kg">
              <StyledInput value={valuePerKg} onChangeText={setValuePerKg} placeholder="0,00" keyboardType="decimal-pad" />
            </Field>
            <Field label="Valor por animal">
              <StyledInput value={valuePerHead} onChangeText={setValuePerHead} placeholder="0,00" keyboardType="decimal-pad" />
            </Field>
            <Field label="Valor total">
              <StyledInput value={totalValue} onChangeText={setTotalValue} placeholder={computedTotal ? computedTotal.toFixed(2) : "0,00"} keyboardType="decimal-pad" />
            </Field>
          </Section>
        ) : null}

        <Section title="Observacoes e anexos" subtitle={getAttachmentLabelCount(attachments)}>
          <Field label="Observacoes">
            <StyledInput value={notes} onChangeText={setNotes} placeholder="Detalhes do manejo, lote, conferencias..." multiline numberOfLines={4} />
          </Field>

          <TouchableOpacity style={styles.attachmentBtn} onPress={handleAddAttachment} disabled={uploading}>
            {uploading ? <ActivityIndicator size="small" color={colors.accent} /> : <Ionicons name="attach" size={18} color={colors.accent} />}
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
  title: { fontSize: 26, fontWeight: "800", color: colors.text, marginTop: 2 },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    minWidth: 78,
    alignItems: "center",
  },
  saveBtnText: { color: colors.textInverse, fontWeight: "700", fontSize: 14 },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  attachmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentFaded,
  },
  attachmentBtnText: { color: colors.accent, fontWeight: "700" },
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
