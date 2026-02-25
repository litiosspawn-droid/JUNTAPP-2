import { collection, addDoc, getDocs, query, orderBy, where, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from './client';

export interface ChatMessage {
  id?: string;
  eventId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: Timestamp;
  reactions: { emoji: string; count: number; users: string[] }[];
  userId: string;
  createdAt?: Timestamp;
}

const CHAT_COLLECTION = 'chat';

export const sendMessage = async (messageData: Omit<ChatMessage, 'id' | 'createdAt' | 'timestamp'>): Promise<string> => {
  try {
    const messageToSave = {
      ...messageData,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, CHAT_COLLECTION), messageToSave);
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('No se pudo enviar el mensaje');
  }
};

export const getChatMessages = async (eventId: string): Promise<ChatMessage[]> => {
  try {
    const q = query(
      collection(db, CHAT_COLLECTION),
      where('eventId', '==', eventId),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp,
      createdAt: doc.data().createdAt,
    } as ChatMessage));
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw new Error('No se pudieron cargar los mensajes');
  }
};

export const addReaction = async (messageId: string, emoji: string, userId: string): Promise<void> => {
  try {
    const messageRef = doc(db, CHAT_COLLECTION, messageId);
    // Nota: Esto requeriría una transacción para ser atómico
    // Por ahora, esta es una implementación simplificada
    const messages = await getDocs(query(collection(db, CHAT_COLLECTION), where('__name__', '==', messageId)));
    
    if (!messages.empty) {
      const messageData = messages.docs[0].data() as ChatMessage;
      const existingReaction = messageData.reactions.find(r => r.emoji === emoji);
      
      let updatedReactions;
      if (existingReaction) {
        if (!existingReaction.users.includes(userId)) {
          updatedReactions = messageData.reactions.map(r =>
            r.emoji === emoji
              ? { ...r, count: r.count + 1, users: [...r.users, userId] }
              : r
          );
        } else {
          // Remover reacción si ya existe
          updatedReactions = messageData.reactions.map(r =>
            r.emoji === emoji
              ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== userId) }
              : r
          ).filter(r => r.count > 0);
        }
      } else {
        updatedReactions = [...messageData.reactions, { emoji, count: 1, users: [userId] }];
      }
      
      await updateDoc(messageRef, {
        reactions: updatedReactions,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw new Error('No se pudo agregar la reacción');
  }
};
