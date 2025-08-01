// Interface pour l'utilisateur connecté /Structures de données
export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

// Interface pour les données de connexion
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface pour les données d'inscription
//Données nécessaires pour l'inscription 
export interface SignUpData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

// Interface pour la réponse d'authentification du backend
//Format de réponse du backend après authentification (tokens et userId)
export interface AuthResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  userId: number;
}

// Adresse serveur
const API_URL = 'http://localhost:3000/auth';

// Service pour gérer l'authentification
const authService = {
  // Connexion utilisateur
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Stocker les informations dans le localStorage
      if (data.tokens) {
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
        localStorage.setItem('userId', data.userId.toString());
        
        // Récupérer les informations complètes de l'utilisateur
        try {
          const userResponse = await fetch(`http://localhost:3000/user/${data.userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.tokens.accessToken}`
            },
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            // Stocker les informations utilisateur dans le localStorage
            localStorage.setItem('userName', userData.name || '');
            localStorage.setItem('userEmail', userData.email || '');
            localStorage.setItem('userRole', userData.role || '');
            console.log('Informations utilisateur stockées avec succès:', userData);
          }
        } catch (userError) {
          console.error('Erreur lors de la récupération des informations utilisateur:', userError);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Inscription utilisateur
  signUp: async (userData: SignUpData): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      // Vérifier si la réponse contient du contenu
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Si pas de contenu JSON, retourner un objet succès
        return { success: true };
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  // Déconnexion utilisateur
  logout: async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      // Même si la requête échoue, nous nettoyons le localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      if (!response.ok) {
        console.warn(`Déconnexion côté serveur a échoué: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Nettoyage local même en cas d'erreur
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Récupérer l'ID de l'utilisateur actuellement connecté depuis localStorge
  getCurrentUserId: (): number | null => {
    try {
      const userId = localStorage.getItem('userId');
      return userId ? parseInt(userId) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
      return null;
    }
  },

  // Vérifier si l'utilisateur est connecté/Presence d'un accessToken dans localStorage
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  // Récupérer le token d'accès depuis localStorge
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken'); 
  },

  // Récupérer les informations de l'utilisateur connecté
  getMe: async (): Promise<CurrentUser | null> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('Aucun token d\'accès trouvé dans le localStorage');
        return null;
      }
      
      console.log('Token trouvé:', token.substring(0, 15) + '...');
      
      // Utiliser directement le service utilisateur avec l'ID stocké dans le localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('Aucun ID utilisateur trouvé dans le localStorage');
        return null;
      }
      
      console.log('Tentative de récupération de l\'utilisateur avec ID:', userId);
      
      // Appel direct à l'API utilisateur plutôt qu'à l'API auth/me
      const response = await fetch(`http://localhost:3000/user/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur HTTP: ${response.status}`, errorText);
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const userData = await response.json();
      console.log('Données utilisateur récupérées avec succès:', userData);
      return userData;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      return null;
    }
  },

  // Rafraîchir le token d'accès
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Aucun token de rafraîchissement disponible');
      }

      const response = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Mettre à jour le token d'accès dans le localStorage
      if (data.tokens && data.tokens.accessToken) {
        localStorage.setItem('accessToken', data.tokens.accessToken);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  },

  // Demander la réinitialisation du mot de passe
  forgotPassword: async (email: string): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      // Vérifier si la réponse contient du contenu
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Si pas de contenu JSON, retourner un objet succès
        return { success: true };
      }
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation du mot de passe:', error);
      throw error;
    }
  },

  // Réinitialiser le mot de passe avec le token
  resetPassword: async (token: string, newPassword: string): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      // Vérifier si la réponse contient du contenu
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Si pas de contenu JSON, retourner un objet succès
        return { success: true };
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    }
  }
};

export default authService;
