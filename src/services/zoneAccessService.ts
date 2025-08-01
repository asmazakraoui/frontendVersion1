// Interface pour les zones d'accès
export interface ZoneAccess {
  id?: number;
  nom: string;
  portes?: any[];
}

// Interface pour la création et mise à jour des zones d'accès
export interface ZoneAccessDTO {
  nom: string;
  porteIds?: number[];
}

// URL de base de l'API
const API_URL = 'http://localhost:3000/zone-access';

// Service pour gérer les zones d'accès
const zoneAccessService = {
  // Récupérer toutes les zones d'accès
  getAll: async (): Promise<ZoneAccess[]> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des zones d\'accès:', error);
      throw error;
    }
  },

  // Récupérer une zone d'accès par son ID
  getById: async (id: number): Promise<ZoneAccess> => {
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
      console.error(`Erreur lors de la récupération de la zone d'accès ${id}:`, error);
      throw error;
    }
  },

  // Créer une nouvelle zone d'accès
  create: async (zoneAccess: ZoneAccessDTO): Promise<ZoneAccess> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(zoneAccess),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de la zone d\'accès:', error);
      throw error;
    }
  },

  // Mettre à jour une zone d'accès existante
  update: async (id: number, zoneAccess: ZoneAccessDTO): Promise<ZoneAccess> => {
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
        body: JSON.stringify(zoneAccess),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la zone d'accès ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une zone d'accès
  delete: async (id: number): Promise<void> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de la zone d'accès ${id}:`, error);
      throw error;
    }
  },

  search: async (searchTerm: string): Promise<ZoneAccess[]> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/search/${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        credentials: 'include',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la recherche des zones d\'accès:', error);
      throw error;
    }
  },
  
  // Filtrer les zones d'accès par bâtiment
  getByBatimentId: async (batimentId: number): Promise<ZoneAccess[]> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/batiment/${batimentId}`, {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la recherche des zones d\'accès:', error);
      throw error;
    }
  },

  /**
   * Récupérer les statistiques des zones d'accès
   * @returns Statistiques des zones d'accès
   */
  getStats: async (): Promise<{ totalZones: number; totalPortes: number; totalBatiments: number }> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/stats`, {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des zones d\'accès:', error);
      return { totalZones: 0, totalPortes: 0, totalBatiments: 0 };
    }
  },
};

export default zoneAccessService;