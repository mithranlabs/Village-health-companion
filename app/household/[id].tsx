// app/household/[id].tsx
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity,
         StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getPersonsForHousehold, getVisitsForPerson } from '@/utils/storage';
import type { Person, Visit } from '@/types';
import Config from '@/constants/Config';

const C = {
  background: '#F7F6F2', surface: '#FFFFFF', border: '#D4D1CA',
  text: '#28251D', textMuted: '#7A7974', placeholder: '#BAB9B4',
  primary: '#01696F', primaryText: '#FFFFFF', surfaceOffset: '#F3F0EC',
  alertBg: '#FFF4EC', alertBorder: '#F5C6A0', alertText: '#964219',
  success: '#437A22',
};

interface PersonRow {
  person: Person;
  lastVisit: Visit | null;
  hasAlert: boolean;
  isOverdue: boolean;
}

export default function HouseholdScreen() {
  const router = useRouter();
  const { id, address } = useLocalSearchParams<{ id: string; address: string }>();
  const [rows, setRows]       = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const persons = await getPersonsForHousehold(id!);
    const built: PersonRow[] = await Promise.all(
      persons.map(async (person) => {
        const visits = await getVisitsForPerson(person.id);
        const last = visits[0] ?? null;
        const daysSince = last
          ? (Date.now() - new Date(last.date).getTime()) / 86_400_000
          : Infinity;
        return {
          person,
          lastVisit: last,
          hasAlert: visits.some((v) => v.hasAlert),
          isOverdue: daysSince > Config.VISIT_OVERDUE_DAYS,
        };
      }),
    );
    built.sort((a, b) => Number(b.hasAlert) - Number(a.hasAlert));
    setRows(built);
    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => { setLoading(true); loadData(); }, [loadData]));

  if (loading) return (
    <View style={s.centered}><ActivityIndicator color={C.primary} /></View>
  );

  return (
    <View style={s.flex}>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.person.id}
        contentContainerStyle={[s.list, rows.length === 0 && s.listEmpty]}
        ListHeaderComponent={
          rows.length > 0
            ? <Text style={s.listHeader}>
                {address} · {rows.length} member{rows.length !== 1 ? 's' : ''}
              </Text>
            : null
        }
        renderItem={({ item: { person, lastVisit, hasAlert, isOverdue } }) => (
          <TouchableOpacity
            style={[s.card, hasAlert && s.cardAlert]}
            onPress={() => router.push({
              pathname: '/person/[id]'as any,
              params: { id: person.id, name: person.name },
            })}
          >
            <View style={s.cardHeader}>
              <Text style={s.cardName}>{person.name}</Text>
              <View style={s.badges}>
                {hasAlert && (
                  <View style={s.badgeAlert}>
                    <Text style={s.badgeAlertText}>⚠ Alert</Text>
                  </View>
                )}
                {isOverdue && !hasAlert && (
                  <View style={s.badgeOverdue}>
                    <Text style={s.badgeOverdueText}>Overdue</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={s.cardMeta}>{person.age} yrs · {person.gender}</Text>
            {lastVisit
              ? <Text style={s.cardMeta}>
                  Last: {new Date(lastVisit.date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })} · {lastVisit.bloodPressure} mmHg · {lastVisit.weight} kg
                </Text>
              : <Text style={[s.cardMeta, s.italic]}>No visits recorded</Text>
            }
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>👤</Text>
            <Text style={s.emptyTitle}>No patients yet</Text>
            <Text style={s.emptySubtitle}>Tap "Add Patient" to register a member.</Text>
          </View>
        }
      />
      <TouchableOpacity style={s.fab}
        onPress={() => router.push({ pathname: '/add-person', params: { householdId: id } })}>
        <Text style={s.fabText}>+ Add Patient</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  flex:             { flex: 1, backgroundColor: C.background },
  centered:         { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  list:             { padding: 16, paddingBottom: 100 },
  listEmpty:        { flex: 1 },
  listHeader:       { fontSize: 13, fontWeight: '600', color: C.textMuted,
                      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  card:             { backgroundColor: C.surface, borderRadius: 12,
                      borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 },
  cardAlert:        { borderColor: C.alertBorder, backgroundColor: C.alertBg },
  cardHeader:       { flexDirection: 'row', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 4 },
  cardName:         { fontSize: 17, fontWeight: '700', color: C.text, flex: 1 },
  badges:           { flexDirection: 'row', gap: 6 },
  badgeAlert:       { backgroundColor: C.alertBorder, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeAlertText:   { fontSize: 11, fontWeight: '700', color: C.alertText },
  badgeOverdue:     { backgroundColor: C.surfaceOffset, borderRadius: 6, borderWidth: 1,
                      borderColor: C.border, paddingHorizontal: 8, paddingVertical: 3 },
  badgeOverdueText: { fontSize: 11, fontWeight: '600', color: C.textMuted },
  cardMeta:         { fontSize: 13, color: C.textMuted, marginTop: 2 },
  italic:           { fontStyle: 'italic' },
  empty:            { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon:        { fontSize: 48, marginBottom: 16 },
  emptyTitle:       { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptySubtitle:    { fontSize: 15, color: C.textMuted, textAlign: 'center' },
  fab:              { position: 'absolute', bottom: 28, right: 20, left: 20,
                      backgroundColor: C.primary, borderRadius: 14,
                      paddingVertical: 16, alignItems: 'center', elevation: 6 },
  fabText:          { color: C.primaryText, fontSize: 16, fontWeight: '700' },
});