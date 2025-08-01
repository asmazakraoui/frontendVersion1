// "use client";

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import userService, { User } from '../services/userService';

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   login: (email: string, password: string) => Promise<boolean>;
//   logout: () => void;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

//   // Vérifier si l'utilisateur est déjà connecté au chargement
//   useEffect(() => {
//     const storedToken = localStorage.getItem('accessToken'); // Utiliser la même clé que userService
    
//     if (storedToken) {
//       setToken(storedToken);
//       setIsAuthenticated(true);
      
//       // Récupérer les informations de l'utilisateur connecté
//       userService.getCurrentUser()
//         .then(currentUser => {
//           if (currentUser) {
//             setUser(currentUser);
//           }
//         })
//         .catch(error => {
//           console.error('Erreur lors de la récupération de l\'utilisateur:', error);
//           // En cas d'erreur (token expiré, etc.), déconnecter l'utilisateur
//           logout();
//         });
//     }
//   }, []);

//   const login = async (email: string, password: string): Promise<boolean> => {
//     try {
//       const response = await fetch('http://localhost:3000/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       if (!response.ok) {
//         throw new Error('Login failed');
//       }

//       const data = await response.json();
      
//       // Stocker le token et l'ID utilisateur avec les mêmes clés que userService
//       localStorage.setItem('accessToken', data.access_token);
//       localStorage.setItem('userId', data.user.id.toString());
      
//       console.log('Login réussi:', data);
//       console.log('Token stocké:', data.access_token);
//       console.log('UserID stocké:', data.user.id);
      
//       setToken(data.access_token);
//       setUser(data.user);
//       setIsAuthenticated(true);
      
//       return true;
//     } catch (error) {
//       console.error('Login error:', error);
//       return false;
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('userId');
//     setToken(null);
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
