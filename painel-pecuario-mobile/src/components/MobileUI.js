import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, shadow, typography } from "../theme";

export function ScreenHeader({ title, actionLabel, actionIcon = "add", onAction, tone = "primary", compact = false }) {
  const background = tone === "accent" ? colors.accent : tone === "blue" ? colors.blue : colors.primary;
  return (
    <View style={[styles.header, compact && { paddingBottom: spacing.xs }]}>
      <Text style={styles.headerTitle}>{title}</Text>
      {onAction ? (
        <TouchableOpacity style={[styles.headerAction, { backgroundColor: background }]} onPress={onAction}>
          <Ionicons name={actionIcon} size={18} color={colors.textInverse} />
          {actionLabel ? <Text style={styles.headerActionText}>{actionLabel}</Text> : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function FarmSelectorCard({ title = "Fazenda ativa", value, helper, options, selected, onSelect, tone = "primary" }) {
  const activeColor = tone === "blue" ? colors.blue : tone === "accent" ? colors.accent : colors.primary;
  return (
    <View style={styles.selectorCard}>
      <View style={styles.selectorHeader}>
        <View>
          <Text style={styles.selectorEyebrow}>{title}</Text>
          <Text style={styles.selectorValue}>{value}</Text>
        </View>
        {helper ? <Text style={styles.selectorHelper}>{helper}</Text> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.selectorTabs}>
          {options.map((option) => {
            const active = selected === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectorTab,
                  active && { backgroundColor: activeColor, borderColor: activeColor },
                ]}
                onPress={() => onSelect(option.value)}
              >
                <Text style={[styles.selectorTabText, active && styles.selectorTabTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export function SummaryCard({ title, value, helper, icon, tone = "primary", onPress }) {
  const color = tone === "blue" ? colors.blue : tone === "accent" ? colors.accent : tone === "danger" ? colors.danger : colors.primary;
  const faded = tone === "blue" ? colors.blueFaded : tone === "accent" ? colors.accentFaded : tone === "danger" ? colors.dangerFaded : colors.primaryFaded;
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.summaryCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.summaryIcon, { backgroundColor: faded }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryTitle}>{title}</Text>
      {helper ? <Text style={styles.summaryHelper}>{helper}</Text> : null}
    </Wrapper>
  );
}

export function Section({ title, children, subtitle }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export function Field({ label, hint, children }) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function StyledInput({ multiline, numberOfLines, ...props }) {
  return (
    <TextInput
      style={[styles.input, multiline && { height: 20 * (numberOfLines || 3), textAlignVertical: "top" }]}
      placeholderTextColor={colors.textLight}
      multiline={multiline}
      numberOfLines={numberOfLines}
      {...props}
    />
  );
}

export function OptionRow({ options, selected, onSelect, tone = "primary" }) {
  const activeColor = tone === "blue" ? colors.blue : tone === "accent" ? colors.accent : colors.primary;
  return (
    <View style={styles.optionRow}>
      {options.map((option) => {
        const active = selected === option.value;
        return (
          <TouchableOpacity
            key={`${option.value}-${option.label}`}
            style={[styles.optionChip, active && { backgroundColor: activeColor, borderColor: activeColor }]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function ModalPicker({ options, value, onChange, placeholder = "Selecione...", tone = "primary", allowCustom = false }) {
  const [visible, setVisible] = useState(false);
  const [customText, setCustomText] = useState("");
  const activeColor = tone === "blue" ? colors.blue : tone === "accent" ? colors.accent : colors.primary;
  const selectedLabel = options.find((o) => o.value === value)?.label || value || "";

  function confirm(val) {
    const trimmed = String(val || "").trim();
    if (trimmed) {
      onChange(trimmed);
      setCustomText("");
      setVisible(false);
    }
  }

  return (
    <>
      <TouchableOpacity style={styles.pickerTrigger} onPress={() => setVisible(true)} activeOpacity={0.75}>
        <Text
          style={[styles.pickerTriggerText, !value && styles.pickerPlaceholder]}
          numberOfLines={1}
        >
          {selectedLabel || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} style={{ flexShrink: 0 }} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <TouchableOpacity style={styles.pickerSheet} activeOpacity={1} onPress={() => {}}>
            <View style={styles.pickerHandle} />
            {allowCustom ? (
              <View style={styles.pickerCustomRow}>
                <TextInput
                  style={styles.pickerCustomInput}
                  placeholder="Digitar outro valor..."
                  placeholderTextColor={colors.textLight}
                  value={customText}
                  onChangeText={setCustomText}
                  returnKeyType="done"
                  onSubmitEditing={() => confirm(customText)}
                />
                <TouchableOpacity
                  style={[styles.pickerCustomConfirm, { backgroundColor: activeColor }]}
                  onPress={() => confirm(customText)}
                >
                  <Text style={styles.pickerCustomConfirmText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <ScrollView style={styles.pickerList} keyboardShouldPersistTaps="handled">
              {options.map((item) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.pickerOption, isSelected && { backgroundColor: activeColor + "18" }]}
                    onPress={() => { onChange(item.value); setVisible(false); }}
                  >
                    <Text style={[styles.pickerOptionText, isSelected && { color: activeColor, fontWeight: "700" }]}>
                      {item.label}
                    </Text>
                    {isSelected ? <Ionicons name="checkmark" size={18} color={activeColor} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerTitle: { ...typography.h2 },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...shadow.sm,
  },
  headerActionText: { color: colors.textInverse, fontWeight: "700", fontSize: 13 },
  selectorCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.sm,
  },
  selectorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  selectorEyebrow: { fontSize: 11, color: colors.textLight, textTransform: "uppercase", letterSpacing: 0.6 },
  selectorValue: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 2 },
  selectorHelper: { fontSize: 12, color: colors.textSecondary, maxWidth: 120, textAlign: "right" },
  selectorTabs: { flexDirection: "row", gap: spacing.sm, paddingRight: spacing.sm },
  selectorTab: {
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorTabText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  selectorTabTextActive: { color: colors.textInverse },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  summaryValue: { fontSize: 24, fontWeight: "800", color: colors.text },
  summaryTitle: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginTop: 2 },
  summaryHelper: { fontSize: 11, color: colors.textLight, marginTop: 4 },
  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  sectionSubtitle: { fontSize: 12, color: colors.textLight },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadow.sm,
  },
  field: { gap: 6 },
  fieldHeader: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  fieldHint: { fontSize: 11, color: colors.textLight },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    minHeight: 44,
  },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  optionChipTextActive: { color: colors.textInverse },
  // ModalPicker
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    minHeight: 44,
  },
  pickerTriggerText: { fontSize: 15, color: colors.text, flexShrink: 1, flexGrow: 1, marginRight: 8 },
  pickerPlaceholder: { color: colors.textLight },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 32,
  },
  pickerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginVertical: 12,
  },
  pickerList: { flexGrow: 0 },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: { fontSize: 15, color: colors.text, flex: 1 },
  pickerCustomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerCustomInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    minHeight: 40,
  },
  pickerCustomConfirm: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerCustomConfirmText: { color: colors.textInverse, fontWeight: "700", fontSize: 13 },
});
