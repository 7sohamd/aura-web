'use client';

import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Button } from '@/components/ui/Button';

export default function ResetDBPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleReset = async () => {
    setLoading(true);
    setStatus('Starting reset...');
    
    try {
      // 1. Reset all users global aura
      setStatus('Resetting global users...');
      const usersSnap = await getDocs(collection(db, 'users'));
      for (const userDoc of usersSnap.docs) {
        await updateDoc(doc(db, 'users', userDoc.id), {
          auraBalance: 2000
        });
      }

      // 2. Process all rooms
      setStatus('Processing rooms...');
      const roomsSnap = await getDocs(collection(db, 'rooms'));
      for (const roomDoc of roomsSnap.docs) {
        const roomId = roomDoc.id;
        
        // Reset member balances
        const membersSnap = await getDocs(collection(db, 'rooms', roomId, 'members'));
        for (const memberDoc of membersSnap.docs) {
          await updateDoc(doc(db, 'rooms', roomId, 'members', memberDoc.id), {
            auraBalance: 2000
          });
        }
        
        // Delete all transactions
        const txSnap = await getDocs(collection(db, 'rooms', roomId, 'transactions'));
        for (const txDoc of txSnap.docs) {
          await deleteDoc(doc(db, 'rooms', roomId, 'transactions', txDoc.id));
        }
      }

      setStatus('Reset Complete! All users have 2000 Aura and transactions are cleared.');
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Database Reset Tool</h1>
      <p>Clicking the button below will:</p>
      <ul>
        <li>Reset EVERY user's global aura balance to 2000</li>
        <li>Reset EVERY room member's aura balance to 2000</li>
        <li>Delete ALL transactions from ALL rooms</li>
      </ul>
      <br/>
      <Button 
        title="EXECUTE RESET" 
        variant="primary" 
        onClick={handleReset} 
        loading={loading} 
      />
      <br/><br/>
      <p>{status}</p>
    </div>
  );
}
