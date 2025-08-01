// Interface pour le système d'accès basée sur l'entité backend
export interface AccessSystem {
  id?: number;
  Marque: string;
  Modele: string;
  status: boolean;
  DateDernierSucces: Date;
  porte?: any; // Relation avec une porte
  batiment?: any; // Relation avec un bâtiment
  batimentId?: number; // ID du bâtiment associé
  // Ces champs peuvent être présents dans les réponses de statut
  AdresseIP?: string;
  Port?: number;
}

// Interface pour les paramètres de pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Interface pour la réponse paginée
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

// Interface pour les données formatées des systèmes d'accès pour l'affichage
export interface FormattedAccessSystem {
  id: string;
  Marque: string;
  Modele: string;
  AdresseIP: string;
  Port: string;
  door: string;
  status: string;
  lastSuccess: string;
  building: string;
  buildingId: string;
  company: string;
  rawData: AccessSystem; // Données brutes du système d'accès
}

// Type pour le système sélectionné dans le formulaire
export type SelectedSystem = {
  id: string;
  brand: string;
  model: string;
  ipAddress: string;
  port: string;
  door: string;
  building: string;
  company?: string;
  doorId?: string;
  buildingId?: string;
} | undefined;

// Interface pour la création d'un système d'accès
export interface CreateAccessSystemDTO {
  Marque: string;
  Modele: string;
  porteId: number;
  batimentId?: number;
  status?: boolean;
}

// Interface pour la mise à jour d'un système d'accès
export interface UpdateAccessSystemDTO {
  Marque?: string;
  Modele?: string;
  porteId?: number;
  batimentId?: number;
  status?: boolean;
}

// Interface pour les réponses d'action de contrôle de porte
export interface DoorControlResponse {
  success: boolean;
  message: string;
  timestamp: Date;
  systemId: number;
  action: string;
}

const API_URL = 'http://localhost:3000/access-system';

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

// Fonction utilitaire pour construire les URLs avec paramètres
const buildUrl = (endpoint: string, params?: PaginationParams): string => {
  const url = new URL(`${API_URL}${endpoint}`);
  if (params?.page) url.searchParams.append('page', params.page.toString());
  if (params?.limit) url.searchParams.append('limit', params.limit.toString());
  return url.toString();
};

const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      headers: createHeaders(),
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur API pour ${endpoint}:`, error);
    throw error;
  }
};

const accessSystemService = {
  getAll: async (): Promise<AccessSystem[]> => {
    return apiRequest<AccessSystem[]>('');
  },
  
  getPaginated: async (params?: PaginationParams): Promise<PaginatedResponse<AccessSystem>> => {
    const url = buildUrl('/paginated', params);
    return fetch(url, {
      credentials: 'include',
      headers: createHeaders(),
    }).then(response => {
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      return response.json();
    }).catch(error => {
      console.error('Erreur lors de la récupération des systèmes d\'accès paginés:', error);
      throw error;
    });
  },

  getById: async (id: number): Promise<AccessSystem> => {
    return apiRequest<AccessSystem>(`/${id}`);
  },
  getStatus: async (id: number): Promise<AccessSystem> => {
    return apiRequest<AccessSystem>(`/${id}/status`);
  },

  create: async (accessSystem: CreateAccessSystemDTO): Promise<AccessSystem> => {
    console.log('Tentative de création d\'un système d\'accès avec les données:', accessSystem);
    
    if (!accessSystem.Marque || !accessSystem.Modele || !accessSystem.porteId) {
      console.error('Données manquantes pour la création du système d\'accès:', {
        marquePresente: !!accessSystem.Marque,
        modelePresent: !!accessSystem.Modele,
        porteIdPresent: !!accessSystem.porteId,
        batimentIdPresent: !!accessSystem.batimentId
      });
      throw new Error('Données incomplètes pour la création du système d\'accès');
    }

    const result = await apiRequest<AccessSystem>('', {
      method: 'POST',
      body: JSON.stringify(accessSystem),
    });
    
    console.log('Système d\'accès créé avec succès:', result);
    return result;
  },
  
  update: async (id: number, accessSystem: UpdateAccessSystemDTO): Promise<AccessSystem> => {
    return apiRequest<AccessSystem>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(accessSystem),
    });
  },

  controlDoor: async (
    id: number, 
    action: 'open' | 'close', 
    cardInfo?: { cardId: string, userId?: number }
  ): Promise<DoorControlResponse> => {
    return apiRequest<DoorControlResponse>(`/${id}/control`, {
      method: 'POST',
      body: JSON.stringify({
        ...cardInfo,
        action: action
      }),
    });
  },

  delete: async (id: number): Promise<{ message: string; id: number; deleted: boolean }> => {
    try {
      const response = await apiRequest<{ message: string; id: number; deleted: boolean }>(`/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Erreur lors de la suppression du système d'accès ${id}:`, error);
      throw error;
    }
  },

  getByBatimentId: async (
    batimentId: number, 
    params?: PaginationParams
  ): Promise<AccessSystem[] | PaginatedResponse<AccessSystem>> => {
    const url = buildUrl(`/batiment/${batimentId}`, params);
    console.log('URL de filtrage par bâtiment:', url);
    return fetch(url, {
      credentials: 'include',
      headers: createHeaders(),
    }).then(response => {
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      return response.json();
    }).catch(error => {
      console.error(`Erreur lors de la récupération des systèmes d'accès pour le bâtiment ${batimentId}:`, error);
      throw error;
    });
  },

  // Rechercher par marque
  searchByMarque: async (
    marque: string, 
    params?: PaginationParams
  ): Promise<AccessSystem[] | PaginatedResponse<AccessSystem>> => {
    const url = buildUrl(`/search/${marque}`, params);
    return fetch(url, {
      credentials: 'include',
      headers: createHeaders(),
    }).then(response => {
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      return response.json();
    }).catch(error => {
      console.error(`Erreur lors de la recherche des systèmes d'accès par marque ${marque}:`, error);
      throw error;
    });
  },

  // Récupérer les statistiques
  getStats: async (): Promise<{ 
    totalSystems: number; 
    onlineSystems: number; 
    offlineSystems: number; 
    totalBatiments: number 
  }> => {
    try {
      return await apiRequest<{ 
        totalSystems: number; 
        onlineSystems: number; 
        offlineSystems: number; 
        totalBatiments: number 
      }>('/stats');
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des systèmes d\'accès:', error);
      return { totalSystems: 0, onlineSystems: 0, offlineSystems: 0, totalBatiments: 0 };
    }
  },

};

export default accessSystemService;