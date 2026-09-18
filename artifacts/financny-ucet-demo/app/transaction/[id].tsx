import { Feather, Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Transaction, useAccount } from '@/context/AccountContext';
import { useColors } from '@/hooks/useColors';

const formatMoney = (value: number) =>
  `${value.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function receiptHtml(transaction: Transaction) {
  const sign = transaction.kind === 'income' ? '+' : '−';
  return `
    <!doctype html>
    <html lang="sk">
      <head><meta charset="utf-8"><style>
        body { font-family: Arial, sans-serif; color: #12213a; padding: 36px; }
        .top { color: #2368e8; font-size: 13px; font-weight: bold; letter-spacing: 2px; }
        h1 { font-size: 27px; margin: 18px 0 6px; }
        .receiptBadge { display: inline-block; background: #eaf1ff; color: #2368e8; border-radius: 20px; padding: 7px 11px; font-size: 12px; font-weight: bold; }
        .amount { font-size: 30px; font-weight: bold; color: #2368e8; margin: 28px 0; }
        .line { border-top: 1px solid #dce5f3; padding: 15px 0; }
        .label { color: #6c7b96; font-size: 11px; margin-bottom: 5px; }
        .value { font-size: 15px; }
        .warning { margin-top: 26px; padding: 14px; background: #fff1f3; color: #a22d43; border-radius: 10px; font-size: 12px; }
      </style></head>
      <body>
        <div class="top">FINANČNÝ ÚČET</div>
        <h1>Potvrdenie o pohybe</h1>
        <span class="receiptBadge">VZOR · NEPLATNÝ DOKLAD</span>
        <div class="amount">${sign}${formatMoney(transaction.amount)}</div>
        <div class="line"><div class="label">Príjemca / odosielateľ</div><div class="value">${transaction.title}</div></div>
        <div class="line"><div class="label">Typ pohybu</div><div class="value">${transaction.kind === 'income' ? 'Prijatá platba' : 'Odoslaná platba'}</div></div>
        <div class="line"><div class="label">Dátum spracovania</div><div class="value">${formatDateTime(transaction.date)}</div></div>
        ${transaction.iban ? `<div class="line"><div class="label">IBAN príjemcu</div><div class="value">${transaction.iban}</div></div>` : ''}
        ${transaction.note ? `<div class="line"><div class="label">Poznámka</div><div class="value">${transaction.note}</div></div>` : ''}
        <div class="warning">Tento dokument je iba vizuálna ukážka. Nie je potvrdením skutočnej bankovej transakcie a nemá účtovnú ani právnu platnosť.</div>
      </body>
    </html>
  `;
}

export default function TransactionDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const params = useLocalSearchParams<{ id: string }>();
  const { transactions } = useAccount();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const transaction = transactions.find((item) => item.id === params.id);

  if (!transaction) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="file-text" size={32} color={colors.mutedForeground} />
        <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>Pohyb sa nenašiel</Text>
        <Pressable onPress={() => router.back()} style={[styles.smallButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.smallButtonText}>Späť</Text>
        </Pressable>
      </View>
    );
  }

  const isIncome = transaction.kind === 'income';

  const exportReceipt = async () => {
    setIsExporting(true);
    try {
      const html = receiptHtml(transaction);
      if (Platform.OS === 'web') {
        const web = globalThis as unknown as {
          document: { createElement: (tag: string) => { href: string; download: string; click: () => void } };
          URL: { createObjectURL: (blob: Blob) => string; revokeObjectURL: (url: string) => void };
        };
        const blob = new Blob([html], { type: 'text/html' });
        const url = web.URL.createObjectURL(blob);
        const anchor = web.document.createElement('a');
        anchor.href = url;
        anchor.download = `potvrdenie-${transaction.id}.html`;
        anchor.click();
        web.URL.revokeObjectURL(url);
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Potvrdenie platby' });
        } else {
          await Share.share({ message: `Potvrdenie: ${transaction.title} ${formatMoney(transaction.amount)}` });
        }
      }
      Alert.alert('Potvrdenie pripravené', 'Súbor je označený ako VZOR a nemá platnosť bankového dokladu.');
    } catch {
      Alert.alert('Export sa nepodaril', 'Skúste to znova.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 30, paddingHorizontal: 20, paddingTop: insets.top + 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Detail pohybu</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={[styles.amountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.transactionLogo, { backgroundColor: isIncome ? colors.secondary : colors.muted }]}>
            <Feather name={isIncome ? 'arrow-down-left' : 'arrow-up-right'} size={25} color={isIncome ? colors.primary : colors.foreground} />
          </View>
          <Text style={[styles.transactionName, { color: colors.foreground }]}>{transaction.title}</Text>
          <Text style={[styles.transactionAmount, { color: isIncome ? colors.primary : colors.foreground }]}>
            {isIncome ? '+' : '−'}{formatMoney(transaction.amount)}
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow label="Popis pohybu" value={transaction.subtitle} colors={colors} />
          <InfoRow label="Kategória" value={transaction.category} colors={colors} />
          <InfoRow label="Dátum spracovania" value={formatDateTime(transaction.date)} colors={colors} />
          {transaction.iban ? <InfoRow label="IBAN príjemcu" value={transaction.iban} colors={colors} /> : null}
          {transaction.note ? <InfoRow label="Poznámka" value={transaction.note} colors={colors} /> : null}
        </View>

        <Pressable
          onPress={exportReceipt}
          disabled={isExporting}
          testID="download-receipt-button"
          style={({ pressed }) => [
            styles.exportButton,
            { backgroundColor: colors.primary, opacity: pressed || isExporting ? 0.72 : 1 },
          ]}
        >
          <Feather name="download" size={19} color={colors.primaryForeground} />
          <Text style={[styles.exportText, { color: colors.primaryForeground }]}>
            {isExporting ? 'Pripravujem potvrdenie…' : 'Stiahnuť potvrdenie'}
          </Text>
        </Pressable>

        <View style={[styles.warning, { backgroundColor: colors.destructive + '14' }]}>
          <Ionicons name="warning-outline" size={20} color={colors.destructive} />
          <Text style={[styles.warningText, { color: colors.destructive }]}>
            Toto je lokálna ukážka. Aplikácia nie je prepojená so žiadnou bankou.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  backButton: { alignItems: 'center', height: 38, justifyContent: 'center', width: 38 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  amountCard: { alignItems: 'center', borderRadius: 22, borderWidth: 1, padding: 23, marginBottom: 14 },
  transactionLogo: { alignItems: 'center', borderRadius: 20, height: 62, justifyContent: 'center', marginBottom: 14, width: 62 },
  transactionName: { fontFamily: 'Inter_700Bold', fontSize: 20, marginBottom: 7 },
  transactionAmount: { fontFamily: 'Inter_700Bold', fontSize: 29, letterSpacing: -0.5 },
  infoCard: { borderRadius: 20, borderWidth: 1, marginBottom: 15, paddingHorizontal: 17 },
  infoRow: { borderBottomColor: 'rgba(120,145,185,0.18)', borderBottomWidth: 1, paddingVertical: 15 },
  infoLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 5 },
  infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 20 },
  exportButton: { alignItems: 'center', borderRadius: 16, flexDirection: 'row', gap: 9, justifyContent: 'center', minHeight: 55, marginBottom: 13 },
  exportText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  warning: { alignItems: 'flex-start', borderRadius: 15, flexDirection: 'row', gap: 9, padding: 14 },
  warningText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 17 },
  notFound: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  notFoundTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginVertical: 14 },
  smallButton: { borderRadius: 13, paddingHorizontal: 22, paddingVertical: 12 },
  smallButtonText: { color: '#ffffff', fontFamily: 'Inter_700Bold', fontSize: 13 },
});