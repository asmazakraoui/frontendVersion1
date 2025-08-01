// Interface pour les utilisateurs (simplifiée)
export interface User {
  id: number;
  name: string;
  email: string;
}

// Interface pour les bâtiments
export interface Batiment {
  id?: number;
  name: string;
  adresse: string;
  numTel: string;
  userId?: number;
  user?: User;
  departements?: any[];
}

// Interface pour la pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

// Interface pour la réponse paginée
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface pour la création et mise à jour de bâtiments
export interface BatimentDTO {
  name: string;
  adresse: string;
  numTel: string;
  userId?: number;
}

// Adresse serveur
const API_URL = 'http://localhost:3000/batiment';

// Fonction utilitaire pour créer les en-têtes de requête
const createHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
};

const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      headers: createHeaders(),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur API pour ${endpoint}:`, error);
    throw error;
  }
};

// Service pour gérer les bâtiments
const batimentService = {
  // Récupérer les bâtiments avec pagination
  getPaginated: async (params: PaginationParams): Promise<PaginatedResponse<Batiment>> => {
    const result = await apiRequest<{ data: Batiment[]; total: number }>(
      `/paginated?page=${params.page}&limit=${params.limit}`
    );
    
    if (!result) throw new Error('Aucun résultat retourné');
    
    return {
      data: result.data,
      total: result.total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(result.total / params.limit)
    };
  },

  // Récupérer tous les bâtiments
  getAll: async (): Promise<Batiment[]> => {
    const result = await apiRequest<Batiment[]>('');
    return result || [];
  },

  // Récupérer un bâtiment par son ID
  getById: async (id: number): Promise<Batiment> => {
    const result = await apiRequest<Batiment>(`/${id}`);
    if (!result) throw new Error(`Bâtiment avec ID ${id} non trouvé`);
    return result;
  },

  // Créer un nouveau bâtiment
  create: async (batiment: BatimentDTO): Promise<Batiment> => {
    const result = await apiRequest<Batiment>('', {
      method: 'POST',
      body: JSON.stringify(batiment),
    });
    if (!result) throw new Error('Erreur lors de la création du bâtiment');
    return result;
  },

  // Mettre à jour un bâtiment existant
  update: async (id: number, batiment: BatimentDTO): Promise<Batiment> => {
    const result = await apiRequest<Batiment>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(batiment),
    });
    if (!result) throw new Error(`Erreur lors de la mise à jour du bâtiment ${id}`);
    return result;
  },

  // Supprimer un bâtiment
  delete: async (id: number): Promise<void> => {
    await apiRequest<void>(`/${id}`, {
      method: 'DELETE',
    });
  },

  // Rechercher des bâtiments
  search: async (
    searchTerm: string, 
    params?: PaginationParams
  ): Promise<PaginatedResponse<Batiment> | Batiment[]> => {
    const encodedTerm = encodeURIComponent(searchTerm);
    const endpoint = params
      ? `/search/${encodedTerm}?page=${params.page}&limit=${params.limit}`
      : `/search/${encodedTerm}`;
    
    const result = await apiRequest<{ data: Batiment[]; total: number }>(endpoint);
    
    if (!result) {
      return params ? { data: [], total: 0, page: params.page, limit: params.limit, totalPages: 0 } : [];
    }
    
    if (params) {
      return {
        data: result.data,
        total: result.total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(result.total / params.limit)
      };
    }
    
    return result.data || [];
  },

  // Récupérer les statistiques des bâtiments
  getStats: async (): Promise<{ 
    totalBatiments: number; 
    totalVilles: number; 
    totalContacts: number 
  }> => {
    const result = await apiRequest<{ 
      totalBatiments: number; 
      totalVilles: number; 
      totalContacts: number 
    }>('/stats');
    
    if (!result) {
      return { totalBatiments: 0, totalVilles: 0, totalContacts: 0 };
    }
    
    return result;
  },
};

export default batimentService;