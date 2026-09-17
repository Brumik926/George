import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccount, Transaction } from '@/context/AccountContext';
import { useColors } from '@/hooks/useColors';

const formatMoney = (value: number) =>
  `${value.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit' });

function TransactionRow({ transaction, onPress }: { transaction: Transaction; onPress: () => void }) {
  const colors = useColors();
  const isIncome = transaction.kind === 'income';
  return (
    <Pressable
      onPress={onPress}
      testID={`transaction-${transaction.id}`}
      style={({ pressed }) => [styles.transactionRow, { opacity: pressed ? 0.72 : 1 }]}
    >
      <View style={[styles.transactionIcon, { backgroundColor: isIncome ? colors.secondary : colors.muted }]}>
        <Feather
          name={isIncome ? 'arrow-down-left' : 'arrow-up-right'}
          size={18}
          color={isIncome ? colors.primary : colors.foreground}
        />
      </View>
      <View style={styles.transactionCopy}>
        <Text style={[styles.transactionTitle, { color: colors.foreground }]} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={[styles.transactionMeta, { color: colors.mutedForeground }]}>
          {transaction.subtitle} · {formatDate(transaction.date)}
        </Text>
      </View>
      <Text style={[styles.transactionAmount, { color: isIncome ? colors.primary : colors.foreground }]}>
        {isIncome ? '+' : '−'}{formatMoney(transaction.amount)}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { balance, transactions, isReady } = useAccount();

  const monthly = useMemo(() => {
    const income = transactions.filter((item) => item.kind === 'income').reduce((sum, item) => sum + item.amount, 0);
    const expense = transactions.filter((item) => item.kind === 'expense').reduce((sum, item) => sum + item.amount, 0);
    return { income, expense };
  }, [transactions]);

  if (!isReady) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>OSOBNÉ FINANCIE</Text>
            <Text style={[styles.greeting, { color: colors.foreground }]}>Dobrý deň, Jakub</Text>
          </View>
          <View style={[styles.demoBadge, { backgroundColor: colors.secondary }]}>
            <View style={[styles.demoDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.demoLabel, { color: colors.primary }]}>DEMO</Text>
          </View>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.cardOverline}>Dostupný zostatok</Text>
              <Text style={styles.balanceValue}>{formatMoney(balance)}</Text>
            </View>
            <View style={styles.walletMark}>
              <Ionicons name="wallet-outline" size={26} color={colors.primary} />
            </View>
          </View>
          <View style={styles.balanceFooter}>
            <Text style={styles.accountLabel}>Demo účet · •••• 4821</Text>
            <Text style={styles.accountLabel}>EUR</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => router.push('/payment')}
            testID="new-payment-button"
            style={({ pressed }) => [
              styles.primaryAction,
              { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 },
            ]}
          >
            <Feather name="arrow-up-right" size={18} color={colors.primaryForeground} />
            <Text style={[styles.primaryActionText, { color: colors.primaryForeground }]}>Nová platba</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/transactions')}
            testID="all-transactions-button"
            style={({ pressed }) => [
              styles.secondaryAction,
              { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <Feather name="bar-chart-2" size={18} color={colors.primary} />
            <Text style={[styles.secondaryActionText, { color: colors.foreground }]}>Prehľad</Text>
          </Pressable>
        </View>

        <View style={[styles.notice, { backgroundColor: colors.secondary }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
          <Text style={[styles.noticeText, { color: colors.secondaryForeground }]}>
            Toto je bezpečný finančný prototyp. Platby sa neposielajú do bankového systému.
          </Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tento mesiac</Text>
              <Text style={[styles.sectionCaption, { color: colors.mutedForeground }]}>September 2026</Text>
            </View>
            <Ionicons name="stats-chart-outline" size={21} color={colors.primary} />
          </View>
          <View style={styles.monthlyGrid}>
            <View style={styles.monthlyCell}>
              <View style={styles.metricLine}>
                <View style={[styles.metricDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Prijaté</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>+{formatMoney(monthly.income)}</Text>
            </View>
            <View style={[styles.monthlyDivider, { backgroundColor: colors.border }]} />
            <View style={styles.monthlyCell}>
              <View style={styles.metricLine}>
                <View style={[styles.metricDot, { backgroundColor: colors.foreground }]} />
                <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Výdavky</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>−{formatMoney(monthly.expense)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.recentHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Posledné pohyby</Text>
          <Pressable onPress={() => router.push('/transactions')} hitSlop={8}>
            <Text style={[styles.linkText, { color: colors.primary }]}>Zobraziť všetky</Text>
          </Pressable>
        </View>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {transactions.slice(0, 4).map((transaction) => (
            <TransactionRow
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.4, marginBottom: 5 },
  greeting: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.5 },
  demoBadge: { alignItems: 'center', flexDirection: 'row', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 20 },
  demoDot: { width: 7, height: 7, borderRadius: 4 },
  demoLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1 },
  balanceCard: { borderRadius: 24, padding: 21, marginBottom: 13 },
  balanceHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardOverline: { color: 'rgba(255,255,255,0.74)', fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 9 },
  balanceValue: { color: '#ffffff', fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -1 },
  walletMark: { alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 17, height: 52, justifyContent: 'center', width: 52 },
  balanceFooter: { borderTopColor: 'rgba(255,255,255,0.22)', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 23, paddingTop: 13 },
  accountLabel: { color: 'rgba(255,255,255,0.76)', fontFamily: 'Inter_500Medium', fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 13 },
  primaryAction: { alignItems: 'center', borderRadius: 15, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 50 },
  primaryActionText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  secondaryAction: { alignItems: 'center', borderRadius: 15, borderWidth: 1, flex: 0.76, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 50 },
  secondaryActionText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  notice: { alignItems: 'center', borderRadius: 15, flexDirection: 'row', gap: 11, marginBottom: 22, paddingHorizontal: 15, paddingVertical: 13 },
  noticeText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 17 },
  sectionCard: { borderRadius: 20, borderWidth: 1, marginBottom: 24, padding: 18 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  sectionCaption: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  monthlyGrid: { flexDirection: 'row', alignItems: 'center' },
  monthlyCell: { flex: 1 },
  monthlyDivider: { height: 47, marginHorizontal: 14, width: 1 },
  metricLine: { alignItems: 'center', flexDirection: 'row', gap: 7, marginBottom: 7 },
  metricDot: { borderRadius: 4, height: 8, width: 8 },
  metricLabel: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  metricValue: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  recentHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11 },
  linkText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  listCard: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 15 },
  transactionRow: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 74 },
  transactionIcon: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  transactionCopy: { flex: 1, minWidth: 0 },
  transactionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 4 },
  transactionMeta: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  transactionAmount: { fontFamily: 'Inter_700Bold', fontSize: 13, textAlign: 'right' },
});