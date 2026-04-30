// Screen shown on first launch — pick ASHA identity (no password)
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { Colors } from '@/constants/Colors';
import { getASHAWorkers, saveASHAWorker, setActiveSession } from '@/utils/storage';
import type { ASHAWorker } from '@/types';

export default function SelectWorkerScreen() {
  const router = useRouter();
  const [workers, setWorkers]   = useState<ASHAWorker[]>([]);
  const [loading, setLoading]   = useState(true);
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [adding, setAdding]     = useState(false);

  useEffect(() => {
    getASHAWorkers().then((w) => { setWorkers(w); setLoading(false); });
  }, []);

  async function handleSelect(worker: ASHAWorker) {
    await setActiveSession({ ashaId: worker.id, ashaName: worker.name });
    router.replace('/');
  }

  async function handleAdd() {
    if (!name.trim()) { Alert.alert('Enter your name'); return; }
    setAdding(true);
    const worker: ASHAWorker = {
      id: Crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
      villageIds: [],
    };
    await saveASHAWorker(worker);
    await setActiveSession({ ashaId: worker.id, ashaName: worker.name });
    router.replace('/');
  }

  if (loading) return <View style={s.centered}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <View style={s.flex}>
      <View style={s.header}>
        <Text style={s.title}>Who are you?</Text>
        <Text style={s.subtitle}>Select your name or register below.</Text>
      </View>

      <FlatList
        data={workers}
        keyExtractor={(w) => w.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => handleSelect(item)}>
            <Text style={s.cardName}>{item.name}</Text>
            {item.phone ? <Text style={s.cardMeta}>{item.phone}</Text> : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={s.empty}>No workers registered yet.</Text>}
      />

      <View style={s.form}>
        <Text style={s.label}>Register as new ASHA worker</Text>
        <TextInput style={s.input} placeholder="Your full name"
          placeholderTextColor={Colors.placeholder}
          value={name} onChangeText={setName} autoCapitalize="words" />
        <TextInput style={s.input} placeholder="Phone number (optional)"
          placeholderTextColor={Colors.placeholder}
          value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TouchableOpacity style={[s.button, adding && s.buttonDisabled]}
          onPress={handleAdd} disabled={adding}>
          {adding
            ? <ActivityIndicator color={Colors.primaryText} />
            : <Text style={s.buttonText}>Register &amp; Continue</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flex:          { flex: 1, backgroundColor: Colors.background },
  centered:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:        { padding: 24, paddingBottom: 8 },
  title:         { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subtitle:      { fontSize: 15, color: Colors.textMuted },
  list:          { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  card:          { backgroundColor: Colors.surface, borderRadius: 12,
                   borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 10 },
  cardName:      { fontSize: 17, fontWeight: '700', color: Colors.text },
  cardMeta:      { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  empty:         { textAlign: 'center', color: Colors.textMuted, marginTop: 24 },
  form:          { padding: 20, borderTopWidth: 1, borderColor: Colors.border,
                   backgroundColor: Colors.surface, gap: 10 },
  label:         { fontSize: 13, fontWeight: '600', color: Colors.textMuted,
                   textTransform: 'uppercase', letterSpacing: 0.8 },
  input:         { backgroundColor: Colors.background, borderWidth: 1,
                   borderColor: Colors.border, borderRadius: 10,
                   paddingHorizontal: 14, paddingVertical: 12,
                   fontSize: 16, color: Colors.text },
  button:        { backgroundColor: Colors.primary, borderRadius: 12,
                   paddingVertical: 14, alignItems: 'center' },
  buttonDisabled:{ opacity: 0.6 },
  buttonText:    { color: Colors.primaryText, fontSize: 16, fontWeight: '700' },
});