import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
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
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString('sk-SK', {
    day: 'numeric',
    month: 'numeric',
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

function DetailInfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.detailMutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.detailForeground }]}>{value}</Text>
    </View>
  );
}

export default function TransactionDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const params = useLocalSearchParams<{ id: string }>();
  const { balance, transactions } = useAccount();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExcluded, setIsExcluded] = useState<boolean>(false);
  const transaction = transactions.find((item) => item.id === params.id);

  if (!transaction) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.detailBackground }]}>
        <Feather name="file-text" size={32} color={colors.detailMutedForeground} />
        <Text style={[styles.notFoundTitle, { color: colors.detailForeground }]}>Pohyb sa nenašiel</Text>
        <Pressable onPress={() => router.back()} style={[styles.smallButton, { backgroundColor: colors.detailAccent }]}>
          <Text style={styles.smallButtonText}>Späť</Text>
        </Pressable>
      </View>
    );
  }

  const isIncome = transaction.kind === 'income';
  const displayIban = transaction.iban ?? 'JV00 0000 0000 0000';
  const displayCategory = isIncome ? 'Ostatné nepravidelné príjmy' : 'Nezaradené výdavky';
  const movementLabel = isIncome ? 'Príjem' : 'Prevod';
  const movementType = isIncome ? 'Prijatá platba' : 'Okamžitá platba (EB)';
  const runningBalance = isIncome ? balance - transaction.amount : balance + transaction.amount;

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
    <View style={[styles.screen, { backgroundColor: colors.detailBackground }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.detailHeroStart, colors.detailHeroEnd]}
        style={[styles.hero, { paddingTop: insets.top + 10 }]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.detailForeground} />
        </Pressable>
        <View style={styles.heroTitleGroup}>
          <View style={[styles.heroIcon, { backgroundColor: colors.detailHeroGlass }]}>
            <Feather
              name={isIncome ? 'arrow-down-left' : 'arrow-up-right'}
              size={24}
              color={colors.detailForeground}
            />
          </View>
          <Text style={[styles.heroTitle, { color: colors.detailForeground }]}>Platba</Text>
        </View>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 34, paddingHorizontal: 24, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.amountCard, { backgroundColor: colors.detailCard, borderColor: colors.detailBorder }]}>
          <View style={styles.amountCardTop}>
            <View style={styles.amountCopy}>
              <Text style={[styles.transactionName, { color: colors.detailForeground }]}>{transaction.title}</Text>
              <Text style={[styles.transactionAmount, { color: colors.detailForeground }]}>
                {isIncome ? '+' : '−'} {formatMoney(transaction.amount)}
              </Text>
              <Text style={[styles.movementLabel, { color: colors.detailMutedForeground }]}>{movementLabel}</Text>
            </View>
            <View style={[styles.movementIcon, { backgroundColor: colors.detailSurface }]}>
              <Feather
                name={isIncome ? 'arrow-down-left' : 'arrow-up-right'}
                size={29}
                color={colors.detailAccent}
              />
            </View>
          </View>
          <View style={styles.actionRow}>
            <Pressable
              testID="repeat-transaction-button"
              style={({ pressed }) => [styles.actionButton, { backgroundColor: colors.detailSurface, opacity: pressed ? 0.65 : 1 }]}
            >
              <Feather name="repeat" size={17} color={colors.detailAccent} />
              <Text style={[styles.actionText, { color: colors.detailAccent }]}>Zopakovať</Text>
            </Pressable>
            <Pressable
              testID="share-transaction-button"
              onPress={() => Share.share({ message: `${transaction.title}: ${formatMoney(transaction.amount)}` })}
              style={({ pressed }) => [styles.actionButton, { backgroundColor: colors.detailSurface, opacity: pressed ? 0.65 : 1 }]}
            >
              <Feather name="share-2" size={17} color={colors.detailAccent} />
              <Text style={[styles.actionText, { color: colors.detailAccent }]}>Zdieľať</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.categoryCard, { backgroundColor: colors.detailCard, borderColor: colors.detailBorder }]}>
          <View style={styles.categoryRow}>
            <Feather name="tag" size={24} color={colors.detailAccent} />
            <View style={[styles.categoryPill, { borderColor: colors.detailMutedForeground }]}>
              <Text style={[styles.categoryText, { color: colors.detailMutedForeground }]}>{displayCategory}</Text>
            </View>
          </View>
          <View style={[styles.categoryDivider, { backgroundColor: colors.detailBorder }]} />
          <Pressable onPress={() => setIsExcluded((value) => !value)} style={styles.excludeRow}>
            <Feather name="eye-off" size={25} color={colors.detailAccent} />
            <Text style={[styles.excludeText, { color: colors.detailForeground }]}>
              Nezahrnúť do prehľadu{'\n'}príjmov a výdavkov
            </Text>
            <Switch
              value={isExcluded}
              onValueChange={setIsExcluded}
              trackColor={{ false: colors.detailSurface, true: colors.detailAccent }}
              thumbColor={colors.detailForeground}
              ios_backgroundColor={colors.detailSurface}
            />
          </Pressable>
        </View>

        <View style={[styles.notesCard, { backgroundColor: colors.detailCard, borderColor: colors.detailBorder }]}>
          <Pressable style={styles.noteRow}>
            <Feather name="edit-3" size={24} color={colors.detailAccent} />
            <Text style={[styles.placeholderText, { color: colors.detailMutedForeground }]}>
              Pridať poznámku alebo #hashtag
            </Text>
          </Pressable>
          <View style={[styles.noteDivider, { backgroundColor: colors.detailBorder }]} />
          <Pressable style={styles.noteRow}>
            <Feather name="paperclip" size={24} color={colors.detailAccent} />
            <Text style={[styles.placeholderText, { color: colors.detailMutedForeground }]}>Nahrať prílohu</Text>
          </Pressable>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.detailCard, borderColor: colors.detailBorder }]}>
          <DetailInfoRow label={isIncome ? 'Odosielateľ' : 'Príjemca'} value={transaction.title} colors={colors} />
          <DetailInfoRow label="IBAN" value={displayIban} colors={colors} />
          <DetailInfoRow label="Dátum spracovania" value={formatDateTime(transaction.date)} colors={colors} />
          <DetailInfoRow label="Typ transakcie" value={movementType} colors={colors} />
          <DetailInfoRow label="Priebežný zostatok" value={formatMoney(runningBalance)} colors={colors} />
        </View>

        <View style={[styles.demoNotice, { borderColor: colors.detailBorder }]}>
          <Ionicons name="information-circle-outline" size={17} color={colors.detailMutedForeground} />
          <Text style={[styles.demoNoticeText, { color: colors.detailMutedForeground }]}>
            Lokálna ukážka bez prepojenia na banku.
          </Text>
        </View>

        <Pressable
          onPress={exportReceipt}
          disabled={isExporting}
          testID="download-receipt-button"
          style={({ pressed }) => [
            styles.exportButton,
            { backgroundColor: colors.detailAccent, opacity: pressed || isExporting ? 0.72 : 1 },
          ]}
        >
          <Feather name="download" size={18} color={colors.primaryForeground} />
          <Text style={[styles.exportText, { color: colors.primaryForeground }]}>
            {isExporting ? 'Pripravujem potvrdenie…' : 'Stiahnuť potvrdenie'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 158,
    paddingHorizontal: 24,
  },
  backButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 34 },
  heroTitleGroup: { alignItems: 'center', flexDirection: 'row', marginLeft: 7 },
  heroIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 25, marginLeft: 10 },
  headerSpacer: { flex: 1 },
  amountCard: { borderRadius: 22, borderWidth: 1, marginBottom: 24, padding: 23 },
  amountCardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  amountCopy: { flex: 1, minWidth: 0 },
  transactionName: { fontFamily: 'Inter_700Bold', fontSize: 23, marginBottom: 12 },
  transactionAmount: { fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -0.8, marginBottom: 5 },
  movementLabel: { fontFamily: 'Inter_500Medium', fontSize: 16 },
  movementIcon: { alignItems: 'center', borderRadius: 34, height: 68, justifyContent: 'center', marginLeft: 14, width: 68 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 25 },
  actionButton: { alignItems: 'center', borderRadius: 24, flexDirection: 'row', gap: 8, minHeight: 46, paddingHorizontal: 16 },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  categoryCard: { borderRadius: 22, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  categoryRow: { alignItems: 'center', flexDirection: 'row', gap: 22, minHeight: 73, paddingHorizontal: 22 },
  categoryPill: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  categoryText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  categoryDivider: { height: 1, marginHorizontal: 0 },
  excludeRow: { alignItems: 'center', flexDirection: 'row', gap: 20, minHeight: 94, paddingHorizontal: 22 },
  excludeText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 17, lineHeight: 23 },
  notesCard: { borderRadius: 22, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  noteRow: { alignItems: 'center', flexDirection: 'row', gap: 22, minHeight: 91, paddingHorizontal: 22 },
  placeholderText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 17 },
  noteDivider: { height: 1 },
  infoCard: { borderRadius: 22, borderWidth: 1, marginBottom: 16, paddingHorizontal: 22 },
  infoRow: { paddingVertical: 15 },
  infoLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: 5 },
  infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 17, lineHeight: 23 },
  demoNotice: { alignItems: 'center', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, marginBottom: 14, padding: 12 },
  demoNoticeText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12 },
  exportButton: { alignItems: 'center', borderRadius: 16, flexDirection: 'row', gap: 9, justifyContent: 'center', minHeight: 54 },
  exportText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  notFound: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  notFoundTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginVertical: 14 },
  smallButton: { borderRadius: 13, paddingHorizontal: 22, paddingVertical: 12 },
  smallButtonText: { color: '#ffffff', fontFamily: 'Inter_700Bold', fontSize: 13 },
});