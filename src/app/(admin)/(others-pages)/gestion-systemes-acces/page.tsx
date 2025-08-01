"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, Fingerprint, Wifi, DoorOpen, DoorClosed, RefreshCw, Info, Building, X, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { AccessSystemForm } from "./access-system-form"
import { useCompany, CompanyProvider } from "@/context/company-context"
import accessSystemService, { AccessSystem, CreateAccessSystemDTO, UpdateAccessSystemDTO, FormattedAccessSystem, SelectedSystem, PaginatedResponse } from "@/services/access-systemService"
import authService from "@/services/authService"
import batimentService from "@/services/batimentService"
import porteService from "@/services/porteService"
import { BuildingFilter } from "@/components/filters/BuildingFilter"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

function AccessSystemsContent() {
  const { selectedCompany } = useCompany()
  const [searchTerm, setSearchTerm] = useState("")
  const [buildingFilter, setBuildingFilter] = useState("0") // Initialisation à "0" pour être compatible avec BuildingFilter
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSystem, setSelectedSystem] = useState<SelectedSystem>(undefined)
  const [accessSystems, setAccessSystems] = useState<AccessSystem[]>([])
  const [formattedSystems, setFormattedSystems] = useState<FormattedAccessSystem[]>([])
  const [buildings, setBuildings] = useState<any[]>([])
  const [doors, setDoors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ totalSystems: 0, onlineSystems: 0, offlineSystems: 0, totalBatiments: 0 })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [systemToDelete, setSystemToDelete] = useState<FormattedAccessSystem | null>(null)
  
  // États pour la pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadData()
  }, [])
  
  // Effet pour déclencher la recherche automatiquement lorsque le terme de recherche ou le filtre de bâtiment change
  useEffect(() => {
    // Utiliser un debounce pour éviter trop d'appels API pendant la frappe
    const debounceTimeout = setTimeout(() => {
      loadData()
    }, 300) // Délai de 300ms avant de déclencher la recherche
    
    // Nettoyer le timeout si le composant est démonté ou si searchTerm/buildingFilter change à nouveau
    return () => clearTimeout(debounceTimeout)
  }, [searchTerm, buildingFilter, page, limit])



  const handleEdit = (system: FormattedAccessSystem) => {
    console.log('Données brutes du système à éditer:', system.rawData);
    // Mapper les données du système au format attendu par le formulaire
    setSelectedSystem({
      id: system.id,
      brand: system.Marque,
      model: system.Modele,
      ipAddress: system.AdresseIP,
      port: system.Port,
      door: system.door,
      building: system.building,
      company: system.company,
      // Ajouter les IDs pour les champs de sélection
      doorId: system.rawData.porte?.id?.toString() || "",
      buildingId: system.buildingId || system.rawData.batimentId?.toString() || ""
    })
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedSystem(undefined)
    setIsFormOpen(true)
  }

  const handleSave = async (formData: any) => {
    try {
      // Vérifier si les champs obligatoires sont remplis
      if (!formData.brand || !formData.model || !formData.doorId) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires (marque, modèle et porte).",
          variant: "destructive",
        });
        return;
      }
      
      // Vérifier si le buildingId est fourni
      if (!formData.buildingId) {
        toast({
          title: "Erreur",
          description: "Aucun bâtiment associé à la porte sélectionnée. Veuillez sélectionner une porte valide.",
          variant: "destructive",
        });
        return;
      }
      
      // Préparer les données pour l'API
      const systemData: CreateAccessSystemDTO = {
        Marque: formData.brand,
        Modele: formData.model,
        porteId: parseInt(formData.doorId),
        batimentId: parseInt(formData.buildingId)
      };
      
      if (selectedSystem?.id) {
        // Mise à jour d'un système existant
        await accessSystemService.update(parseInt(selectedSystem.id.toString()), systemData);
        toast({
          title: "Succès",
          description: "Système d'accès mis à jour avec succès",
        });
      } else {
        // Création d'un nouveau système
        try {
          await accessSystemService.create(systemData);
          toast({
            title: "Succès",
            description: "Système d'accès créé avec succès",
          });
        } catch (error: any) {
          toast({
            title: "Erreur",
            description: `Impossible de créer le système d'accès: ${error.message || 'Erreur inconnue'}`,
            variant: "destructive",
          });
          return; // Sortir de la fonction pour éviter de recharger les données
        }
      }
      // Recharger les données après sauvegarde
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du système d'accès:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le système d'accès",
        variant: "destructive",
      });
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedSystem(undefined)
  }

  const handleDelete = (system: FormattedAccessSystem) => {
    setSystemToDelete(system)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!systemToDelete) return
    
    try {
      await accessSystemService.delete(parseInt(systemToDelete.id))
      toast({
        title: "Succès",
        description: "Le système d'accès a été supprimé avec succès",
      })
      // Recharger les données après suppression
      await loadData()
    } catch (error) {
      console.error("Erreur lors de la suppression du système d'accès:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le système d'accès",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSystemToDelete(null)
    }
  }

  // La fonction handleBuildingFilterChange a été supprimée car elle est maintenant gérée directement dans le onValueChange du Select
  // et dans le useEffect qui surveille les changements de buildingFilter
  
  // Gérer le changement de page
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadData();
  };
  
  // Gérer le changement de limite d'éléments par page
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Réinitialiser à la page 1 quand on change la limite
    loadData();
  };

  const handleCheckStatus = async () => {
    setIsRefreshing(true);
    try {
      // Rafraîchir les statuts des systèmes d'accès
      await Promise.all(
        accessSystems.map(async (system) => {
          if (system.id) {
            try {
              const status = await accessSystemService.getStatus(system.id)
              // Mettre à jour le système dans la liste
              setAccessSystems(prev => 
                prev.map(s => s.id === system.id ? { ...s, ...status } : s)
              )
            } catch (error) {
              console.error(`Erreur lors de la vérification du statut du système ${system.id}:`, error)
            }
          }
        })
      )
      
      // Recharger les données complètes après la mise à jour des statuts
      await loadData()
      
      toast({
        title: "Succès",
        description: "Les statuts des systèmes d'accès ont été mis à jour",
      })
    } catch (error) {
      console.error("Erreur lors de la vérification des statuts:", error)
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les statuts des systèmes d'accès",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Récupérer les statistiques des systèmes d'accès
  const fetchStats = async () => {
    try {
      const data = await accessSystemService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Récupérer les statistiques
      await fetchStats();
      
      // Paramètres de pagination
      const params = { page, limit };
      
      // Charger les systèmes d'accès en fonction des filtres et termes de recherche
      let response;
      
      // Priorité à la recherche par terme si disponible
      if (searchTerm && searchTerm.trim() !== '') {
        console.log('Recherche par terme avec pagination:', searchTerm);
        response = await accessSystemService.searchByMarque(searchTerm.trim(), params);
      }
      // Filtrage par bâtiment si sélectionné
      else if (buildingFilter && buildingFilter !== 'all' && buildingFilter !== '0') {
        console.log('Filtrage par bâtiment avec pagination:', buildingFilter);
        console.log('Valeur actuelle de buildingFilter:', buildingFilter);
        console.log('Paramètres de pagination:', params);
        try {
          // Conversion explicite en nombre pour éviter les problèmes de type
          const batimentId = parseInt(buildingFilter);
          if (!isNaN(batimentId) && batimentId > 0) {
            response = await accessSystemService.getByBatimentId(batimentId, params);
            console.log('Réponse du filtrage par bâtiment:', response);
          } else {
            console.log('Valeur de buildingFilter invalide, chargement de tous les systèmes');
            response = await accessSystemService.getPaginated(params);
          }
        } catch (error) {
          console.error('Erreur lors du filtrage par bâtiment:', error);
          throw error;
        }
      }
      // Sinon, charger tous les systèmes avec pagination
      else {
        console.log('Chargement de tous les systèmes avec pagination');
        response = await accessSystemService.getPaginated(params);
      }
      
      // Vérifier si la réponse est paginée
      let systemsData: AccessSystem[] = [];
      if (response && typeof response === 'object' && 'data' in response) {
        const paginatedResponse = response as PaginatedResponse<AccessSystem>;
        systemsData = paginatedResponse.data;
        setTotal(paginatedResponse.total);
        setTotalPages(Math.ceil(paginatedResponse.total / limit));
      } else {
        // Fallback pour les cas où l'API ne retourne pas une réponse paginée
        systemsData = response as AccessSystem[];
        setTotal(systemsData.length);
        setTotalPages(Math.ceil(systemsData.length / limit));
      }
      
      setAccessSystems(systemsData);
      
      // Charger les bâtiments
      const buildingsData = await batimentService.getAll();
      setBuildings(buildingsData);
      
      // Charger les portes
      const doorsData = await porteService.getAll();
      setDoors(doorsData);
      
      // Récupérer les informations de statut pour chaque système
      const systemsWithStatus = await Promise.all(
        systemsData.map(async (system: AccessSystem) => {
          if (system.id) {
            try {
              const statusData = await accessSystemService.getStatus(system.id);
              return { ...system, ...statusData };
            } catch (error) {
              return system; // Retourner le système sans les informations de statut en cas d'erreur
            }
          }
          return system;
        })
      );
      
      // Mettre à jour la liste des systèmes avec les informations de statut
      setAccessSystems(systemsWithStatus);
      
      // Formater les données pour l'affichage
      const formatted = systemsWithStatus.map((system) => {
        // Récupérer le bâtiment associé à la porte
        const building = system.batiment?.name || system.porte?.departement?.batiment?.name || "Non assigné";
        const buildingId = system.batimentId?.toString() || system.porte?.departement?.batiment?.id?.toString() || "";
        const company = system.batiment?.societe || system.porte?.departement?.batiment?.societe || "";
        
        return {
          id: system.id?.toString() || "",
          Marque: system.Marque,
          Modele: system.Modele,
          AdresseIP: system.AdresseIP || "",
          Port: system.Port?.toString() || "",
          door: system.porte?.nom || "Non assignée",
          status: system.status ? "online" : "offline",
          lastSuccess: system.DateDernierSucces ? 
            format(system.DateDernierSucces instanceof Date ? system.DateDernierSucces : new Date(system.DateDernierSucces as any), "dd/MM/yyyy - HH:mm:ss", { locale: fr }) : 
            "Jamais",
          building: building,
          buildingId: buildingId,
          company: company,
          rawData: system // Conserver les données brutes pour l'édition
        };
      });
      
      setFormattedSystems(formatted);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Gestion des systèmes d'accès
          {selectedCompany && ` - ${selectedCompany}`}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCheckStatus}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Vérifier statut
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zone de recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="md:w-1/2">
              <BuildingFilter 
                value={buildingFilter} 
                onChange={(value) => {
                  console.log('Nouveau filtre de bâtiment sélectionné:', value);
                  // Convertir en string pour la cohérence avec le reste du code
                  setBuildingFilter(value === 0 ? 'all' : value.toString());
                  // Réinitialiser la pagination lors du changement de filtre
                  setPage(1);
                  // Le useEffect se chargera de déclencher loadData() automatiquement
                }}
                showAllOption={true}
                allOptionLabel="Tous les bâtiments"
                className="w-full"
              />
            </div>
            <div className="md:w-1/2">
              <label htmlFor="search" className="text-sm font-medium block mb-2">
                Recherche
              </label>
              <Input
                id="search"
                placeholder="Rechercher un système d'accès..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full">
              <Fingerprint className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total systèmes</p>
              <p className="text-2xl font-bold dark:text-white">{isLoading ? '...' : stats.totalSystems}</p>
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-full">
              <Wifi className="h-6 w-6 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En ligne</p>
              <p className="text-2xl font-bold dark:text-white">{ stats.onlineSystems}</p>
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-full">
              <Wifi className="h-6 w-6 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hors ligne</p>
              <p className="text-2xl font-bold dark:text-white">{ stats.offlineSystems}</p>
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-full">
              <Building className="h-6 w-6 text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bâtiments</p>
              <p className="text-2xl font-bold dark:text-white">{ stats.totalBatiments}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marque</TableHead>
                <TableHead>Modèle</TableHead>
                <TableHead>Adresse IP</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Porte</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date du dernier succès</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formattedSystems.map((system) => (
                <TableRow key={system.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-4 w-4 text-muted-foreground" />
                      {system.Marque}
                    </div>
                  </TableCell>
                  <TableCell>{system.Modele}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      {system.AdresseIP || "Non défini"}
                    </div>
                  </TableCell>
                  <TableCell>{system.Port || "Non défini"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DoorOpen className="h-4 w-4 text-muted-foreground" />
                      {system.door}
                    </div>
                  </TableCell>
                  <TableCell>
                    {system.status === "online" ? (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">En ligne</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">Hors ligne</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{system.lastSuccess}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(system)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(system)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Contrôles de pagination */}
          <div className="flex items-center justify-end p-4">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1}
                onClick={() => handlePageChange(Math.max(1, page - 1))}
              >
                Précédent
              </Button>
              
              {/* Affichage dynamique des numéros de page */}
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                // Logique pour afficher les pages pertinentes autour de la page actuelle
                let pageNum = page;
                if (totalPages <= 3) {
                  // Si moins de 3 pages, afficher simplement 1, 2, 3
                  pageNum = i + 1;
                } else if (page === 1) {
                  // Si on est à la première page, afficher 1, 2, 3
                  pageNum = i + 1;
                } else if (page === totalPages) {
                  // Si on est à la dernière page, afficher totalPages-2, totalPages-1, totalPages
                  pageNum = totalPages - 2 + i;
                } else {
                  // Sinon, afficher page-1, page, page+1
                  pageNum = page - 1 + i;
                }
                
                return (
                  <Button 
                    key={pageNum} 
                    variant={pageNum === page ? "default" : "outline"} 
                    size="sm" 
                    className="px-3"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= totalPages}
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              >
                Suivant
              </Button>
              
              <Select 
                value={limit.toString()} 
                onValueChange={(value) => handleLimitChange(Number(value))}
              >
                <SelectTrigger className="w-16">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire pour ajouter/modifier un système d'accès */}
      <AccessSystemForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        accessSystem={selectedSystem}
        buildings={buildings}
        doors={doors}
      />

      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-600 text-xl font-semibold">Êtes-vous sûr de vouloir supprimer ce système d'accès ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Cette action est irréversible. Le système d'accès sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 border-t border-gray-100">
            <AlertDialogCancel className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-blue-600 hover:bg-blue-700 text-white">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Composant de page qui fournit le contexte

export default function AccessSystemsPage() {
  return (
    <CompanyProvider>
      <AccessSystemsContent />
    </CompanyProvider>
  )
}