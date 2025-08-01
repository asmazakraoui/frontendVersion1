import { useState, useEffect } from 'react';
import authService, { CurrentUser } from '../services/authService';

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer l'ID de l'utilisateur depuis le localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setLoading(false);
          return;
        }
        
        // Récupérer les données du localStorage
        const userName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');
        const userRole = localStorage.getItem('userRole');
        
        console.log('Données utilisateur du localStorage:', { userId, userName, userEmail, userRole });
        
        // Créer un utilisateur simplifié à partir des données du localStorage
        if (userName || userEmail || userRole) {
          setUser({
            id: parseInt(userId),
            name: userName || 'Utilisateur',
            email: userEmail || 'email@exemple.com',
            role: userRole || 'Utilisateur'
          });
        }
        
        // Essayer de récupérer les données complètes depuis le backend
        try {
          // Utiliser directement l'API utilisateur plutôt que l'API auth/me
          const accessToken = localStorage.getItem('accessToken');
          if (!accessToken) {
            throw new Error('Pas de token d\'accès');
          }
          
          const response = await fetch(`http://localhost:3000/user/${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          const userData = await response.json();
          console.log('Données utilisateur récupérées depuis l\'API:', userData);
          
          if (userData) {
            setUser(userData);
            
            // Mettre à jour le localStorage avec les données fraîches
            localStorage.setItem('userName', userData.name || '');
            localStorage.setItem('userEmail', userData.email || '');
            localStorage.setItem('userRole', userData.role || '');
          }
        } catch (apiError) {
          console.error('Erreur API:', apiError);
          // On continue avec les données du localStorage
        }
      } catch (err) {
        setError('Erreur lors de la récupération des données utilisateur');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fonction pour mettre à jour les données utilisateur
  const updateUser = (newUserData: Partial<CurrentUser>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    
    // Mettre à jour le localStorage
    if (newUserData.name) localStorage.setItem('userName', newUserData.name);
    if (newUserData.email) localStorage.setItem('userEmail', newUserData.email);
    if (newUserData.role) localStorage.setItem('userRole', newUserData.role);
  };

  return { user, loading, error, updateUser };
}
