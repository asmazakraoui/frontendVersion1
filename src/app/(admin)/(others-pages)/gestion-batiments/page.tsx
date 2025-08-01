"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, Building, Phone, MapPin } from "lucide-react"
import { BuildingForm } from "./building-form"
import toast, { Toaster } from "react-hot-toast"
import { useCompany, CompanyProvider } from "@/context/company-context"
import batimentService, { Batiment } from "@/services/batimentService"
import authService from "@/services/authService"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

function BuildingsContent() {
  // États
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState<Batiment | undefined>(undefined)
  const [buildings, setBuildings] = useState<Batiment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalBatiments: 0, totalVilles: 0, totalContacts: 0 })
  
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // États pour la boîte de dialogue de confirmation de suppression
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [buildingToDelete, setBuildingToDelete] = useState<Batiment | null>(null)
  
  const { selectedCompany } = useCompany()

  useEffect(() => { fetchBuildings() }, [])
  
  useEffect(() => {
    if (searchTerm) {
      searchBuildings(searchTerm)
    } else {
      fetchBuildings()
    }
  }, [page, limit])
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1)
      searchBuildings(searchTerm)
    }, 300) 
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const fetchBuildings = async () => {
    try {
      setLoading(true)
      // Récupérer les bâtiments paginés et les statistiques en parallèle
      const [paginatedData, statsData] = await Promise.all([
        batimentService.getPaginated({ page, limit }),
        batimentService.getStats()
      ])
      
      setBuildings(paginatedData.data)
      setTotal(paginatedData.total)
      setTotalPages(paginatedData.totalPages)
      setStats(statsData)
    } catch (error) {
      toast.error("Impossible de charger les bâtiments")
    } finally {
      setLoading(false)
    }
  }

  const searchBuildings = async (term: string) => {
    if (!term.trim()) return fetchBuildings()
    
    try {
      setLoading(true)
      const result = await batimentService.search(term, { page, limit })
      
      if ('data' in result) {
        setBuildings(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
      } else {
        setBuildings(result)
        setTotal(result.length)
        setTotalPages(Math.ceil(result.length / limit))
      }
    } catch (error) {
      toast.error("Erreur lors de la recherche")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (building: Batiment) => {
    setSelectedBuilding(building)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedBuilding(undefined)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedBuilding(undefined)
  }

  const handleDeleteClick = (building: Batiment) => {
    setBuildingToDelete(building)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!buildingToDelete?.id) return
    
    try {
      await batimentService.delete(buildingToDelete.id)
      toast.success("Bâtiment supprimé avec succès")
      fetchBuildings()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error("Impossible de supprimer le bâtiment")
    }
  }

  const handleFormSubmit = async (formData: any) => {
    const userId = authService.getCurrentUserId();
    
    if (!userId) {
      toast.error("Vous devez être connecté pour effectuer cette action");
      return;
    }
    
    const buildingData = {
      name: formData.name,
      adresse: formData.adresse,
      numTel: formData.numTel,
      userId: userId
    };
    
    try {
      if (selectedBuilding?.id) {
        await batimentService.update(selectedBuilding.id, buildingData);
        toast.success("Bâtiment mis à jour avec succès");
      } else {
        await batimentService.create(buildingData);
        toast.success("Bâtiment créé avec succès");
      }
      handleCloseForm();
      fetchBuildings();
    } catch (error) {
      toast.error("Impossible d'enregistrer le bâtiment");
    }
  }

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Gestion des bâtiments
          {selectedCompany && ` - ${selectedCompany}`}
        </h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zone de recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2" style={{ width: "50%" }}>
            <label htmlFor="search" className="text-sm font-medium">
              Recherche
            </label>
            <Input
              id="search"
              placeholder="Rechercher un bâtiment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 px-6">
          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full">
              <Building className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total bâtiments</p>
              <p className="text-2xl font-bold dark:text-white">{stats.totalBatiments}</p>
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-full">
              <MapPin className="h-6 w-6 text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Villes</p>
              <p className="text-2xl font-bold dark:text-white">{stats.totalVilles}</p>
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
              <Phone className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contacts</p>
              <p className="text-2xl font-bold dark:text-white">{stats.totalContacts}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <p>Chargement des bâtiments...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Numéro de téléphone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Aucun bâtiment trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    buildings.map((building) => (
                      <TableRow key={building.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {building.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {building.adresse}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {building.numTel}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(building)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
  variant="ghost" 
  size="icon" 
  onClick={() => handleDeleteClick(building)}
  className="text-red-500 hover:text-red-700 hover:bg-red-100"
>
  <Trash2 className="h-4 w-4" />
</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-end p-4">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Précédent
                  </Button>
                  
                  {/* Affichage des numéros de page */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                      // Si moins de 3 pages, afficher toutes les pages
                      // Si plus de 3 pages, afficher la page actuelle et les pages adjacentes
                      let pageToShow = i + 1;
                      
                      if (totalPages > 3) {
                        if (page === 1) {
                          pageToShow = i + 1;
                        } else if (page === totalPages) {
                          pageToShow = totalPages - 2 + i;
                        } else {
                          pageToShow = page - 1 + i;
                        }
                      }
                      
                      return (
                        <Button 
                          key={pageToShow} 
                          variant={pageToShow === page ? "default" : "outline"}
                          size="sm" 
                          className="px-3"
                          onClick={() => setPage(pageToShow)}
                        >
                          {pageToShow}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Suivant
                  </Button>
                  
                  <Select 
                    value={limit.toString()} 
                    onValueChange={(value) => {
                      setLimit(Number(value))
                      setPage(1) // Réinitialiser à la première page lors du changement de limite
                    }}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Formulaire pour ajouter/modifier un bâtiment */}
      {isFormOpen && (
        <BuildingForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          building={selectedBuilding ? {
            id: selectedBuilding.id,
            name: selectedBuilding.name,
            adresse: selectedBuilding.adresse,
            numTel: selectedBuilding.numTel
          } : undefined}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Boîte de dialogue de confirmation de suppression */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Êtes-vous sûr de vouloir supprimer ce bâtiment ?"
        description="Cette action est irréversible. Le bâtiment sera définitivement supprimé."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  )
}

// Composant de page qui fournit le contexte
export default function BuildingsManagePage() {
  return (
    <CompanyProvider>
      <BuildingsContent />
      <Toaster position="top-right" />
    </CompanyProvider>
  )
}