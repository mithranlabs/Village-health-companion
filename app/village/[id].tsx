import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity,
         StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { getHouseholdsForVillage, getPersonsForHousehold } from '@/utils/storage';
import type { Household } from '@/types';

export default function VillageScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [counts, setCounts]         = useState<Record<string, number>>({});
  const [loading, setLoading]       = useState(true);

  const loadData = useCallback(async () => {
    const hh = await getHouseholdsForVillage(id!);
    const countMap: Record<string, number> = {};
    await Promise.all(hh.map(async (h) => {
      const persons = await getPersonsForHousehold(h.id);
      countMap[h.id] = persons.length;
    }));
    setHouseholds(hh);
    setCounts(countMap);
    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => { setLoading(true); loadData(); }, [loadData]));

  if (loading) return <View style={s.centered}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <View style={s.flex}>
      <FlatList
        data={households}
        keyExtractor={(h) => h.id}
        contentContainerStyle={[s.list, households.length === 0 && s.listEmpty]}
        ListHeaderComponent={
          households.length > 0
            ? <Text style={s.listHeader}>{households.length} household{households.length !== 1 ? 's' : ''} in {name}</Text>
            : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card}
            onPress={() => router.push({ pathname: '/household/[id]' as any, params: { id: item.id, address: item.address } })}>
            <Text style={s.cardHead}>{item.headName}</Text>
            <Text style={s.cardAddress}>{item.address}</Text>
            <Text style={s.cardCount}>
              {counts[item.id] ?? 0} member{(counts[item.id] ?? 0) !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏠</Text>
            <Text style={s.emptyTitle}>No households yet</Text>
            <Text style={s.emptySubtitle}>Tap "Add Household" to register one.</Text>
          </View>
        }
      />
      <TouchableOpacity style={s.fab}
        onPress={() => router.push({ pathname: '/add-household' as any, params: { villageId: id } })}>
        <Text style={s.fabText}>+ Add Household</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: Colors.background },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list:        { padding: 16, paddingBottom: 100 },
  listEmpty:   { flex: 1 },
  listHeader:  { fontSize: 13, fontWeight: '600', color: Colors.textMuted,
                 textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  card:        { backgroundColor: Colors.surface, borderRadius: 12,
                 borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10 },
  cardHead:    { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardAddress: { fontSize: 13, color: Colors.textMuted, marginBottom: 4 },
  cardCount:   { fontSize: 13, fontWeight: '600', color: Colors.primary },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon:   { fontSize: 48, marginBottom: 16 },
  emptyTitle:  { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },
  fab:         { position: 'absolute', bottom: 28, right: 20, left: 20,
                 backgroundColor: Colors.primary, borderRadius: 14,
                 paddingVertical: 16, alignItems: 'center', elevation: 6 },
  fabText:     { color: Colors.primaryText, fontSize: 16, fontWeight: '700' },
});