// ─────────────────────────────────────────────────────────────
// app/add-visit.tsx
// Screen — record a health visit for an existing patient.
//
// Route params:
//   personId   string  (required) — the patient's UUID
//   personName string  (optional) — displayed in the header
//
// Business logic:
//   • bloodPressure > 140  →  hasAlert = true  (ML hook later)
//   • isSynced always starts as false
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import Config from '@/constants/Config';

import { Colors } from '@/constants/Colors';
import { getActiveSession, saveVisit } from '@/utils/storage';
import type { Visit } from '@/types';

// ── Constants ─────────────────────────────────────────────────
/** Threshold above which a visit is auto-flagged. Replace with ML call later. */
const BP_ALERT_THRESHOLD = 140;

// ── Component ─────────────────────────────────────────────────
export default function AddVisitScreen() {
  const router = useRouter();
  const { personId, personName } = useLocalSearchParams<{
    personId: string;
    personName?: string;
  }>();

  const [bloodPressure, setBloodPressure] = useState('');
  const [weight, setWeight]               = useState('');
  const [saving, setSaving]               = useState(false);

  // Live alert preview while the user types
  const bpValue  = Number(bloodPressure);
  const bpIsHigh = bloodPressure !== '' && !isNaN(bpValue) && bpValue > BP_ALERT_THRESHOLD;

  function validate(): string | null {
    if (!personId)
      return 'No patient selected. Please go back and try again.';
    if (!bloodPressure.trim() || isNaN(bpValue) || bpValue < 40 || bpValue > 300)
      return 'Enter a valid systolic blood pressure (40 – 300 mmHg).';
    const wt = Number(weight);
    if (!weight.trim() || isNaN(wt) || wt <= 0 || wt > 500)
      return 'Enter a valid weight (1 – 500 kg).';
    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) { Alert.alert('Missing Information', error); return; }

    setSaving(true);
    try {
      const session = await getActiveSession(); // Fetch session before creating

      const newVisit: Visit = {
        id:            Crypto.randomUUID(),
        personId:      personId!,
        ashaId:        session?.ashaId ?? 'unknown',   // ← added this line
        date:          new Date().toISOString(),
        bloodPressure: bpValue,
        weight:        Number(weight),
        isSynced:      false,
        hasAlert:      bpValue > Config.BP_ALERT_THRESHOLD, // Or just use BP_ALERT_THRESHOLD from file
      };
      await saveVisit(newVisit);
      router.back();
    // In handleSubmit, change the catch block to:
} catch (err) {
  Alert.alert('Save Failed', String(err));  // ← show the actual error
  console.error('[AddVisit]', err);
} finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Record Visit</Text>
          {personName
            ? <Text style={styles.subtitle}>Patient: {personName}</Text>
            : null}
        </View>

        {/* Blood Pressure */}
        <View style={styles.field}>
          <Text style={styles.label}>Systolic Blood Pressure</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputMedium]}
              placeholder="e.g. 120"
              placeholderTextColor={Colors.placeholder}
              value={bloodPressure}
              onChangeText={setBloodPressure}
              keyboardType="numeric"
              maxLength={3}
              returnKeyType="next"
            />
            <Text style={styles.unit}>mmHg</Text>
          </View>

          {/* Live high-BP warning */}
          {bpIsHigh && (
            <View style={styles.alertBanner}>
              <Text style={styles.alertIcon}>⚠</Text>
              <Text style={styles.alertText}>
                BP above {BP_ALERT_THRESHOLD} mmHg — this visit will be flagged for follow-up.
              </Text>
            </View>
          )}
        </View>

        {/* Weight */}
        <View style={styles.field}>
          <Text style={styles.label}>Weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputMedium]}
              placeholder="e.g. 62"
              placeholderTextColor={Colors.placeholder}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              maxLength={5}
              returnKeyType="done"
            />
            <Text style={styles.unit}>kg</Text>
          </View>
        </View>

        {/* Offline sync note */}
        <View style={styles.syncNote}>
          <Text style={styles.syncNoteText}>
            Saved offline. Will sync automatically when connectivity is available.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
          accessibilityRole="button"
        >
          {saving
            ? <ActivityIndicator color={Colors.primaryText} />
            : <Text style={styles.buttonText}>Save Visit</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24, paddingBottom: 48 },

  header:   { marginBottom: 32 },
  title:    { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: Colors.textMuted },

  field: { marginBottom: 24 },
  label: {
    fontSize: 13, fontWeight: '600', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },

  inputRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 16, color: Colors.text,
  },
  inputMedium: { width: 130 },
  unit:        { fontSize: 15, color: Colors.textMuted, fontWeight: '500' },

  alertBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10,
    backgroundColor: Colors.alertBg, borderWidth: 1, borderColor: Colors.alertBorder,
    borderRadius: 10, padding: 12,
  },
  alertIcon: { fontSize: 15, color: Colors.alertIcon, lineHeight: 20 },
  alertText: { flex: 1, fontSize: 13, color: Colors.alertText, lineHeight: 19 },

  syncNote:     {
    backgroundColor: Colors.surfaceOffset, borderRadius: 10,
    padding: 12, marginBottom: 24,
  },
  syncNoteText: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },

  button:         {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: Colors.primaryText, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});