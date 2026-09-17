import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

type IconName = React.ComponentProps<typeof Feather>['name'];

interface ProfileItem {
  label: string;
  icon: IconName;
  description?: string;
  tone?: 'normal' | 'danger';
}

const addOns: ProfileItem[] = [
  { label: 'Cestovanie', icon: 'send' },
  { label: 'Odporúčania', icon: 'heart' },
  { label: 'Moneyback', icon: 'shopping-bag', description: '0,00 € na vyplatenie' },
  { label: 'Moje odmeny', icon: 'award' },
  { label: 'Menová kalkulačka', icon: 'repeat' },
  { label: 'Ponuka investícií', icon: 'activity' },
];

const profileItems: ProfileItem[] = [
  { label: 'Prihlásenie a podpisovanie', icon: 'users' },
  { label: 'Správa zariadení', icon: 'smartphone' },
];

const preferences: ProfileItem[] = [
  { label: 'Prispôsobiť prehľad', icon: 'sliders' },
  { label: 'Zmeniť jazyk', icon: 'globe' },
  { label: 'Ikona aplikácie', icon: 'image' },
  { label: 'Prispôsobenie vzhľadu', icon: 'type' },
  { label: 'Snímky obrazovky', icon: 'camera' },
];

const about: ProfileItem[] = [
  { label: 'Informácie', icon: 'info' },
  { label: 'Kontrola zabezpečenia', icon: 'shield' },
  { label: 'Zrušiť elektronické služby', icon: 'user-x', tone: 'danger' },
];

function ProfileRow({
  item,
  onPress,
}: {
  item: ProfileItem;
  onPress: () => void;
}) {
  const colors = useColors();
  const iconColor = item.tone === 'danger' ? colors.destructive : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      testID={`profile-option-${item.label}`}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border, opacity: pressed ? 0.62 : 1 },
      ]}
    >
      <Feather name={item.icon} size={21} color={iconColor} />
      <View style={styles.rowCopy}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
        {item.description ? (
          <Text style={[styles.rowDescription, { color: colors.mutedForeground }]}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
    </Pressable>
  );
}

function ProfileSection({
  title,
  items,
  onPress,
}: {
  title: string;
  items: ProfileItem[];
  onPress: (item: ProfileItem) => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {items.map((item, index) => (
          <View key={item.label} style={index === items.length - 1 ? styles.lastRow : undefined}>
            <ProfileRow item={item} onPress={() => onPress(item)} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const handleItemPress = (item: ProfileItem) => {
    if (item.label === 'Zrušiť elektronické služby') {
      Alert.alert(
        'Zrušenie služieb',
        'Táto funkcia je v ukážke vypnutá. Žiadne služby ani účty sa nemenia.',
        [{ text: 'Rozumiem' }],
      );
      return;
    }
    if (item.label === 'Zmeniť jazyk') {
      Alert.alert('Jazyk aplikácie', 'Slovenčina je v tejto verzii jediný dostupný jazyk.', [
        { text: 'OK' },
      ]);
      return;
    }
    if (item.label === 'Kontrola zabezpečenia') {
      Alert.alert(
        'Kontrola zabezpečenia',
        'Lokálne údaje sú uložené v zariadení. Aplikácia nie je pripojená k bankovému systému.',
        [{ text: 'OK' }],
      );
      return;
    }
    Alert.alert(item.label, 'Nastavenie je pripravené v tejto ukážkovej aplikácii.', [
      { text: 'Zavrieť' },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 30, paddingTop: insets.top + 13 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => Alert.alert('Odhlásenie', 'V tejto ukážke nie je prihlásenie aktívne.')} hitSlop={10}>
            <Text style={[styles.logout, { color: colors.primary }]}>Odhlásiť</Text>
          </Pressable>
        </View>

        <Text style={[styles.heading, { color: colors.foreground }]}>Profil</Text>

        <View style={[styles.identityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.identityName, { color: colors.foreground }]}>Jakub Varga</Text>
            <Text style={[styles.identityMeta, { color: colors.mutedForeground }]}>Majiteľ účtu</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>JV</Text>
          </View>
        </View>

        <ProfileSection title="Doplnky" items={addOns} onPress={handleItemPress} />
        <ProfileSection title="Profil" items={profileItems} onPress={handleItemPress} />
        <ProfileSection title="Nastavenia" items={preferences} onPress={handleItemPress} />
        <ProfileSection title="O aplikácii" items={about} onPress={handleItemPress} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ďalšie aplikácie</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ProfileRow
              item={{
                label: 'Mobilná peňaženka',
                icon: 'credit-card',
                description: 'Nakupujte pohodlnejšie',
              }}
              onPress={() => Alert.alert('Mobilná peňaženka', 'Táto funkcia nie je pripojená k platobnej službe.')}
            />
          </View>
        </View>

        <View style={[styles.disclaimer, { backgroundColor: colors.muted }]}>
          <Ionicons name="information-circle-outline" size={17} color={colors.mutedForeground} />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            Platby v tejto aplikácii zostávajú iba v zariadení a neposielajú sa do banky.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 21 },
  backButton: { alignItems: 'center', height: 38, justifyContent: 'center', width: 38 },
  logout: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  heading: { fontFamily: 'Inter_700Bold', fontSize: 31, letterSpacing: -0.7, marginBottom: 22 },
  identityCard: { alignItems: 'center', borderRadius: 22, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 23, paddingHorizontal: 19, paddingVertical: 16 },
  identityName: { fontFamily: 'Inter_700Bold', fontSize: 17, marginBottom: 5 },
  identityMeta: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  avatar: { alignItems: 'center', borderRadius: 31, height: 62, justifyContent: 'center', width: 62 },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: 0.5 },
  section: { marginBottom: 23 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 9 },
  sectionCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  row: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: 15, minHeight: 64, paddingHorizontal: 18 },
  lastRow: { borderBottomWidth: 0 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  rowDescription: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  disclaimer: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 8, marginBottom: 8, paddingHorizontal: 13, paddingVertical: 12 },
  disclaimerText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
});