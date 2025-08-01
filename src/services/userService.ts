// Interface pour les utilisateurs
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

// Interface pour la création d'un utilisateur
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
}

// Interface pour la mise à jour d'un utilisateur
export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

// Adresse serveur
const API_URL = 'http://localhost:3000/user';

// Fonction pour récupérer le token d'authentification
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Service pour gérer les utilisateurs
const userService = {
  // Récupérer tous les utilisateurs
  getAll: async (): Promise<User[]> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      const response = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par son ID
  getById: async (id: number): Promise<User> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  create: async (userData: CreateUserDto): Promise<User> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  update: async (id: number, userData: UpdateUserDto): Promise<User> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  delete: async (id: number): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  // Récupérer l'utilisateur actuellement connecté
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userId = localStorage.getItem('userId');
      const token = getAuthToken();
      
      if (!userId || !token) {
        return null;
      }
      
      return await userService.getById(parseInt(userId));
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur connecté:', error);
      return null;
    }
  },

  // Vérifier si l'utilisateur est un admin
  isAdmin: async (): Promise<boolean> => {
    try {
      const user = await userService.getCurrentUser();
      return user?.role === 'admin';
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle admin:', error);
      return false;
    }
  },

  // Gérer les erreurs d'autorisation
  handleAuthError: (error: any): void => {
    if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
      // Rediriger vers la page de connexion en cas d'erreur d'authentification
      console.error('Erreur d\'authentification ou d\'autorisation');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
  },

  // Upload d'image de profil pour un utilisateur
  uploadProfileImage: async (id: number, imageFile: File): Promise<{ message: string; user: User; imageUrl: string }> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/${id}/profile-image`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de l'upload d'image de profil pour l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  // Supprimer l'image de profil d'un utilisateur
  removeProfileImage: async (id: number): Promise<{ message: string; user: User }> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/${id}/profile-image`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'image de profil de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  // Obtenir l'URL de l'image de profil d'un utilisateur
  getProfileImageUrl: async (id: number): Promise<{ imageUrl: string | null }> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/${id}/profile-image-url`, {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'URL de l'image de profil de l'utilisateur ${id}:`, error);
      throw error;
    }
  }
};

export default userService;
//export type { User, UpdateUserDto };