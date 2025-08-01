// Interfaces
export interface Porte {
  id?: number;
  nom: string;
  departement?: any;
  batiment?: any;
  zonesAccess?: any[];
  accessSystems?: any[];
}

export interface PorteDTO {
  nom: string;
  departementId: number;
  batimentId: number;
  zonesAccess?: number[];
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

const API_URL = 'http://localhost:3000/porte';

// Fonction utilitaire pour créer les headers avec authentification
const createHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return headers;
};

// Fonction utilitaire pour les requêtes HTTP
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

// Service simplifié
const porteService = {
  getAll: async (): Promise<Porte[]> => {
    return fetchAPI(API_URL);
  },

  getPaginated: async (params: PaginationParams): Promise<PaginatedResponse<Porte>> => {
    return fetchAPI(`${API_URL}/paginated?page=${params.page}&limit=${params.limit}`);
  },

  getById: async (id: number): Promise<Porte> => {
    return fetchAPI(`${API_URL}/${id}`);
  },

  create: async (porte: PorteDTO): Promise<Porte> => {
    return fetchAPI(API_URL, {
      method: 'POST',
      body: JSON.stringify(porte),
    });
  },

  update: async (id: number, porte: PorteDTO): Promise<Porte> => {
    return fetchAPI(`${API_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(porte),
    });
  },

  delete: async (id: number): Promise<any> => {
    return fetchAPI(`${API_URL}/${id}`, { method: 'DELETE' });
  },

  search: async (searchTerm: string, params?: PaginationParams): Promise<PaginatedResponse<Porte> | Porte[]> => {
    let url = `${API_URL}/search/${encodeURIComponent(searchTerm)}`;
    if (params) url += `?page=${params.page}&limit=${params.limit}`;
    return fetchAPI(url);
  },

  getByBatimentId: async (batimentId: number, params?: PaginationParams): Promise<PaginatedResponse<Porte> | Porte[]> => {
    let url = `${API_URL}/batiment/${batimentId}`;
    if (params) url += `?page=${params.page}&limit=${params.limit}`;
    return fetchAPI(url);
  },

  // Alias pour getByBatimentId
  getByBatiment: async (batimentId: number, params?: PaginationParams): Promise<PaginatedResponse<Porte> | Porte[]> => {
    return porteService.getByBatimentId(batimentId, params);
  },

  getByDepartement: async (departementId: number, params?: PaginationParams): Promise<PaginatedResponse<Porte> | Porte[]> => {
    let url = `${API_URL}/departement/${departementId}`;
    if (params) url += `?page=${params.page}&limit=${params.limit}`;
    return fetchAPI(url);
  },

  getStats: async (): Promise<{ totalPortes: number; totalDepartements: number }> => {
    try {
      return await fetchAPI(`${API_URL}/stats`);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des portes:', error);
      return { totalPortes: 0, totalDepartements: 0 };
    }
  },
};

export default porteService;