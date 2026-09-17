import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type TransactionKind = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  kind: TransactionKind;
  category: string;
  date: string;
  iban?: string;
  note?: string;
  isDemo?: boolean;
}

interface AccountSnapshot {
  balance: number;
  transactions: Transaction[];
}

interface AccountContextValue extends AccountSnapshot {
  isReady: boolean;
  addTransfer: (input: {
    recipient: string;
    iban: string;
    amount: number;
    note: string;
  }) => Promise<Transaction>;
}

const STORAGE_KEY = '@financny_ucet_demo_snapshot';
const INITIAL_BALANCE = 45743;
const initialTransactions: Transaction[] = [
  {
    id: 'income-salary',
    title: 'Príjem na účet',
    subtitle: 'Demo zamestnávateľ',
    amount: 2450,
    kind: 'income',
    category: 'Príjem',
    date: '2026-09-12T08:35:00.000Z',
  },
  {
    id: 'expense-groceries',
    title: 'Potraviny',
    subtitle: 'BILLA Bratislava',
    amount: 54.2,
    kind: 'expense',
    category: 'Nákupy',
    date: '2026-09-14T17:20:00.000Z',
  },
  {
    id: 'expense-subscription',
    title: 'Predplatné',
    subtitle: 'Streamio Demo',
    amount: 8.99,
    kind: 'expense',
    category: 'Služby',
    date: '2026-09-07T12:05:00.000Z',
  },
  {
    id: 'income-refund',
    title: 'Vrátená platba',
    subtitle: 'Online obchod',
    amount: 39.9,
    kind: 'income',
    category: 'Ostatné príjmy',
    date: '2026-09-04T14:12:00.000Z',
  },
];

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!mounted) return;
        if (stored) {
          try {
            const snapshot = JSON.parse(stored) as AccountSnapshot;
            if (typeof snapshot.balance === 'number' && Array.isArray(snapshot.transactions)) {
              setBalance(snapshot.balance);
              setTransactions(snapshot.transactions);
            }
          } catch {
            // Invalid local demo state is ignored and replaced by the initial sample.
          }
        }
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = async (nextBalance: number, nextTransactions: Transaction[]) => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ balance: nextBalance, transactions: nextTransactions }),
    );
  };

  const addTransfer = async (input: {
    recipient: string;
    iban: string;
    amount: number;
    note: string;
  }) => {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error('Zadajte platnú sumu.');
    }
    if (input.amount > balance) {
      throw new Error('Suma prevyšuje dostupný demo zostatok.');
    }
    if (!input.recipient.trim() || input.iban.trim().length < 8) {
      throw new Error('Doplňte meno príjemcu a platný demo IBAN.');
    }

    const transaction: Transaction = {
      id: `transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: input.recipient.trim(),
      subtitle: 'Odoslaná demo platba',
      amount: input.amount,
      kind: 'expense',
      category: 'Prevod',
      date: new Date().toISOString(),
      iban: input.iban.trim().toUpperCase(),
      note: input.note.trim() || 'Demo prevod bez poznámky',
      isDemo: true,
    };
    const nextBalance = Number((balance - input.amount).toFixed(2));
    const nextTransactions = [transaction, ...transactions];
    setBalance(nextBalance);
    setTransactions(nextTransactions);
    await persist(nextBalance, nextTransactions);
    return transaction;
  };

  const value = useMemo(
    () => ({ balance, transactions, isReady, addTransfer }),
    [balance, transactions, isReady],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount must be used within AccountProvider');
  return context;
}