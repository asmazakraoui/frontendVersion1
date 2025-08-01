import authService from './authService';

export interface PeriodeTravail {
  id?: number;
  name: string;
  startTime: string;
  endTime: string;
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
  employeeId: number;
  employee?: any;
}

interface PeriodesTravailStats {
  total: number;
  matin: number;
  soir: number;
}

const API_URL = 'http://localhost:3000/periodes-travail';

// Fonction utilitaire pour créer les headers
const createHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = authService.getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

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
      return true;
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur API (${url}):`, error);
    throw error;
  }
};

const periodesTravailService = {
  getAll: async (): Promise<PeriodeTravail[]> => {
    try {
      return await fetchAPI(API_URL);
    } catch (error) {
      console.error('Erreur lors de la récupération des périodes de travail:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<PeriodeTravail | null> => {
    try {
      return await fetchAPI(`${API_URL}/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération de la période de travail ${id}:`, error);
      return null;
    }
  },

  getByEmployeeId: async (employeeId: number): Promise<PeriodeTravail[]> => {
    try {
      return await fetchAPI(`${API_URL}/employee/${employeeId}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération des périodes de travail pour l'employé ${employeeId}:`, error);
      return [];
    }
  },

  create: async (periodeTravail: PeriodeTravail): Promise<PeriodeTravail | null> => {
    try {
      return await fetchAPI(API_URL, {
        method: 'POST',
        body: JSON.stringify(periodeTravail),
      });
    } catch (error) {
      console.error('Erreur lors de la création de la période de travail:', error);
      return null;
    }
  },

  update: async (id: number, periodeTravail: Partial<PeriodeTravail>): Promise<PeriodeTravail | null> => {
    try {
      return await fetchAPI(`${API_URL}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(periodeTravail),
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la période de travail ${id}:`, error);
      return null;
    }
  },

  delete: async (id: number): Promise<boolean> => {
    try {
      await fetchAPI(`${API_URL}/${id}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la période de travail ${id}:`, error);
      return false;
    }
  },

  checkAccess: async (employeeId: number): Promise<boolean> => {
    try {
      return await fetchAPI(`${API_URL}/check-access/${employeeId}`);
    } catch (error) {
      return false;
    }
  },

  getStats: async (): Promise<PeriodesTravailStats> => {
    try {
      return await fetchAPI(`${API_URL}/stats/count`);
    } catch (error) {
      return { total: 0, matin: 0, soir: 0 };
    }
  },
};

export { periodesTravailService };