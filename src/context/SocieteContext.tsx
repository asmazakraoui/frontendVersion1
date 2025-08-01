// "use client";

// import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
// import societeService, { Societe } from '../services/societeService';

// interface SocieteContextType {
//   societes: Societe[];
//   selectedSociete: Societe | null;
//   loading: boolean;
//   error: string | null;
//   selectSociete: (societe: Societe | null) => void;
// }

// const SocieteContext = createContext<SocieteContextType>({
//   societes: [],
//   selectedSociete: null,
//   loading: false,
//   error: null,
//   selectSociete: () => {},
// });

// interface SocieteProviderProps {
//   children: ReactNode;
// }

// export const SocieteProvider: React.FC<SocieteProviderProps> = ({ children }) => {
//   const [societes, setSocietes] = useState<Societe[]>([]);
//   const [selectedSociete, setSelectedSociete] = useState<Societe | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchSocietes = async () => {
//       try {
//         setLoading(true);
//         console.log('SocieteContext: Chargement des sociétés...');
//         const data = await societeService.getAll();
//         console.log('SocieteContext: Sociétés reçues:', data);
//         setSocietes(data);
        
//         // Récupérer la société sauvegardée
//         const savedSocieteId = localStorage.getItem('selectedSocieteId');
//         console.log('SocieteContext: ID sauvegardé:', savedSocieteId);
        
//         if (savedSocieteId && savedSocieteId !== 'null' && data.length > 0) {
//           const savedSociete = data.find((s: Societe) => s.id === parseInt(savedSocieteId));
//           if (savedSociete) {
//             console.log('SocieteContext: Société sauvegardée trouvée:', savedSociete);
//             setSelectedSociete(savedSociete);
//             // Stocker l'ID de la société dans localStorage pour les autres services
//             localStorage.setItem('societeId', savedSociete.id.toString());
//           } else {
//             console.log('SocieteContext: Société sauvegardée non trouvée');
//             setSelectedSociete(null);
//             localStorage.removeItem('selectedSocieteId');
//             localStorage.removeItem('societeId');
//           }
//         } else {
//           console.log('SocieteContext: Aucune société sauvegardée');
//           setSelectedSociete(null);
//           localStorage.removeItem('societeId');
//         }
//       } catch (err) {
//         setError('Erreur lors du chargement des sociétés');
//         console.error('SocieteContext: Erreur:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSocietes();
//   }, []);

//   const selectSociete = (societe: Societe | null) => {
//     console.log('=== CHANGEMENT DE SOCIÉTÉ ===');
//     console.log('Ancienne société:', selectedSociete);
//     console.log('Nouvelle société:', societe);
    
//     setSelectedSociete(societe);
    
//     if (societe) {
//       localStorage.setItem('selectedSocieteId', societe.id.toString());
//       localStorage.setItem('societeId', societe.id.toString());
//       console.log('Société sauvegardée dans localStorage:', societe.id);
//     } else {
//       localStorage.removeItem('selectedSocieteId');
//       localStorage.removeItem('societeId');
//       console.log('Société supprimée du localStorage');
//     }
    
//     console.log('État mis à jour, les composants devraient se re-render');
//   };

//   return (
//     <SocieteContext.Provider value={{
//       societes,
//       selectedSociete,
//       loading,
//       error,
//       selectSociete,
//     }}>
//       {children}
//     </SocieteContext.Provider>
//   );
// };

// // Hook personnalisé pour utiliser le contexte
// export const useSociete = () => useContext(SocieteContext);
// // export const useSociete = () => {
// //   const context = useContext(SocieteContext);
// //   if (!context) {
// //     throw new Error('useSociete doit être utilisé dans un SocieteProvider');
// //   }
// //   return context;
// // };

// // export default SocieteContext;