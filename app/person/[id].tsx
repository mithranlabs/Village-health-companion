// app/person/[id].tsx
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity,
         StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getVisitsForPerson, getPersonById } from '@/utils/storage';
import type { Visit, Person } from '@/types';

const C = {
  background: '#F7F6F2', surface: '#FFFFFF', border: '#D4D1CA',
  text: '#28251D', textMuted: '#7A7974',
  primary: '#01696F', primaryText: '#FFFFFF', surfaceOffset: '#F3F0EC',
  alertBg: '#FFF4EC', alertBorder: '#F5C6A0', alertText: '#964219',
  success: '#437A22',
};

export default function PersonScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [person, setPerson]   = useState<Person | null>(null);
  const [visits, setVisits]   = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [p, v] = await Promise.all([
      getPersonById(id!),
      getVisitsForPerson(id!),
    ]);
    setPerson(p);
    setVisits(v);
    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => { setLoading(true); loadData(); }, [loadData]));

  if (loading) return (
    <View style={s.centered}><ActivityIndicator color={C.primary} /></View>
  );

  return (
    <View style={s.flex}>
      {/* Person summary */}
      {person && (
        <View style={s.summaryCard}>
          <Text style={s.summaryName}>{person.name}</Text>
          <Text style={s.summaryMeta}>{person.age} yrs · {person.gender}</Text>
          {person.phone ? <Text style={s.summaryMeta}>📞 {person.phone}</Text> : null}
        </View>
      )}

      <FlatList
        data={visits}
        keyExtractor={(v) => v.id}
        contentContainerStyle={[s.list, visits.length === 0 && s.listEmpty]}
        ListHeaderComponent={
          visits.length > 0
            ? <Text style={s.listHeader}>
                {visits.length} visit{visits.length !== 1 ? 's' : ''} recorded
              </Text>
            : null
        }
        renderItem={({ item }) => (
          <View style={[s.visitCard, item.hasAlert && s.visitCardAlert]}>
            <View style={s.visitHeader}>
              <Text style={s.visitDate}>
                {new Date(item.date).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </Text>
              {/* Sync indicator dot */}
              <View style={[s.syncDot, item.isSynced ? s.syncGreen : s.syncGrey]} />
            </View>

            <View style={s.vitalsRow}>
              <View style={[s.vitalBox, item.hasAlert && s.vitalBoxAlert]}>
                <Text style={s.vitalValue}>{item.bloodPressure}</Text>
                <Text style={s.vitalLabel}>mmHg BP</Text>
              </View>
              <View style={s.vitalBox}>
                <Text style={s.vitalValue}>{item.weight}</Text>
                <Text style={s.vitalLabel}>kg Weight</Text>
              </View>
            </View>

            {item.hasAlert && (
              <View style={s.alertTag}>
                <Text style={s.alertTagText}>⚠ High BP — follow-up required</Text>
              </View>
            )}
            {item.notes ? <Text style={s.notes}>{item.notes}</Text> : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyTitle}>No visits yet</Text>
            <Text style={s.emptySubtitle}>Tap "Record Visit" to log the first visit.</Text>
          </View>
        }
      />

      <TouchableOpacity style={s.fab}
        onPress={() => router.push({ pathname: '/add-visit',
          params: { personId: id, personName: name } })}>
        <Text style={s.fabText}>+ Record Visit</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  flex:           { flex: 1, backgroundColor: C.background },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  summaryCard:    { margin: 16, marginBottom: 0, backgroundColor: C.surface, borderRadius: 12,
                    borderWidth: 1, borderColor: C.border, padding: 16 },
  summaryName:    { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 4 },
  summaryMeta:    { fontSize: 14, color: C.textMuted, marginTop: 2 },
  list:           { padding: 16, paddingBottom: 100 },
  listEmpty:      { flex: 1 },
  listHeader:     { fontSize: 13, fontWeight: '600', color: C.textMuted,
                    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  visitCard:      { backgroundColor: C.surface, borderRadius: 12,
                    borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 },
  visitCardAlert: { borderColor: C.alertBorder, backgroundColor: C.alertBg },
  visitHeader:    { flexDirection: 'row', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 12 },
  visitDate:      { fontSize: 13, color: C.textMuted, fontWeight: '500' },
  syncDot:        { width: 8, height: 8, borderRadius: 4 },
  syncGreen:      { backgroundColor: C.success },
  syncGrey:       { backgroundColor: C.border },
  vitalsRow:      { flexDirection: 'row', gap: 10, marginBottom: 8 },
  vitalBox:       { flex: 1, backgroundColor: C.surfaceOffset, borderRadius: 10,
                    padding: 12, alignItems: 'center' },
  vitalBoxAlert:  { backgroundColor: '#FDEBD0' },
  vitalValue:     { fontSize: 22, fontWeight: '700', color: C.text },
  vitalLabel:     { fontSize: 12, color: C.textMuted, marginTop: 2 },
  alertTag:       { backgroundColor: C.alertBg, borderRadius: 8,
                    paddingHorizontal: 10, paddingVertical: 6, marginTop: 4 },
  alertTagText:   { fontSize: 13, color: C.alertText, fontWeight: '600' },
  notes:          { fontSize: 13, color: C.textMuted, marginTop: 8, fontStyle: 'italic' },
  empty:          { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon:      { fontSize: 48, marginBottom: 16 },
  emptyTitle:     { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptySubtitle:  { fontSize: 15, color: C.textMuted, textAlign: 'center' },
  fab:            { position: 'absolute', bottom: 28, right: 20, left: 20,
                    backgroundColor: C.primary, borderRadius: 14,
                    paddingVertical: 16, alignItems: 'center', elevation: 6 },
  fabText:        { color: C.primaryText, fontSize: 16, fontWeight: '700' },
});