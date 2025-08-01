import { format } from 'date-fns';
import { User } from './userService';

const API_URL = 'http://localhost:3000/jour-feries';

export interface JourFerie {
  id?: number;
  nom: string;
  date: Date | string;
  userId?: number;
  user?: User;
}

export interface JourFerieDTO {
  nom: string;
  date: Date | string;
  userId?: number;
}

// Fonction utilitaire pour créer les headers
const createHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
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

    return await response.json();
  } catch (error) {
    console.error(`Erreur API (${url}):`, error);
    throw error;
  }
};

// Fonction utilitaire pour convertir les dates
const convertDates = (data: any): JourFerie => ({
  ...data,
  date: new Date(data.date),
});

const formatDataForAPI = (jourFerie: JourFerieDTO) => ({
  ...jourFerie,
  date: jourFerie.date instanceof Date ? jourFerie.date.toISOString() : jourFerie.date,
});

const jourFerieService = {
  getAll: async (): Promise<JourFerie[]> => {
    const data = await fetchAPI(API_URL);
    return data.map(convertDates);
  },
  getById: async (id: number): Promise<JourFerie> => {
    const data = await fetchAPI(`${API_URL}/${id}`);
    return convertDates(data);
  },

  create: async (jourFerie: JourFerieDTO): Promise<JourFerie> => {
    const formattedData = formatDataForAPI(jourFerie);
    const data = await fetchAPI(API_URL, {
      method: 'POST',
      body: JSON.stringify(formattedData),
    });
    return convertDates(data);
  },

  update: async (id: number, jourFerie: JourFerieDTO): Promise<JourFerie> => {
    const formattedData = formatDataForAPI(jourFerie);
    const data = await fetchAPI(`${API_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(formattedData),
    });
    return convertDates(data);
  },

  delete: async (id: number): Promise<any> => {
    return fetchAPI(`${API_URL}/${id}`, { method: 'DELETE' });
  },
  search: async (searchTerm: string): Promise<JourFerie[]> => {
    const data = await fetchAPI(`${API_URL}/search/${searchTerm}`);
    return data.map(convertDates);
  },

  formatDate: (date: Date | string): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, 'dd/MM/yyyy');
  },
};

export default jourFerieService;