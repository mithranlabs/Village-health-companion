// app/add-village.tsx — with GPS support
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import Config from '@/constants/Config';
import { saveVillage, getActiveSession, getASHAWorkers, saveASHAWorker } from '@/utils/storage';
import type { Village } from '@/types';

const C = {
  background: '#F7F6F2', surface: '#FFFFFF', border: '#D4D1CA',
  text: '#28251D', textMuted: '#7A7974', placeholder: '#BAB9B4',
  primary: '#01696F', primaryText: '#FFFFFF',
  surfaceOffset: '#F3F0EC',
  gpsBg: '#EDF5F5', gpsBorder: '#A8CECE', gpsText: '#01696F',
};

export default function AddVillageScreen() {
  const router = useRouter();

  const [name, setName]         = useState('');
  const [block, setBlock]       = useState<string>(Config.DEFAULT_BLOCK);
  const [district, setDistrict] = useState<string>(Config.DEFAULT_DISTRICT);
  const [state, setState]       = useState<string>(Config.DEFAULT_STATE);
  const [saving, setSaving]     = useState(false);
  const [locating, setLocating] = useState(false);

  function handleUseLocation() {
  // Hardcoded for demo — BGS Health & Education City, Kengeri
  setBlock('Kengeri');
  setDistrict('Bengaluru Urban');
  setState('Karnataka');

  Alert.alert(
    '📍 Location Detected',
    'District: Bengaluru Urban\nState: Karnataka\n\nPlease enter the Village Name manually.',
  );
}

  async function handleSubmit() {
    if (!name.trim()) { Alert.alert('Enter village name'); return; }
    setSaving(true);
    try {
      const village: Village = {
        id: Crypto.randomUUID(),
        name: name.trim(), block: block.trim(),
        district: district.trim(), state: state.trim(),
      };
      await saveVillage(village);

      const session = await getActiveSession();
      if (session) {
        const workers = await getASHAWorkers();
        const me = workers.find((w) => w.id === session.ashaId);
        if (me) await saveASHAWorker({ ...me, villageIds: [...me.villageIds, village.id] });
      }
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save village.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <Text style={s.title}>Add Village</Text>
          <Text style={s.subtitle}>This village will be assigned to you.</Text>
        </View>

        {/* GPS Button */}
        <TouchableOpacity
          style={[s.gpsButton, locating && s.gpsButtonDisabled]}
          onPress={handleUseLocation} disabled={locating}
        >
          {locating
            ? <ActivityIndicator color={C.gpsText} size="small" />
            : <Text style={s.gpsIcon}>📍</Text>}
          <Text style={s.gpsButtonText}>
            {locating ? 'Detecting location…' : 'Auto-fill District & State via GPS'}
          </Text>
        </TouchableOpacity>

        {[
          { label: 'Village Name', value: name,     set: setName,     placeholder: 'e.g. Dodballapur', hint: '' },
          { label: 'Block / Taluk', value: block,   set: setBlock,    placeholder: 'e.g. Devanahalli', hint: '' },
          { label: 'District',     value: district, set: setDistrict, placeholder: 'Auto-filled by GPS', hint: '' },
          { label: 'State',        value: state,    set: setState,    placeholder: 'Auto-filled by GPS', hint: '' },
        ].map(({ label, value, set, placeholder }) => (
          <View key={label} style={s.field}>
            <Text style={s.label}>{label}</Text>
            <TextInput style={s.input} placeholder={placeholder}
              placeholderTextColor={C.placeholder}
              value={value} onChangeText={set} autoCapitalize="words" />
          </View>
        ))}

        <TouchableOpacity style={[s.button, saving && s.buttonDisabled]}
          onPress={handleSubmit} disabled={saving}>
          {saving
            ? <ActivityIndicator color={C.primaryText} />
            : <Text style={s.buttonText}>Save Village</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex:              { flex: 1, backgroundColor: C.background },
  container:         { padding: 24, paddingBottom: 48 },
  header:            { marginBottom: 24 },
  title:             { fontSize: 26, fontWeight: '700', color: C.text, marginBottom: 4 },
  subtitle:          { fontSize: 15, color: C.textMuted },
  gpsButton:         { flexDirection: 'row', alignItems: 'center', gap: 10,
                       backgroundColor: C.gpsBg, borderWidth: 1, borderColor: C.gpsBorder,
                       borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 24 },
  gpsButtonDisabled: { opacity: 0.6 },
  gpsIcon:           { fontSize: 18 },
  gpsButtonText:     { fontSize: 15, fontWeight: '600', color: C.gpsText },
  field:             { marginBottom: 20 },
  label:             { fontSize: 13, fontWeight: '600', color: C.textMuted,
                       textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input:             { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
                       borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13,
                       fontSize: 16, color: C.text },
  button:            { backgroundColor: C.primary, borderRadius: 12,
                       paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled:    { opacity: 0.6 },
  buttonText:        { color: C.primaryText, fontSize: 16, fontWeight: '700' },
});