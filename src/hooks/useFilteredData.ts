// "use client";

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useSociete } from '@/context/SocieteContext';

// type FetchOptions = {
//   fetchAllFn: () => Promise<any[]>;
//   fetchBySocieteFn: (societeId: number) => Promise<any[]>;
//   searchFn?: (term: string) => Promise<any[]>;
//   entityName: string;
// };

// export function useFilteredData<T>(options: FetchOptions) {
//   const { fetchAllFn, fetchBySocieteFn, searchFn, entityName } = options;
//   const { selectedSociete } = useSociete();
//   const [data, setData] = useState<T[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState<string>('');
  
//   // Ref pour éviter les appels multiples
//   const isLoadingRef = useRef(false);
//   const lastSocieteIdRef = useRef<number | null>(null);

//   const fetchData = useCallback(async (forceRefresh = false) => {
//     const currentSocieteId = selectedSociete?.id || null;
    
//     // Éviter les appels multiples
//     if (isLoadingRef.current && !forceRefresh) {
//       console.log(`useFilteredData[${entityName}]: Appel en cours, ignoré`);
//       return;
//     }
    
//     // Éviter les appels inutiles
//     if (!forceRefresh && lastSocieteIdRef.current === currentSocieteId) {
//       console.log(`useFilteredData[${entityName}]: Même société, pas de rechargement`);
//       return;
//     }
    
//     console.log(`useFilteredData[${entityName}]: === DÉBUT FETCH DATA ===`);
//     console.log(`useFilteredData[${entityName}]: Société sélectionnée:`, selectedSociete);
//     console.log(`useFilteredData[${entityName}]: ID société: ${currentSocieteId}`);
    
//     isLoadingRef.current = true;
//     lastSocieteIdRef.current = currentSocieteId;
    
//     try {
//       setLoading(true);
//       setError(null);
      
//       let result;
      
//       if (currentSocieteId) {
//         console.log(`useFilteredData[${entityName}]: Appel fetchBySocieteFn avec ID: ${currentSocieteId}`);
//         result = await fetchBySocieteFn(currentSocieteId);
//       } else {
//         console.log(`useFilteredData[${entityName}]: Appel fetchAllFn`);
//         result = await fetchAllFn();
//       }
      
//       console.log(`useFilteredData[${entityName}]: Résultats reçus:`, result);
//       console.log(`useFilteredData[${entityName}]: Nombre d'éléments: ${result.length}`);
      
//       setData(result as T[]);
      
//     } catch (err) {
//       console.error(`useFilteredData[${entityName}]: Erreur:`, err);
//       setError(`Erreur lors de la récupération des ${entityName}`);
//     } finally {
//       setLoading(false);
//       isLoadingRef.current = false;
//       console.log(`useFilteredData[${entityName}]: === FIN FETCH DATA ===`);
//     }
//   }, [selectedSociete?.id, fetchAllFn, fetchBySocieteFn, entityName]);

//   const search = useCallback(async (term: string) => {
//     if (!searchFn) return;
    
//     if (!term.trim()) {
//       return fetchData(true);
//     }
    
//     try {
//       setLoading(true);
//       setError(null);
      
//       console.log(`useFilteredData[${entityName}]: Recherche: "${term}"`);
//       let result = await searchFn(term);
      
//       if (selectedSociete?.id) {
//         console.log(`useFilteredData[${entityName}]: Filtrage pour société ${selectedSociete.nom}`);
//         result = result.filter((item: any) => {
//           return item.societeId === selectedSociete.id || 
//                  (item.batiment && item.batiment.societeId === selectedSociete.id);
//         });
//       }
      
//       setData(result as T[]);
//     } catch (err) {
//       console.error(`useFilteredData[${entityName}]: Erreur recherche:`, err);
//       setError(`Erreur lors de la recherche des ${entityName}`);
//     } finally {
//       setLoading(false);
//     }
//   }, [searchFn, fetchData, selectedSociete?.id, selectedSociete?.nom, entityName]);

//   // Effect principal - se déclenche quand la société change
//   useEffect(() => {
//     console.log(`useFilteredData[${entityName}]: *** EFFECT SOCIÉTÉ CHANGÉE ***`);
//     console.log(`useFilteredData[${entityName}]: Nouvelle société:`, selectedSociete);
    
//     // Reset search term
//     setSearchTerm('');
    
//     // Fetch data
//     fetchData(true);
    
//   }, [selectedSociete?.id, entityName]); // Dépendance sur l'ID seulement

//   // Effect pour la recherche
//   useEffect(() => {
//     if (!searchTerm.trim() || !searchFn) return;
    
//     const delayDebounceFn = setTimeout(() => {
//       search(searchTerm);
//     }, 300);
    
//     return () => clearTimeout(delayDebounceFn);
//   }, [searchTerm, search, searchFn]);

//   return { 
//     data, 
//     loading, 
//     error, 
//     fetchData: () => fetchData(true), 
//     search, 
//     searchTerm, 
//     setSearchTerm,
//     selectedSociete 
//   };
// }
