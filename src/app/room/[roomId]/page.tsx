'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const GlowBackground = dynamic(() => import('@/components/GlowBackground'), {
  ssr: false,
});
import { getRoom, Room, RoomMember, updateRoomName, deleteRoom } from '@/services/roomService';
import { transferAura } from '@/services/transferService';
import { useAuthStore } from '@/stores/authStore';
import { useMembers } from '@/hooks/useMembers';
import { useRoomTransactions } from '@/hooks/useTransactions';
import { useOldAndroidScrollFix } from '@/hooks/useOldAndroidScrollFix';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import styles from './page.module.css';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  
  const { user, isAuthenticated } = useAuthStore();
  const { members, isLoading: isLoadingMembers } = useMembers(roomId);
  const { transactions, isLoading: isLoadingTxs } = useRoomTransactions(roomId);
  
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  
  const [selectedMember, setSelectedMember] = useState<RoomMember | null>(null);
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferComment, setTransferComment] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useOldAndroidScrollFix();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in');
      return;
    }

    const fetchRoom = async () => {
      if (!roomId) return;
      try {
        const roomData = await getRoom(roomId);
        if (!roomData) {
          alert('Room not found.');
          router.replace('/');
          return;
        }
        setRoom(roomData);
      } catch (error) {
        console.error('Error fetching room:', error);
      } finally {
        setIsLoadingRoom(false);
      }
    };

    fetchRoom();
  }, [roomId, isAuthenticated, router]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !room || !selectedMember || !transferAmount) return;

    const amount = parseInt(transferAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setIsTransferring(true);
    try {
      await transferAura(
        room.roomId,
        room.roomName,
        user.uid,
        user.username,
        user.photoURL,
        selectedMember.uid,
        selectedMember.username,
        selectedMember.photoURL,
        amount,
        transferComment.trim() || undefined
      );
      setTransferAmount('');
      setTransferComment('');
      setSelectedMember(null);
      // alert('Transfer successful!');
    } catch (error: any) {
      console.error('Transfer error:', error);
      alert(error.message || 'Transfer failed.');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !newRoomName.trim()) return;

    setIsUpdating(true);
    try {
      await updateRoomName(room.roomId, newRoomName.trim());
      setRoom({ ...room, roomName: newRoomName.trim() });
      setIsEditingName(false);
    } catch (error: any) {
      console.error('Update room name error:', error);
      alert(error.message || 'Failed to update room name.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!room) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this room? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      await deleteRoom(room.roomId);
      router.replace('/');
    } catch (error: any) {
      console.error('Delete room error:', error);
      alert(error.message || 'Failed to delete room.');
    }
  };

  if (!isAuthenticated || isLoadingRoom) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className={styles.container}>
      <GlowBackground className1={styles.glowCircle} />
      
      <main className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => router.push('/')}>
            ← Back
          </button>
          
          <div className={styles.headerTop}>
            {isEditingName ? (
              <form onSubmit={handleUpdateName} className={styles.editNameForm}>
                <Input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="New Room Name"
                  maxLength={30}
                  required
                />
                <Button type="submit" variant="primary" size="sm" title="Save" loading={isUpdating} />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  title="Cancel" 
                  onClick={() => setIsEditingName(false)} 
                  disabled={isUpdating} 
                />
              </form>
            ) : (
              <div className={styles.titleRow}>
                <h1 className={styles.roomName}>{room.roomName}</h1>
                {user?.uid === room.ownerId && (
                  <div className={styles.ownerActions}>
                    <button 
                      className={styles.iconButton} 
                      onClick={() => {
                        setNewRoomName(room.roomName);
                        setIsEditingName(true);
                      }}
                      title="Edit Room Name"
                    >
                      ✎
                    </button>
                    <button 
                      className={`${styles.iconButton} ${styles.deleteButton}`} 
                      onClick={handleDeleteRoom}
                      title="Delete Room"
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <p className={styles.roomIdLabel}>Room ID: <span className={styles.roomId}>{room.roomId}</span></p>
        </header>

        <div className={styles.layout}>
          {/* Members List */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Members ({members.length})</h2>
            <div className={styles.membersList}>
              {members.map((member, index) => (
                <GlassCard 
                  key={member.uid} 
                  className={`${styles.memberCard} ${selectedMember?.uid === member.uid ? styles.selectedCard : ''}`}
                >
                  <div 
                    className={styles.memberInfo} 
                    onClick={() => {
                      if (member.uid !== user?.uid) {
                        setSelectedMember(selectedMember?.uid === member.uid ? null : member);
                      }
                    }}
                  >
                    <div className={styles.rankBadge}>#{index + 1}</div>
                    <Avatar uri={member.photoURL} name={member.username} size={48} />
                    <div className={styles.memberDetails}>
                      <span className={styles.memberName}>
                        {member.username} {member.uid === user?.uid && '(You)'}
                      </span>
                      <span className={styles.memberAura}>{member.auraBalance} AURA</span>
                    </div>
                  </div>
                  
                  {/* Transfer Form (Inline) */}
                  <AnimatePresence>
                    {selectedMember?.uid === member.uid && (
                      <motion.form
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className={styles.transferForm}
                        onSubmit={handleTransfer}
                      >
                        <Input
                          type="number"
                          placeholder="Amount to send"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          min={1}
                          required
                          className={styles.transferInput}
                        />
                        <Input
                          type="text"
                          placeholder="Add a comment (optional)"
                          value={transferComment}
                          onChange={(e) => setTransferComment(e.target.value)}
                          maxLength={100}
                          className={styles.transferInput}
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          title="Send"
                          loading={isTransferring}
                          disabled={!transferAmount || isTransferring}
                        />
                      </motion.form>
                    )}
                  </AnimatePresence>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* Transactions */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <div className={styles.transactionsList}>
              {transactions.length === 0 ? (
                <EmptyState title="No activity yet" subtitle="Be the first to transfer Aura in this room!" />
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className={styles.transactionCard}>
                    <div className={styles.txMain}>
                      <div className={styles.txUsers}>
                        <span className={styles.txName}>{tx.senderUsername}</span>
                        <span className={styles.txArrow}>→</span>
                        <span className={styles.txName}>{tx.recipientUsername}</span>
                      </div>
                      <span className={styles.txAmount}>+{tx.amount} AURA</span>
                    </div>
                    {tx.comment && (
                      <div className={styles.txComment}>
                        &quot;{tx.comment}&quot;
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
