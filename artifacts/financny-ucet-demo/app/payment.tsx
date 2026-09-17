import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useAccount } from '@/context/AccountContext';
import { useColors } from '@/hooks/useColors';

const formatMoney = (value: number) =>
  `${value.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { balance, addTransfer } = useAccount();
  const [recipient, setRecipient] = useState<string>('');
  const [iban, setIban] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submit = async () => {
    setError('');
    const numericAmount = Number(amount.replace(',', '.'));
    setIsSubmitting(true);
    try {
      const transaction = await addTransfer({ recipient, iban, amount: numericAmount, note });
      Alert.alert('Demo platba odoslaná', `Zostatok sa znížil o ${formatMoney(transaction.amount)}.`, [
        { text: 'Zobraziť potvrdenie', onPress: () => router.replace(`/transaction/${transaction.id}`) },
      ]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Platbu sa nepodarilo vytvoriť.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{ paddingBottom: insets.bottom + 32, paddingHorizontal: 20, paddingTop: insets.top + 12 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerTitleGroup}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>DEMO ÚČET</Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>Nová platba</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroIcon}><Ionicons name="arrow-up-outline" size={23} color={colors.primary} /></View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>Platba z účtu</Text>
            <Text style={styles.heroValue}>{formatMoney(balance)}</Text>
          </View>
        </View>

        <View style={styles.demoLabelRow}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={[styles.demoLabelText, { color: colors.mutedForeground }]}>
            Platba je iba lokálna ukážka. Žiadne peniaze sa neposielajú.
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>Príjemca</Text>
        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.input }]}>
          <Feather name="user" size={18} color={colors.primary} />
          <TextInput
            value={recipient}
            onChangeText={setRecipient}
            placeholder="Meno príjemcu"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            testID="recipient-input"
          />
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>IBAN / číslo účtu</Text>
        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.input }]}>
          <Feather name="credit-card" size={18} color={colors.primary} />
          <TextInput
            value={iban}
            onChangeText={(value) => setIban(value.toUpperCase())}
            placeholder="SK00 0000 0000 0000 0000 0000"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            autoCapitalize="characters"
            testID="iban-input"
          />
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>Suma</Text>
        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.input }]}>
          <Text style={[styles.currency, { color: colors.primary }]}>€</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, styles.amountInput, { color: colors.foreground }]}
            keyboardType="decimal-pad"
            testID="amount-input"
          />
          <Text style={[styles.available, { color: colors.mutedForeground }]}>max. {formatMoney(balance)}</Text>
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>Poznámka <Text style={{ color: colors.mutedForeground }}>(voliteľné)</Text></Text>
        <View style={[styles.inputWrap, styles.noteWrap, { backgroundColor: colors.card, borderColor: colors.input }]}>
          <Feather name="edit-3" size={18} color={colors.primary} />
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Napríklad darček"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            testID="note-input"
          />
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.destructive + '18' }]}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={submit}
          disabled={isSubmitting}
          testID="submit-payment-button"
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: colors.primary, opacity: pressed || isSubmitting ? 0.72 : 1 },
          ]}
        >
          {isSubmitting ? <ActivityIndicator color={colors.primaryForeground} /> : <Feather name="send" size={18} color={colors.primaryForeground} />}
          <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
            {isSubmitting ? 'Spracúvam…' : 'Odoslať demo platbu'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  backButton: { alignItems: 'center', height: 38, justifyContent: 'center', width: 38 },
  headerTitleGroup: { alignItems: 'center' },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.3, marginBottom: 4 },
  heading: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.5 },
  hero: { alignItems: 'center', borderRadius: 21, flexDirection: 'row', padding: 18, marginBottom: 13 },
  heroIcon: { alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, height: 48, justifyContent: 'center', width: 48 },
  heroCopy: { marginLeft: 13 },
  heroLabel: { color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 4 },
  heroValue: { color: '#ffffff', fontFamily: 'Inter_700Bold', fontSize: 20 },
  demoLabelRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 22 },
  demoLabelText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginBottom: 8, marginLeft: 2 },
  inputWrap: { alignItems: 'center', borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 11, minHeight: 54, paddingHorizontal: 15, marginBottom: 18 },
  input: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, minHeight: 52 },
  currency: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  amountInput: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  available: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  noteWrap: { marginBottom: 8 },
  errorBox: { alignItems: 'center', borderRadius: 13, flexDirection: 'row', gap: 8, marginBottom: 12, padding: 12 },
  errorText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 17 },
  submitButton: { alignItems: 'center', borderRadius: 16, flexDirection: 'row', gap: 9, justifyContent: 'center', minHeight: 56, marginTop: 12 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});