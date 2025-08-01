// Interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  email: string;
  cardId?: string;
  userId?: number;
  user?: User;
  zonesAccess?: { id: number; name: string; description?: string }[];
  image?: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  email: string;
  cardId?: string;
  userId?: number;
  zoneAccessIds?: number[];
  image?: string;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  email?: string;
  cardId?: string;
  userId?: number;
  zoneAccessIds?: number[];
}

const API_URL = 'http://localhost:3000/employee';

// Fonction utilitaire pour créer les headers
const createHeaders = (isFormData = false): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return headers;
};

const fetchAPI = async (url: string, options: RequestInit = {}): Promise<any> => {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: createHeaders(options.body instanceof FormData),
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

const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    const employees = await fetchAPI(API_URL);
    console.log('Employés récupérés du serveur:', employees);
    
    for (const employee of employees) {
      if (employee.id) {
        try {
          const { imageUrl } = await fetchAPI(`${API_URL}/${employee.id}/image-url`);
          if (imageUrl) {
            console.log(`URL d'image pour l'employé ${employee.id}:`, imageUrl);
            employee.image = imageUrl;
          }
        } catch (imageError) {
          console.error(`Erreur lors de la récupération de l'image pour l'employé ${employee.id}:`, imageError);
        }
      }
    }
    
    return employees;
  },

  getById: async (id: number): Promise<Employee> => {
    return fetchAPI(`${API_URL}/${id}`);
  },

  create: async (employeeData: CreateEmployeeDto): Promise<Employee> => {
    return fetchAPI(API_URL, {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  update: async (id: number, employeeData: UpdateEmployeeDto): Promise<Employee> => {
    return fetchAPI(`${API_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(employeeData),
    });
  },

  delete: async (id: number): Promise<{ message: string; id: number; deleted: boolean }> => {
    return fetchAPI(`${API_URL}/${id}`, { method: 'DELETE' });
  },

  count: async (): Promise<number> => {
    return fetchAPI(`${API_URL}/count`);
  },

  uploadImage: async (id: number, imageFile: File): Promise<{ message: string; employee: Employee; imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return fetchAPI(`${API_URL}/${id}/image`, {
      method: 'POST',
      body: formData,
    });
  },

  removeImage: async (id: number): Promise<{ message: string; employee: Employee }> => {
    return fetchAPI(`${API_URL}/${id}/image`, { method: 'DELETE' });
  },

  getImageUrl: async (id: number): Promise<{ imageUrl: string | null }> => {
    return fetchAPI(`${API_URL}/${id}/image-url`);
  },
};

export default employeeService;