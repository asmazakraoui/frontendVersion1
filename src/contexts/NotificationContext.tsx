"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
//import { Notification } from '../types/notification';
import websocketService from '../services/websocket.service';
import notificationService from '../services/notificationService';
import toast from 'react-hot-toast';
import { Notification } from '../services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<void>;
  syncNotificationsForAdmin: (adminId: number) => Promise<void>;
  syncNotificationsForCurrentUser: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Mettre à jour le compteur de notifications non lues
  const updateUnreadCount = useCallback((notifs: Notification[]) => {
    const count = notifs.filter(notif => !notif.read).length;
    setUnreadCount(count);
  }, []);

  // Récupérer les notifications depuis l'API
  const fetchNotifications = useCallback(async () => {
    // Récupérer le token directement depuis localStorage pour éviter les problèmes de timing
    const localToken = localStorage.getItem('accessToken');
    
    if (!localToken) {
      console.error('🚫 Aucun token trouvé dans localStorage');
      return;
    }

    try {
      console.log('📥 Récupération des notifications avec notificationService...');
      const data = await notificationService.getUserNotifications();
      console.log('✅ Notifications récupérées:', data);
      
      // Vérifier si nous avons reçu un tableau valide
      if (Array.isArray(data)) {
        setNotifications(data);
        
        // Calculer le nombre de notifications non lues
        const unreadNotifications = data.filter(notif => !notif.read);
        console.log(`🔔 Nombre de notifications non lues: ${unreadNotifications.length}`);
        updateUnreadCount(data);
      } else {
        console.error('❌ Format de données de notification invalide:', data);
      }
    } catch (error) {
      console.error('❌ Erreur fetchNotifications:', error);
    }
  }, [updateUnreadCount]);

  const syncNotificationsForAdmin = useCallback(async (adminId: number) => {
    try {
      const result = await notificationService.syncAccessDeniedNotificationsForNewAdmin(adminId);
      if (result.success) {
        console.log(`Notifications synchronisées pour l'admin ${adminId}:`, result);
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des notifications:', error);
    }
  }, [fetchNotifications]);

  const syncNotificationsForCurrentUser = useCallback(async () => {
    try {
      const result = await notificationService.syncNotificationsForCurrentUser();
      if (result.success) {
        console.log('Notifications synchronisées pour l\'utilisateur connecté:', result);
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des notifications:', error);
    }
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => {
        const updated = prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        );
        updateUnreadCount(updated);
        return updated;
      });
    } catch (error) {
      console.error('❌ Erreur markAsRead:', error);
      toast.error('Erreur lors du marquage de la notification comme lue');
    }
  }, [updateUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      console.log('📝 Envoi de la requête pour marquer toutes les notifications comme lues...');
      const data = await notificationService.markAllAsRead();

      if (data?.success) {
        console.log('✅ Notifications marquées comme lues avec succès:', data);
        
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
        
        toast.success('Toutes les notifications ont été marquées comme lues');
      } else {
        console.error('❌ Erreur lors du marquage des notifications comme lues:', data);
        
        if (data?.error) {
          toast.error(`Erreur: ${data.error}`);
        } else {
          toast.error('Erreur lors du marquage des notifications comme lues');
        }
      }
    } catch (error) {
      console.error('❌ Erreur markAllAsRead:', error);
      toast.error('Une erreur est survenue lors du marquage des notifications comme lues');
    }
  }, [updateUnreadCount]);

  useEffect(() => {
    const checkAuthStatus = () => {
      const localToken = localStorage.getItem('accessToken');
      if (!localToken) {
        console.log('🚫 Aucun token trouvé, réinitialisation des notifications');
        setNotifications([]);
        setUnreadCount(0);
        websocketService.disconnect();
      }
    };
    checkAuthStatus();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const localToken = localStorage.getItem('accessToken');
    if (!localToken) {
      console.log('🚫 Aucun token trouvé, pas de connexion WebSocket');
      return;
    }
    
    console.log('🔑 Token trouvé dans localStorage, initialisation de la connexion WebSocket:', localToken.substring(0, 15) + '...');

    const initializeConnection = async () => {
      try {
        if (websocketService.isConnected()) {
          console.log('🔄 WebSocket déjà connecté, forçage de la reconnexion');
          websocketService.forceReconnect(localToken);
        } else {
          console.log('🔌 Connexion au WebSocket...');
          websocketService.connect(localToken);
        }
        
        console.log('⏱️ Attente de l\'établissement de la connexion...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const isConnected = websocketService.isConnected();
        console.log('🔌 État de la connexion WebSocket après délai:', isConnected ? 'Connecté ✅' : 'Non connecté ❌');
        
        if (!isConnected) {
          console.log('🔄 Tentative de reconnexion forcée...');
          websocketService.forceReconnect(localToken);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('📥 Récupération des notifications initiales...');
        await fetchNotifications();
        
        const currentNotifications = await notificationService.getUserNotifications();
        console.log('📊 Vérification des notifications actuelles:', currentNotifications);
        
        if (!currentNotifications || currentNotifications.length === 0) {
          console.log('🔍 Aucune notification trouvée, tentative de synchronisation...');
          try {
            const syncResult = await syncNotificationsForCurrentUser();
            console.log('✅ Synchronisation automatique effectuée:', syncResult);
            
            await fetchNotifications();
          } catch (error) {
            console.error('❌ Erreur lors de la synchronisation automatique:', error);
          }
        }
        
        console.log('⏱️ Programmation d\'une seconde récupération des notifications après délai...');
        setTimeout(async () => {
          console.log('📥 Seconde récupération des notifications...');
          await fetchNotifications();
        }, 2000);
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la connexion:', error);
      }
    };

    setTimeout(() => {
      initializeConnection();
    }, 500);
    const handleNewNotification = (notification: any) => {
      console.log('Nouvelle notification reçue:', notification);
      
      // Vérifier si c'est une notification avec accessLog
      const formattedNotification: Notification = notification.type === 'access_denied' && notification.accessLog
        ? {
            id: notification.id,
            message: notification.message || `Accès refusé pour la carte ${notification.accessLog.cardId}`,
            type: notification.type,
            read: notification.read || false,
            createdAt: notification.createdAt || new Date().toISOString(),
            accessLog: notification.accessLog
          }
        : notification;
      
      setNotifications(prev => {
        const updated = [formattedNotification, ...prev];
        updateUnreadCount(updated);
        return updated;
      });
    };

    const handleNotificationRead = (data: { notificationId: number }) => {
      console.log('Notification marquée comme lue:', data.notificationId);
      setNotifications(prev => {
        const updated = prev.map(notif => 
          notif.id === data.notificationId ? { ...notif, read: true } : notif
        );
        updateUnreadCount(updated);
        return updated;
      });
    };

    const handleAllNotificationsRead = () => {
      console.log('Toutes les notifications marquées comme lues');
      setNotifications(prev => {
        const updated = prev.map(notif => ({ ...notif, read: true }));
        updateUnreadCount(updated);
        return updated;
      });
    };

    websocketService.addListener('notification', handleNewNotification);
    websocketService.addListener('admin-notification', handleNewNotification);
    websocketService.addListener('notification_read', handleNotificationRead);
    websocketService.addListener('all_notifications_read', handleAllNotificationsRead);

    return () => {
      console.log('Nettoyage des écouteurs WebSocket');
      websocketService.removeListener('notification', handleNewNotification);
      websocketService.removeListener('admin-notification', handleNewNotification);
      websocketService.removeListener('notification_read', handleNotificationRead);
      websocketService.removeListener('all_notifications_read', handleAllNotificationsRead);
    };
  }, [fetchNotifications, updateUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        syncNotificationsForAdmin,
        syncNotificationsForCurrentUser,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
