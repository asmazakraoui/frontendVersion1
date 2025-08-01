// Interfaces
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface Departement {
  id?: number;
  nom: string;
  description: string;
  batiment?: any;
  batimentId?: number;
  portes?: any[];
}

export interface DepartementDTO {
  nom: string;
  description: string;
  batimentId: number;
}

const API_URL = 'http://localhost:3000/departement';

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

    return options.method === 'DELETE' ? undefined : await response.json();
  } catch (error) {
    console.error(`Erreur API (${url}):`, error);
    throw error;
  }
};

const departementService = {
  getPaginated: async (params: PaginationParams): Promise<PaginatedResponse<Departement>> => {
    return fetchAPI(`${API_URL}/paginated?page=${params.page}&limit=${params.limit}`);
  },

  getAll: async (): Promise<Departement[]> => {
    return fetchAPI(API_URL);
  },

  getById: async (id: number): Promise<Departement> => {
    return fetchAPI(`${API_URL}/${id}`);
  },

  getByBatiment: async (batimentId: number, params?: PaginationParams): Promise<PaginatedResponse<Departement> | Departement[]> => {
    let url = `${API_URL}/batiment/${batimentId}`;
    if (params) url += `?page=${params.page}&limit=${params.limit}`;
    return fetchAPI(url);
  },

  create: async (departement: DepartementDTO): Promise<Departement> => {
    return fetchAPI(API_URL, {
      method: 'POST',
      body: JSON.stringify(departement),
    });
  },

  update: async (id: number, departement: DepartementDTO): Promise<Departement> => {
    return fetchAPI(`${API_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(departement),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchAPI(`${API_URL}/${id}`, { method: 'DELETE' });
  },

  search: async (searchTerm: string, params?: PaginationParams): Promise<PaginatedResponse<Departement>> => {
    let url = `${API_URL}/search/${encodeURIComponent(searchTerm)}`;
    if (params) url += `?page=${params.page}&limit=${params.limit}`;
    return fetchAPI(url);
  },

  getStats: async (): Promise<{ totalDepartements: number; totalBatiments: number }> => {
    return fetchAPI(`${API_URL}/stats`);
  },
};

export default departementService;