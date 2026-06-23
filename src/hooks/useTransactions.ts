import { useEffect, useState } from 'react';
import {
  subscribeToTransactions,
  getUserTransactions,
  Transaction,
} from '@/services/transferService';

export function useRoomTransactions(roomId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    setIsLoading(true);
    const unsubscribe = subscribeToTransactions(roomId, (txs) => {
      setTransactions(txs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  return { transactions, isLoading };
}

export function useUserTransactions(uid: string | null, roomIds: string[]) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!uid || roomIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const txs = await getUserTransactions(uid, roomIds);
      setTransactions(txs);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [uid, roomIds.join(',')]);

  return { transactions, isLoading, refetch: fetchTransactions };
}
