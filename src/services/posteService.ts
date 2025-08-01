// Types et interfaces
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Poste {
  id?: number;
  description: string;
  HeureDebut: string;
  HeureFin: string;
  userId?: number;
  user?: User;
}

export interface PosteStats {
  total: number;
  matin: number;
  apresMidi: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface PosteDTO {
  description: string;
  HeureDebut: string;
  HeureFin: string;
  userId?: number;
}

// Configuration
const API_URL = 'http://localhost:3000/postes';

// Fonction utilitaire pour créer les headers
const createHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return headers;
};

// Fonction utilitaire simple pour les requêtes
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

    return await response.json();
  } catch (error) {
    console.error(`Erreur API (${url}):`, error);
    throw error;
  }
};

// Service pour gérer les postes
const posteService = {
  // Récupérer tous les postes
  getAll: async (): Promise<Poste[]> => {
    return fetchAPI(API_URL);
  },
  
  // Récupérer les postes avec pagination
  getPaginated: async (params: PaginationParams): Promise<PaginatedResponse<Poste>> => {
    let url = `${API_URL}/paginated`;
    if (params.page || params.limit) {
      url += `?page=${params.page || 1}&limit=${params.limit || 10}`;
    }
    return fetchAPI(url);
  },

  // Récupérer un poste par son ID
  getById: async (id: number): Promise<Poste> => {
    return fetchAPI(`${API_URL}/${id}`);
  },

  // Créer un nouveau poste
  create: async (poste: PosteDTO): Promise<Poste> => {
    return fetchAPI(API_URL, {
      method: 'POST',
      body: JSON.stringify(poste),
    });
  },

  // Mettre à jour un poste existant
  update: async (id: number, poste: PosteDTO): Promise<Poste> => {
    return fetchAPI(`${API_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(poste),
    });
  },

  // Supprimer un poste
  delete: async (id: number): Promise<void> => {
    await fetchAPI(`${API_URL}/${id}`, { method: 'DELETE' });
  },

  // Rechercher des postes par description
  searchByDescription: async (term: string): Promise<Poste[]> => {
    return fetchAPI(`${API_URL}/search/${term}`);
  },
  
  // Rechercher des postes par description avec pagination
  searchByDescriptionPaginated: async (term: string, params: PaginationParams): Promise<PaginatedResponse<Poste>> => {
    let url = `${API_URL}/search/${term}/paginated`;
    if (params.page || params.limit) {
      url += `?page=${params.page || 1}&limit=${params.limit || 10}`;
    }
    return fetchAPI(url);
  },
  
  // Récupérer les statistiques des postes
  getStats: async (): Promise<PosteStats> => {
    return fetchAPI(`${API_URL}/stats/count`);
  },
};

export default posteService;