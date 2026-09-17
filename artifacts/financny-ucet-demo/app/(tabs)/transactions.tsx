import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Transaction, useAccount } from '@/context/AccountContext';
import { useColors } from '@/hooks/useColors';

const formatMoney = (value: number) =>
  `${value.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const formatDateLong = (date: string) =>
  new Date(date).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long' });

function ActivityRow({ transaction, onPress }: { transaction: Transaction; onPress: () => void }) {
  const colors = useColors();
  const income = transaction.kind === 'income';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={[styles.icon, { backgroundColor: income ? colors.secondary : colors.muted }]}>
        <Feather name={income ? 'arrow-down-left' : 'arrow-up-right'} size={18} color={income ? colors.primary : colors.foreground} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{transaction.title}</Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>{transaction.category} · {formatDateLong(transaction.date)}</Text>
      </View>
      <Text style={[styles.amount, { color: income ? colors.primary : colors.foreground }]}>
        {income ? '+' : '−'}{formatMoney(transaction.amount)}
      </Text>
    </Pressable>
  );
}

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { transactions } = useAccount();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const filtered = useMemo(
    () => filter === 'all' ? transactions : transactions.filter((item) => item.kind === filter),
    [filter, transactions],
  );
  const incomeTotal = transactions.filter((item) => item.kind === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = transactions.filter((item) => item.kind === 'expense').reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 112, paddingHorizontal: 20, paddingTop: insets.top + 18 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>PREHĽAD ÚČTU</Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>Aktivity</Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="analytics-outline" size={23} color={colors.primary} />
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Prijaté</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>+{formatMoney(incomeTotal)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Výdavky</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>−{formatMoney(expenseTotal)}</Text>
          </View>
        </View>

        <View style={[styles.filterTrack, { backgroundColor: colors.muted }]}>
          {([
            ['all', 'Všetky'],
            ['income', 'Prijaté'],
            ['expense', 'Výdavky'],
          ] as const).map(([value, label]) => (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              style={[styles.filterButton, filter === value && { backgroundColor: colors.card }]}
            >
              <Text style={[styles.filterText, { color: filter === value ? colors.primary : colors.mutedForeground }]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.monthLabel, { color: colors.foreground }]}>September 2026</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="inbox" size={26} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Žiadne pohyby</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>V tejto kategórii zatiaľ nič nie je.</Text>
            </View>
          ) : filtered.map((transaction) => (
            <ActivityRow
              key={transaction.id}
              transaction={transaction}
              onPress={() => router.push(`/transaction/${transaction.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 23 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.35, marginBottom: 5 },
  heading: { fontFamily: 'Inter_700Bold', fontSize: 29, letterSpacing: -0.7 },
  headerIcon: { alignItems: 'center', borderRadius: 16, height: 48, justifyContent: 'center', width: 48 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 19 },
  summaryCard: { borderRadius: 17, borderWidth: 1, flex: 1, padding: 15 },
  summaryLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 7 },
  summaryValue: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  filterTrack: { borderRadius: 14, flexDirection: 'row', marginBottom: 26, padding: 4 },
  filterButton: { alignItems: 'center', borderRadius: 11, flex: 1, paddingVertical: 10 },
  filterText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  monthLabel: { fontFamily: 'Inter_700Bold', fontSize: 17, marginBottom: 11 },
  listCard: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 15 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 78 },
  icon: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  copy: { flex: 1, minWidth: 0 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 4 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  amount: { fontFamily: 'Inter_700Bold', fontSize: 13, textAlign: 'right' },
  empty: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 44 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, marginTop: 12 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5, textAlign: 'center' },
});