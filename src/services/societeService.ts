// // Interface pour les sociétés
// export interface Societe {
//   id: number;
//   nom: string;
//   adresse: string;
//   codePostal: string;
//   ville: string;
//   pays: string;
//   batiments?: any[];
// }

// // Interface pour la création et mise à jour de sociétés
// export interface SocieteDTO {
//   nom: string;
//   adresse: string;
//   codePostal: string;
//   ville: string;
//   pays: string;
// }

// // Adresse serveur
// const API_URL = 'http://localhost:3000/societe';

// // Service pour gérer les sociétés
// const societeService = {
//   // Récupérer toutes les sociétés
//   getAll: async (): Promise<Societe[]> => {
//     try {
//       const accessToken = localStorage.getItem('accessToken');
//       const headers: Record<string, string> = {
//         'Content-Type': 'application/json',
//       };
//       if (accessToken) {
//         headers['Authorization'] = `Bearer ${accessToken}`;
//       }
      
//       const response = await fetch(API_URL, {
//         method: 'GET',
//         credentials: 'include',
//         headers,
//       });
      
//       if (!response.ok) {
//         throw new Error(`Erreur HTTP: ${response.status}`);
//       }
      
//       return await response.json();
//     } catch (error) {
//       console.error('Erreur lors de la récupération des sociétés:', error);
//       throw error;
//     }
//   },
  
//   // Récupérer une société par son ID
//   getById: async (id: number): Promise<Societe> => {
//     try {
//       const accessToken = localStorage.getItem('accessToken');
//       const headers: Record<string, string> = {
//         'Content-Type': 'application/json',
//       };
//       if (accessToken) {
//         headers['Authorization'] = `Bearer ${accessToken}`;
//       }
      
//       const response = await fetch(`${API_URL}/${id}`, {
//         method: 'GET',
//         credentials: 'include',
//         headers,
//       });
      
//       if (!response.ok) {
//         throw new Error(`Erreur HTTP: ${response.status}`);
//       }
      
//       return await response.json();
//     } catch (error) {
//       console.error(`Erreur lors de la récupération de la société ${id}:`, error);
//       throw error;
//     }
//   },
  
//   // Créer une nouvelle société
//   create: async (societe: SocieteDTO): Promise<Societe> => {
//     try {
//       const accessToken = localStorage.getItem('accessToken');
//       const headers: Record<string, string> = {
//         'Content-Type': 'application/json',
//       };
//       if (accessToken) {
//         headers['Authorization'] = `Bearer ${accessToken}`;
//       }
      
//       const response = await fetch(API_URL, {
//         method: 'POST',
//         credentials: 'include',
//         headers,
//         body: JSON.stringify(societe),
//       });
      
//       if (!response.ok) {
//         throw new Error(`Erreur HTTP: ${response.status}`);
//       }
      
//       return await response.json();
//     } catch (error) {
//       console.error('Erreur lors de la création de la société:', error);
//       throw error;
//     }
//   },
  
//   // Mettre à jour une société existante
//   update: async (id: number, societe: SocieteDTO): Promise<Societe> => {
//     try {
//       const accessToken = localStorage.getItem('accessToken');
//       const headers: Record<string, string> = {
//         'Content-Type': 'application/json',
//       };
//       if (accessToken) {
//         headers['Authorization'] = `Bearer ${accessToken}`;
//       }
      
//       const response = await fetch(`${API_URL}/${id}`, {
//         method: 'PATCH',
//         credentials: 'include',
//         headers,
//         body: JSON.stringify(societe),
//       });
      
//       if (!response.ok) {
//         throw new Error(`Erreur HTTP: ${response.status}`);
//       }
      
//       return await response.json();
//     } catch (error) {
//       console.error(`Erreur lors de la mise à jour de la société ${id}:`, error);
//       throw error;
//     }
//   },
  
//   // Supprimer une société
//   delete: async (id: number): Promise<void> => {
//     try {
//       const accessToken = localStorage.getItem('accessToken');
//       const headers: Record<string, string> = {
//         'Content-Type': 'application/json',
//       };
//       if (accessToken) {
//         headers['Authorization'] = `Bearer ${accessToken}`;
//       }
      
//       const response = await fetch(`${API_URL}/${id}`, {
//         method: 'DELETE',
//         credentials: 'include',
//         headers,
//       });
      
//       if (!response.ok) {
//         throw new Error(`Erreur HTTP: ${response.status}`);
//       }
//     } catch (error) {
//       console.error(`Erreur lors de la suppression de la société ${id}:`, error);
//       throw error;
//     }
//   },
// };

// export default societeService;