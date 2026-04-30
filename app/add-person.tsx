// ─────────────────────────────────────────────────────────────
// app/add-person.tsx
// Screen — register a new village resident (Person)
// ─────────────────────────────────────────────────────────────
import Config from '@/constants/Config';
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';

import { Colors } from '@/constants/Colors';
import { savePerson } from '@/utils/storage';
import type { Gender, Person } from '@/types';

// ── Constants ─────────────────────────────────────────────────
const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Other'];

// ── Component ─────────────────────────────────────────────────
export default function AddPersonScreen() {
  const router = useRouter();
  const { householdId } = useLocalSearchParams<{ householdId: string }>();

  const [name, setName]     = useState('');
  const [age, setAge]       = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [saving, setSaving] = useState(false);

  function validate(): string | null {
    if (!name.trim())
      return "Please enter the patient's name.";
    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120)
      return 'Please enter a valid age (1 – 120).';
    if (!gender)
      return 'Please select a gender.';
    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) { Alert.alert('Missing Information', error); return; }

    setSaving(true);
    try {
      const newPerson: Person = {
        id:          Crypto.randomUUID(),
        householdId: householdId!,        // ← added this line
        name:        name.trim(),
        age:         Number(age),
        gender:      gender!,
      };
      await savePerson(newPerson);
      router.back();
    } catch (err) {
      Alert.alert('Save Failed', 'Could not save the record. Please try again.');
      console.error('[AddPerson]', err);
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
          <Text style={styles.title}>New Patient</Text>
          <Text style={styles.subtitle}>Enter the resident's basic details.</Text>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Meera Devi"
            placeholderTextColor={Colors.placeholder}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Age */}
        <View style={styles.field}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={[styles.input, styles.inputShort]}
            placeholder="e.g. 45"
            placeholderTextColor={Colors.placeholder}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            maxLength={3}
            returnKeyType="done"
          />
        </View>

        {/* Gender */}
        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.genderChip, gender === option && styles.genderChipSelected]}
                onPress={() => setGender(option)}
                accessibilityRole="radio"
                accessibilityState={{ checked: gender === option }}
              >
                <Text style={[
                  styles.genderChipText,
                  gender === option && styles.genderChipTextSelected,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
            : <Text style={styles.buttonText}>Save Patient</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: Colors.background },
  container:   { padding: 24, paddingBottom: 48 },

  header:      { marginBottom: 32 },
  title:       { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subtitle:    { fontSize: 15, color: Colors.textMuted },

  field:       { marginBottom: 24 },
  label:       {
    fontSize: 13, fontWeight: '600', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },

  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 16, color: Colors.text,
  },
  inputShort:  { width: 120 },

  genderRow:   { flexDirection: 'row', gap: 10 },
  genderChip:  {
    flex: 1, paddingVertical: 11, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surfaceOffset, alignItems: 'center',
  },
  genderChipSelected:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  genderChipText:         { fontSize: 15, fontWeight: '500', color: Colors.text },
  genderChipTextSelected: { color: Colors.primaryText, fontWeight: '600' },

  button:         {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: Colors.primaryText, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});