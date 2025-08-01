import { User } from './userService';

const API_URL = 'http://localhost:3000/types-conges';

export interface TypeConge {
  id?: number;
  nom: string;
  joursAutorises: string; // Peut être un nombre ou 'illimite'
  report: boolean;
  userId?: number;
  user?: User;
}

// Fonction utilitaire pour créer les headers
const createHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return headers;
};

// Fonction utilitaire pour les requêtes
const fetchAPI = async (url: string, options: RequestInit = {}): Promise<any> => {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: createHeaders(),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Si c'est DELETE, pas besoin de parser JSON
    if (options.method === 'DELETE') {
      return;
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur API (${url}):`, error);
    throw error;
  }
};

const typeCongeService = {
  // Récupérer tous les types de congés
  getAll: async (): Promise<TypeConge[]> => {
    return fetchAPI(API_URL);
  },

  // Récupérer un type de congé par son ID
  getById: async (id: number): Promise<TypeConge> => {
    return fetchAPI(`${API_URL}/${id}`);
  },

  // Créer un nouveau type de congé
  create: async (typeConge: Omit<TypeConge, 'id' | 'user'>): Promise<TypeConge> => {
    return fetchAPI(API_URL, {
      method: 'POST',
      body: JSON.stringify(typeConge),
    });
  },

  // Mettre à jour un type de congé existant
  update: async (id: number, typeConge: Partial<TypeConge>): Promise<TypeConge> => {
    return fetchAPI(`${API_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(typeConge),
    });
  },

  // Supprimer un type de congé
  delete: async (id: number): Promise<void> => {
    return fetchAPI(`${API_URL}/${id}`, { method: 'DELETE' });
  },

  // Formater l'affichage des jours autorisés
  formatJoursAutorises: (joursAutorises: string): string => {
    return joursAutorises === 'illimite' ? 'Illimité' : joursAutorises;
  },
};

export default typeCongeService;