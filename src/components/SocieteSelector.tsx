// "use client";

// import React from 'react';
// import { useSociete } from '../context/SocieteContext';
// import { Societe } from '../services/societeService';
// import styles from '../styles/SocieteSelector.module.css';

// const SocieteSelector: React.FC = () => {
//   const { societes, selectedSociete, selectSociete, loading } = useSociete();

//   const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const value = e.target.value;
//     console.log('SocieteSelector: Changement détecté, valeur:', value);
    
//     if (value === 'all' || value === '') {
//       console.log('SocieteSelector: Sélection de "Toutes les sociétés"');
//       selectSociete(null);
//     } else {
//       const societeId = parseInt(value);
//       const societe = societes.find((s: Societe) => s.id === societeId);
//       console.log('SocieteSelector: Société trouvée:', societe);
      
//       if (societe) {
//         selectSociete(societe);
//       }
//     }
//   };

//   if (loading) {
//     return <div className={styles.selector}>Chargement des sociétés...</div>;
//   }

//   return (
//     <div className={styles.selector}>
//       <label htmlFor="societe-select">Société: </label>
//       <select
//         id="societe-select"
//         value={selectedSociete?.id?.toString() || 'all'}
//         onChange={handleChange}
//         className={styles.select}
//       >
//         <option value="all">Toutes les sociétés</option>
//         {societes.map((societe: Societe) => (
//           <option key={societe.id} value={societe.id.toString()}>
//             {societe.nom}
//           </option>
//         ))}
//       </select>
      
//       {/* Debug - supprimez cette div en production */}
//       <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
//         Debug: {selectedSociete ? `${selectedSociete.nom} (ID: ${selectedSociete.id})` : 'Toutes les sociétés'}
//       </div>
//     </div>
//   );
// };

// export default SocieteSelector;