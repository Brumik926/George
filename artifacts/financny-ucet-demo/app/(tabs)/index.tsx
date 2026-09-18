import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Transaction, useAccount } from '@/context/AccountContext';
import { useColors } from '@/hooks/useColors';

const formatMoney = (value: number) =>
  `${value.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatMonth = (date: string) => {
  const label = new Date(date).toLocaleDateString('sk-SK', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

interface TransactionGroup {
  key: string;
  title: string;
  items: Transaction[];
}

function groupTransactions(transactions: Transaction[]): TransactionGroup[] {
  const groups = new Map<string, TransactionGroup>();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(transaction);
    } else {
      groups.set(key, {
        key,
        title: formatMonth(transaction.date),
        items: [transaction],
      });
    }
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      items: [...group.items].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    }))
    .sort((a, b) => b.key.localeCompare(a.key));
}

function TransactionRow({
  transaction,
  isLast,
  onPress,
}: {
  transaction: Transaction;
  isLast: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const isIncome = transaction.kind === 'income';

  return (
    <Pressable
      onPress={onPress}
      testID={`transaction-${transaction.id}`}
      style={({ pressed }) => [
        styles.transactionRow,
        !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 },
        { opacity: pressed ? 0.72 : 1 },
      ]}
    >
      <View style={[styles.transactionIcon, { backgroundColor: colors.primary }]}>
        <Feather
          name={isIncome ? 'arrow-down-left' : 'credit-card'}
          size={21}
          color={colors.primaryForeground}
        />
      </View>
      <View style={styles.transactionCopy}>
        <Text style={[styles.transactionTitle, { color: colors.foreground }]} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.mutedForeground }]}>
          {formatDate(transaction.date)}
        </Text>
        <View style={[styles.categoryPill, { borderColor: colors.mutedForeground }]}>
          <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>
            {transaction.category}
          </Text>
        </View>
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
  const transactionGroups = useMemo(() => groupTransactions(transactions), [transactions]);

  if (!isReady) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.heroStart, colors.heroEnd]}
          style={[styles.hero, { paddingTop: insets.top + 15 }]}
        >
          <View style={styles.heroTopBar}>
            <View>
              <Text style={styles.heroEyebrow}>OSOBNÉ FINANCIE</Text>
              <Text style={styles.heroTitle}>Prehľad účtu</Text>
            </View>
            <Pressable
              onPress={() => router.push('/profile')}
              testID="profile-button"
              accessibilityRole="button"
              accessibilityLabel="Otvoriť profil"
              style={({ pressed }) => [
                styles.profileButton,
                { backgroundColor: colors.heroGlass, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.profileButtonText, { color: colors.primaryForeground }]}>JV</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <View style={[styles.accountCard, { backgroundColor: colors.card }]}>
          <View style={styles.accountCopy}>
            <Text style={[styles.accountTitle, { color: colors.foreground }]}>Účet</Text>
            <Text style={[styles.balanceValue, { color: colors.foreground }]}>{formatMoney(balance)}</Text>
            <Text style={[styles.balanceMeta, { color: colors.mutedForeground }]}>
              {formatMoney(balance)} vlastné zdroje
            </Text>
          </View>
          <View style={[styles.accountAvatar, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.accountAvatarText, { color: colors.primary }]}>JV</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.tabRow}>
            <View style={[styles.activeTab, { backgroundColor: colors.card }]}>
              <Text style={[styles.activeTabText, { color: colors.primary }]}>Transakcie</Text>
            </View>
            <Text style={[styles.tabText, { color: colors.primary }]}>Funkcie</Text>
            <Text style={[styles.tabText, { color: colors.primary }]}>Karty</Text>
            <Text style={[styles.tabText, { color: colors.primary }]}>Info</Text>
          </View>

          <View style={[styles.paymentCard, { backgroundColor: colors.card }]}>
            <View style={[styles.paymentIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="edit-3" size={24} color={colors.primary} />
            </View>
            <View style={styles.paymentCopy}>
              <Text style={[styles.paymentTitle, { color: colors.foreground }]}>
                Platobné príkazy a rezervácie
              </Text>
              <Text style={[styles.paymentMeta, { color: colors.mutedForeground }]}>
                0 nevykonaných platieb a 0 rezervácií
              </Text>
            </View>
          </View>

          {transactionGroups.map((group) => (
            <View key={group.key} style={styles.monthSection}>
              <Text style={[styles.monthTitle, { color: colors.foreground }]}>{group.title}</Text>
              <View style={[styles.transactionCard, { backgroundColor: colors.card }]}>
                {group.items.map((transaction, index) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    isLast={index === group.items.length - 1}
                    onPress={() => router.push(`/transaction/${transaction.id}`)}
                  />
                ))}
              </View>
            </View>
          ))}

          {transactionGroups.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Ionicons name="receipt-outline" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Žiadne transakcie</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <View
        style={[
          styles.bottomActionBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            bottom: Platform.OS === 'web' ? 84 : insets.bottom + 50,
          },
        ]}
      >
        <Pressable
          onPress={() => router.push('/transactions')}
          testID="activity-shortcut-button"
          style={({ pressed }) => [
            styles.quickAction,
            { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="bar-chart-2" size={21} color={colors.primary} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/payment')}
          testID="new-payment-button"
          style={({ pressed }) => [
            styles.newPaymentButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="plus" size={21} color={colors.primaryForeground} />
          <Text style={[styles.newPaymentText, { color: colors.primaryForeground }]}>Nová platba</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  hero: { minHeight: 219, paddingHorizontal: 20 },
  heroTopBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heroEyebrow: { color: '#ffffffb8', fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5 },
  heroTitle: { color: '#ffffff', fontFamily: 'Inter_700Bold', fontSize: 26, letterSpacing: -0.5, marginTop: 5 },
  profileButton: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  profileButtonText: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 0.5 },
  accountCard: {
    alignItems: 'center',
    borderRadius: 23,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: -70,
    minHeight: 149,
    paddingHorizontal: 19,
    shadowColor: '#12213a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  accountCopy: { flex: 1 },
  accountTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginBottom: 5 },
  balanceValue: { fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.6 },
  balanceMeta: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 5 },
  accountAvatar: { alignItems: 'center', borderRadius: 31, height: 62, justifyContent: 'center', width: 62 },
  accountAvatarText: { fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: 0.5 },
  content: { paddingHorizontal: 20 },
  tabRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 19, marginTop: 18 },
  activeTab: { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  activeTabText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  tabText: { fontFamily: 'Inter_700Bold', fontSize: 14, paddingHorizontal: 7 },
  paymentCard: { alignItems: 'center', borderRadius: 23, flexDirection: 'row', marginBottom: 31, paddingHorizontal: 19, paddingVertical: 17 },
  paymentIcon: { alignItems: 'center', borderRadius: 14, height: 47, justifyContent: 'center', width: 47 },
  paymentCopy: { flex: 1, marginLeft: 14 },
  paymentTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 4 },
  paymentMeta: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  monthSection: { marginBottom: 20 },
  monthTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginBottom: 10 },
  transactionCard: { borderRadius: 23, overflow: 'hidden', paddingHorizontal: 16 },
  transactionRow: { alignItems: 'center', flexDirection: 'row', minHeight: 106, paddingVertical: 13 },
  transactionIcon: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  transactionCopy: { flex: 1, minWidth: 0, paddingHorizontal: 13 },
  transactionTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, marginBottom: 4 },
  transactionDate: { fontFamily: 'Inter_400Regular', fontSize: 13, marginBottom: 5 },
  categoryPill: { alignSelf: 'flex-start', borderRadius: 10, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  categoryText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  transactionAmount: { alignSelf: 'flex-start', fontFamily: 'Inter_700Bold', fontSize: 14, paddingTop: 2, textAlign: 'right' },
  emptyCard: { alignItems: 'center', borderRadius: 23, paddingVertical: 42 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, marginTop: 10 },
  bottomActionBar: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    left: 0,
    paddingHorizontal: 20,
    paddingVertical: 11,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 0,
  },
  quickAction: { alignItems: 'center', borderRadius: 23, height: 46, justifyContent: 'center', width: 46 },
  newPaymentButton: { alignItems: 'center', borderRadius: 24, flexDirection: 'row', gap: 7, minHeight: 46, paddingHorizontal: 20 },
  newPaymentText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});