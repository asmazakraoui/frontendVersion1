import authService from './authService';

// Interface pour les journaux d'accès
export interface AccessLog {
  id: number;
  cardId: string;
  timestamp: Date | string;
  type: string;
  employeeId: number;
  accessSystemId: number;
  success?: boolean;  
  message?: string; 
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    cardId?: string;
    phoneNumber?: string;
    address?: string;
  };
  accessSystem?: {
    id: number;
    name?: string;
    Marque: string;
    Modele: string;
    AdresseIP: string;
    Port: number;
    batimentId?: number;
  };
}

// Interface pour les filtres de recherche
export interface AccessLogFilter {
  startDate?: Date;
  endDate?: Date;
  employeeId?: number;
  accessSystemId?: number;
  cardId?: string;
}

// Service pour les journaux d'accès
class AccessLogService {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  async getAllAccessLogs(): Promise<AccessLog[]> {
    try {
      const token = authService.getAccessToken();
      
      if (!token) {
        console.warn('Aucun token d\'authentification trouvé');
        return [];
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout
      
      const response = await fetch(`${this.apiUrl}/access-log`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        try {
          await authService.refreshToken();
          return this.getAllAccessLogs();
        } catch (refreshError) {
          console.error('Erreur lors du rafraîchissement du token:', refreshError);
          window.location.href = '/signin';
          return [];
        }
      }
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des journaux d\'accès: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error('La requête a été abandonnée après le délai d\'attente');
      } else {
        console.error('Erreur dans getAllAccessLogs:', error);
      }
      return [];
    }
  }
  
  // Récupérer les journaux d'accès par plage de dates
  async getAccessLogsByDateRange(startDate: Date, endDate: Date): Promise<AccessLog[]> {
    try {
      const token = authService.getAccessToken();
      
      if (!token) {
        console.warn('Aucun token d\'authentification trouvé');
        return [];
      }
      
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout
      
      const response = await fetch(
        `${this.apiUrl}/access-log/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        // Token expiré ou invalide, essayer de rafraîchir
        try {
          await authService.refreshToken();
          // Réessayer avec le nouveau token
          return this.getAccessLogsByDateRange(startDate, endDate);
        } catch (refreshError) {
          console.error('Erreur lors du rafraîchissement du token:', refreshError);
          window.location.href = '/signin';
          return [];
        }
      }
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des journaux d\'accès par plage de dates: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error('La requête a été abandonnée après le délai d\'attente');
      } else {
        console.error('Erreur dans getAccessLogsByDateRange:', error);
      }
      return [];
    }
  }
  
  // Récupérer les journaux d'accès par utilisateur
  async getAccessLogsByUserId(userId: number): Promise<AccessLog[]> {
    try {
      const token = authService.getAccessToken();
      const response = await fetch(`${this.apiUrl}/access-log/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des journaux d\'accès par utilisateur');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans getAccessLogsByUserId:', error);
      return [];
    }
  }


  
  
  async getAccessLogsByAccessSystemId(accessSystemId: number): Promise<AccessLog[]> {
    try {
      const token = authService.getAccessToken();
      const response = await fetch(`${this.apiUrl}/access-log/access-system/${accessSystemId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des journaux d\'accès par système d\'accès');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans getAccessLogsByAccessSystemId:', error);
      return [];
    }
  }
  
  async getAccessLogsByCardId(cardId: string): Promise<AccessLog[]> {
    try {
      const token = authService.getAccessToken();
      const response = await fetch(`${this.apiUrl}/access-log/card/${cardId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des journaux d\'accès par carte');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans getAccessLogsByCardId:', error);
      return [];
    }
  }
  
  async getFilteredLogs(type?: string, success?: boolean): Promise<AccessLog[]> {
    try {
      // Construire l'URL avec les filtres sélectionnés
      let url = `${this.apiUrl}/access-log`;
      const params = new URLSearchParams();
      
      if (type) {
        params.append('type', type);
      }
      
      if (success !== undefined) {
        params.append('success', success.toString());
      }
      
      if (params.toString()) {
        url = `${this.apiUrl}/access-log/simple-filter?${params.toString()}`;
      }
      
      const token = authService.getAccessToken();
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors du chargement des logs filtrés:", error);
      return [];
    }
  }
  
  // Récupérer les journaux d'accès avec filtres combinés
  async getFilteredAccessLogs(filters: AccessLogFilter): Promise<AccessLog[]> {
    try {
      // D'abord, récupérer tous les journaux
      let logs = await this.getAllAccessLogs();
      
      // Appliquer les filtres côté client
      if (filters.startDate && filters.endDate) {
        const startTimestamp = new Date(filters.startDate).getTime();
        const endTimestamp = new Date(filters.endDate).getTime();
        
        logs = logs.filter(log => {
          const logTimestamp = new Date(log.timestamp).getTime();
          return logTimestamp >= startTimestamp && logTimestamp <= endTimestamp;
        });
      }
      
      if (filters.employeeId) {
        logs = logs.filter(log => log.employeeId === filters.employeeId);
      }
      
      if (filters.accessSystemId) {
        logs = logs.filter(log => log.accessSystemId === filters.accessSystemId);
      }
      
      if (filters.cardId) {
        logs = logs.filter(log => log.cardId === filters.cardId);
      }
      
      return logs;
    } catch (error) {
      console.error('Erreur dans getFilteredAccessLogs:', error);
      return [];
    }
  }
  
  // Exporter les journaux d'accès au format CSV
  exportToCSV(logs: AccessLog[]): string {
    // En-têtes CSV
    const headers = [
      'ID', 
      'Carte ID', 
      'Date et heure', 
      'Type', 
      'Utilisateur', 
      'Système d\'accès'
    ];
    
    // Convertir les journaux en lignes CSV
    const rows = logs.map(log => [
      log.id,
      log.cardId,
      new Date(log.timestamp).toLocaleString('fr-FR'),
      log.type === 'ENTRY' ? 'Entrée' : 'Sortie',
      log.employee ? `${log.employee.firstName} ${log.employee.lastName} (${log.employee.cardId || 'N/A'})` : 'N/A',
      log.accessSystem ? `${log.accessSystem.Marque} ${log.accessSystem.Modele} (${log.accessSystem.AdresseIP}:${log.accessSystem.Port})` : 'N/A'
    ]);
    
    // Combiner en-têtes et lignes
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }
  
  // Télécharger les journaux d'accès au format CSV
  downloadCSV(logs: AccessLog[], filename = 'journaux-acces.csv'): void {
    const csvContent = this.exportToCSV(logs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const accessLogService = new AccessLogService();
