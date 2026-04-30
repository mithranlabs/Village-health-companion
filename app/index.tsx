import { Colors } from '@/constants/Colors';
import { useStrings } from '@/hooks/useStrings';
import type { ActiveSession, Village } from '@/types';
import {
  getActiveSession,
  getASHAWorkers,
  getHouseholds,
  getPersons,
  getVillages,
} from '@/utils/storage';
import { syncToSupabase } from '@/utils/sync';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { lang, setLang, t } = useStrings();

  const [session, setSession]   = useState<ActiveSession | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [counts, setCounts]     = useState<Record<string, number>>({});
  const [loading, setLoading]   = useState(true);
  const [syncing, setSyncing]   = useState(false);

  const loadData = useCallback(async () => {
    const sess = await getActiveSession();
    if (!sess) { router.replace('/select-worker' as any); return; }
    setSession(sess);

    const [allVillages, households, persons] = await Promise.all([
      getVillages(), getHouseholds(), getPersons(),
    ]);

    const workers = await getASHAWorkers();
    const me = workers.find((w) => w.id === sess.ashaId);
    const myVillages = me?.villageIds.length
      ? allVillages.filter((v: Village) => me.villageIds.includes(v.id))
      : allVillages;

    const householdMap: Record<string, string> = {};
    households.forEach((h) => { householdMap[h.id] = h.villageId; });

    const personCount: Record<string, number> = {};
    persons.forEach((p) => {
      const vId = householdMap[p.householdId];
      if (vId) personCount[vId] = (personCount[vId] ?? 0) + 1;
    });

    setVillages(myVillages);
    setCounts(personCount);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadData();
  }, [loadData]));

  const handleSync = async () => {
    setSyncing(true);
    const result = await syncToSupabase();
    setSyncing(false);
    if (result.success) {
      Alert.alert('Synced! ☁️', result.synced === 0
        ? 'Everything is already up to date.'
        : `${result.synced} visit${result.synced > 1 ? 's' : ''} sent to dashboard.`
      );
    } else {
      Alert.alert('Sync Failed', result.error ?? 'Unknown error');
    }
  };

  if (loading) return (
    <View style={s.centered}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  return (
    <View style={s.flex}>
      {/* Worker banner */}
      <View style={s.banner}>
        <Text style={s.bannerText}>👤 {session?.ashaName}</Text>
        <View style={s.bannerRight}>
          <TouchableOpacity
            style={s.langToggle}
            onPress={() => setLang(lang === 'en' ? 'hi' : 'en')}
          >
            <Text style={s.langToggleText}>{lang === 'en' ? 'हिं' : 'EN'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/select-worker' as any)}>
            <Text style={s.switchText}>{t.switch}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={villages}
        keyExtractor={(v) => v.id}
        contentContainerStyle={[s.list, villages.length === 0 && s.listEmpty]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => router.push({
              pathname: '/village/[id]' as any,
              params: { id: item.id, name: item.name },
            })}
          >
            <Text style={s.cardName}>{item.name}</Text>
            <Text style={s.cardMeta}>{item.block} · {item.district}</Text>
            <Text style={s.cardCount}>
              {counts[item.id] ?? 0} {t.patients}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏘️</Text>
            <Text style={s.emptyTitle}>{t.noVillages}</Text>
            <Text style={s.emptySubtitle}>{t.noVillagesHint}</Text>
          </View>
        }
      />

      {/* Sync button */}
      <TouchableOpacity
        style={[s.syncBtn, syncing && s.syncBtnDisabled]}
        onPress={handleSync}
        disabled={syncing}
      >
        {syncing
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={s.syncBtnText}>☁️ Sync to Dashboard</Text>
        }
      </TouchableOpacity>

      {/* Add village FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => router.push('/add-village' as any)}
      >
        <Text style={s.fabText}>{t.addVillage}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  flex:            { flex: 1, backgroundColor: Colors.background },
  centered:        { flex: 1, justifyContent: 'center', alignItems: 'center',
                     backgroundColor: Colors.background },
  banner:          { flexDirection: 'row', justifyContent: 'space-between',
                     alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12,
                     backgroundColor: Colors.surface, borderBottomWidth: 1,
                     borderColor: Colors.border },
  bannerText:      { fontSize: 14, fontWeight: '600', color: Colors.text },
  bannerRight:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langToggle:      { backgroundColor: Colors.primary, borderRadius: 8,
                     paddingHorizontal: 10, paddingVertical: 4 },
  langToggleText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
  switchText:      { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  list:            { padding: 16, paddingBottom: 160 },
  listEmpty:       { flex: 1 },
  card:            { backgroundColor: Colors.surface, borderRadius: 12,
                     borderWidth: 1, borderColor: Colors.border,
                     padding: 16, marginBottom: 10 },
  cardName:        { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardMeta:        { fontSize: 13, color: Colors.textMuted, marginBottom: 4 },
  cardCount:       { fontSize: 13, fontWeight: '600', color: Colors.primary },
  empty:           { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon:       { fontSize: 48, marginBottom: 16 },
  emptyTitle:      { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptySubtitle:   { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },
  syncBtn:         { position: 'absolute', bottom: 88, right: 20, left: 20,
                     backgroundColor: '#0891b2', borderRadius: 14,
                     paddingVertical: 13, alignItems: 'center' },
  syncBtnDisabled: { opacity: 0.6 },
  syncBtnText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  fab:             { position: 'absolute', bottom: 28, right: 20, left: 20,
                     backgroundColor: Colors.primary, borderRadius: 14,
                     paddingVertical: 16, alignItems: 'center',
                     shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
                     shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  fabText:         { color: Colors.primaryText, fontSize: 16, fontWeight: '700' },
});