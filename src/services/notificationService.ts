// Interface pour les notifications
export interface Notification {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  accessLog?: any;
  userId?: number;
}

// Interface pour la réponse de synchronisation
export interface SyncNotificationsResponse {
  success: boolean;
  accessDeniedCount: number;
  otherNotificationsCount: number;
  totalCount: number;
  message: string;
  error?: string;
}

// Adresse serveur
const API_URL = 'http://localhost:3000/notification';

// Service pour gérer les notifications
const notificationService = {
  // Récupérer toutes les notifications de l'utilisateur connecté
  getUserNotifications: async (): Promise<Notification[]> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }

      const response = await fetch(`${API_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des notifications: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur getUserNotifications:', error);
      throw error;
    }
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId: number): Promise<any> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }

      const response = await fetch(`${API_URL}/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du marquage de la notification: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur markAsRead:', error);
      throw error;
    }
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async (): Promise<any> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'accès non trouvé');
      }

      const response = await fetch(`${API_URL}/read-all`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw error;
    }
  },

  // Synchroniser les notifications pour un nouvel administrateur
  syncAccessDeniedNotificationsForNewAdmin: async (adminId: number): Promise<SyncNotificationsResponse> => {
    try {
      console.log(`🔄 Synchronisation des notifications pour l'admin ${adminId}...`);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }

      const response = await fetch(`${API_URL}/sync-access-denied/${adminId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur lors de la synchronisation des notifications: ${response.status}`, errorText);
        throw new Error(`Erreur lors de la synchronisation des notifications: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Synchronisation réussie:`, result);
      return result;
    } catch (error) {
      console.error('❌ Erreur syncAccessDeniedNotificationsForNewAdmin:', error);
      throw error;
    }
  },

  // Vérifier les notifications en base de données (débogage)
  debugUserNotifications: async (userId: number): Promise<any> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }

      const response = await fetch(`${API_URL}/debug/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la vérification des notifications: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur debugUserNotifications:', error);
      throw error;
    }
  },

  // Synchroniser les notifications d'accès refusé pour l'utilisateur connecté
  syncNotificationsForCurrentUser: async (): Promise<any> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'accès non trouvé');
      }

      const response = await fetch(`${API_URL}/sync-for-current-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la synchronisation des notifications:', error);
      throw error;
    }
  }
};

export default notificationService;
