// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Pencil, Trash2, Plus, Building, MapPin, Globe } from "lucide-react"
// import toast, { Toaster } from "react-hot-toast"
// import societeService, { Societe, SocieteDTO } from "@/services/societeService"
// import { SocieteForm } from "./societe-form"
// function SocietesContent() {
//   // États
//   const [searchTerm, setSearchTerm] = useState("")
//   const [isFormOpen, setIsFormOpen] = useState(false)
//   const [selectedSociete, setSelectedSociete] = useState<Societe | undefined>(undefined)
//   const [societes, setSocietes] = useState<Societe[]>([])
//   const [loading, setLoading] = useState(true)
//   const [stats, setStats] = useState({ totalSocietes: 0, totalVilles: 0 })

//   // Chargement initial et recherche avec délai
//   useEffect(() => { fetchSocietes() }, [])
  
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       searchSocietes(searchTerm)
//     }, 300) // Délai réduit à 300ms pour une meilleure réactivité
//     return () => clearTimeout(delayDebounceFn)
//   }, [searchTerm])

//   // Fonctions de chargement des données
//   const fetchSocietes = async () => {
//     try {
//       setLoading(true)
//       const data = await societeService.getAll()
//       setSocietes(data)
      
//       // Calculer les statistiques
//       const uniqueVilles = new Set(data.map(s => s.ville))
//       setStats({
//         totalSocietes: data.length,
//         totalVilles: uniqueVilles.size
//       })
//     } catch (error) {
//       toast.error("Impossible de charger les sociétés")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const searchSocietes = async (term: string) => {
//     if (!term.trim()) return fetchSocietes()
    
//     try {
//       setLoading(true)
//       // Filtrer localement car le service n'a pas d'endpoint de recherche
//       const allSocietes = await societeService.getAll()
//       const filtered = allSocietes.filter(societe => 
//         societe.nom.toLowerCase().includes(term.toLowerCase()) ||
//         societe.ville.toLowerCase().includes(term.toLowerCase()) ||
//         societe.pays.toLowerCase().includes(term.toLowerCase())
//       )
//       setSocietes(filtered)
//     } catch (error) {
//       toast.error("Erreur lors de la recherche")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Fonctions CRUD
//   const handleCreateSociete = async (societe: SocieteDTO) => {
//     try {
//       await societeService.create(societe)
//       toast.success("Société créée avec succès")
//       setIsFormOpen(false)
//       fetchSocietes()
//     } catch (error) {
//       toast.error("Erreur lors de la création de la société")
//     }
//   }

//   const handleUpdateSociete = async (id: number, societe: SocieteDTO) => {
//     try {
//       await societeService.update(id, societe)
//       toast.success("Société mise à jour avec succès")
//       setIsFormOpen(false)
//       setSelectedSociete(undefined)
//       fetchSocietes()
//     } catch (error) {
//       toast.error("Erreur lors de la mise à jour de la société")
//     }
//   }

//   const handleDeleteSociete = async (id: number) => {
//     if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette société ?")) return
    
//     try {
//       await societeService.delete(id)
//       toast.success("Société supprimée avec succès")
//       fetchSocietes()
//     } catch (error) {
//       toast.error("Erreur lors de la suppression de la société")
//     }
//   }

//   const openEditForm = (societe: Societe) => {
//     setSelectedSociete(societe)
//     setIsFormOpen(true)
//   }

//   const closeForm = () => {
//     setIsFormOpen(false)
//     setSelectedSociete(undefined)
//   }

//   return (
//     <div className="flex flex-col space-y-6 p-8">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">Gestion des Sociétés</h1>
//         <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
//           <Plus size={16} /> Ajouter une société
//         </Button>
//       </div>

//       {/* Statistiques */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Sociétés</CardTitle>
//             <Building className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.totalSocietes}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Villes</CardTitle>
//             <MapPin className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.totalVilles}</div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recherche */}
//       <div className="flex items-center space-x-2">
//         <Input
//           placeholder="Rechercher une société..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="max-w-sm"
//         />
//       </div>

//       {/* Tableau des sociétés */}
//       <Card>
//         <CardContent className="p-0">
//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <p>Chargement des sociétés...</p>
//             </div>
//           ) : (
//             <>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Nom</TableHead>
//                     <TableHead>Ville</TableHead>
//                     <TableHead>Pays</TableHead>
//                     <TableHead>Bâtiments</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {societes && societes.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={5} className="text-center py-4">
//                         Aucune société trouvée
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     societes.map((societe) => (
//                       <TableRow key={societe.id}>
//                         <TableCell className="font-medium">
//                           {societe.nom}
//                         </TableCell>
//                         <TableCell>
//                           {societe.ville}
//                         </TableCell>
//                         <TableCell>
//                           {societe.pays}
//                         </TableCell>
//                         <TableCell>
//                           {societe.batiments?.length || 0}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <div className="flex justify-end gap-2">
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => openEditForm(societe)}
//                             >
//                               <Pencil className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => handleDeleteSociete(societe.id)}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </>
//           )}
//         </CardContent>
//       </Card>

//       {/* Formulaire de création/édition */}
//       {isFormOpen && (
//         <SocieteForm
//           societe={selectedSociete}
//           onSubmit={selectedSociete 
//             ? (data) => handleUpdateSociete(selectedSociete.id, data)
//             : handleCreateSociete
//           }
//           onCancel={closeForm}
//         />
//       )}
//     </div>
//   )
// }

// // Composant de page
// export default function SocietesManagePage() {
//   return (
//     <>
//       <SocietesContent />
//       <Toaster position="top-right" />
//     </>
//   )
// }
