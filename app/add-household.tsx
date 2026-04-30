import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,
         ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { Colors } from '@/constants/Colors';
import { saveHousehold } from '@/utils/storage';
import type { Household } from '@/types';

export default function AddHouseholdScreen() {
  const router = useRouter();
  const { villageId } = useLocalSearchParams<{ villageId: string }>();
  const [headName, setHeadName]       = useState('');
  const [address, setAddress]         = useState('');
  const [totalMembers, setTotalMembers] = useState('');
  const [saving, setSaving]           = useState(false);

  async function handleSubmit() {
    if (!headName.trim()) { Alert.alert('Enter head of household name'); return; }
    if (!address.trim())  { Alert.alert('Enter address'); return; }
    setSaving(true);
    try {
      const household: Household = {
        id: Crypto.randomUUID(),
        villageId: villageId!,
        headName: headName.trim(),
        address: address.trim(),
        totalMembers: Number(totalMembers) || 1,
      };
      await saveHousehold(household);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save household.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.title}>Add Household</Text>
        </View>

        <View style={s.field}>
          <Text style={s.label}>Head of Household</Text>
          <TextInput style={s.input} placeholder="e.g. Raju Kumar"
            placeholderTextColor={Colors.placeholder}
            value={headName} onChangeText={setHeadName} autoCapitalize="words" />
        </View>

        <View style={s.field}>
          <Text style={s.label}>Address / House No.</Text>
          <TextInput style={s.input} placeholder="e.g. #12, Main Street"
            placeholderTextColor={Colors.placeholder}
            value={address} onChangeText={setAddress} />
        </View>

        <View style={s.field}>
          <Text style={s.label}>Total Members</Text>
          <TextInput style={[s.input, { width: 100 }]} placeholder="e.g. 4"
            placeholderTextColor={Colors.placeholder}
            value={totalMembers} onChangeText={setTotalMembers} keyboardType="numeric" maxLength={2} />
        </View>

        <TouchableOpacity style={[s.button, saving && s.buttonDisabled]}
          onPress={handleSubmit} disabled={saving}>
          {saving
            ? <ActivityIndicator color={Colors.primaryText} />
            : <Text style={s.buttonText}>Save Household</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex:          { flex: 1, backgroundColor: Colors.background },
  container:     { padding: 24, paddingBottom: 48 },
  header:        { marginBottom: 28 },
  title:         { fontSize: 26, fontWeight: '700', color: Colors.text },
  field:         { marginBottom: 20 },
  label:         { fontSize: 13, fontWeight: '600', color: Colors.textMuted,
                   textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input:         { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
                   borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13,
                   fontSize: 16, color: Colors.text },
  button:        { backgroundColor: Colors.primary, borderRadius: 12,
                   paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled:{ opacity: 0.6 },
  buttonText:    { color: Colors.primaryText, fontSize: 16, fontWeight: '700' },
});