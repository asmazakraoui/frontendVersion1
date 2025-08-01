"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Plus, Clock, AlarmClock } from "lucide-react"
import { PositionForm } from "./position-form"
import { useCompany, CompanyProvider } from "@/context/company-context"
import posteService, { Poste, PosteStats, PaginatedResponse } from "@/services/posteService"
import authService from "@/services/authService"
import { useToast } from "@/components/ui/use-toast"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"



function PositionsContent() {
  const { selectedCompany } = useCompany()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Poste | undefined>(undefined)
  const [positions, setPositions] = useState<Poste[]>([])
  const [loading, setLoading] = useState(false)
  const [posteStats, setPosteStats] = useState<PosteStats>({ total: 0, matin: 0, apresMidi: 0 })
  
  // États pour la pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // États pour la boîte de dialogue de confirmation de suppression
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [posteToDelete, setPosteToDelete] = useState<Poste | null>(null)

  // Charger les postes depuis l'API avec pagination
  const fetchPositions = async () => {
    try {
      setLoading(true)
      
      // Paramètres de pagination
      const params = { page, limit }
      
      // Charger les postes avec pagination
      let response;
      if (searchTerm && searchTerm.trim() !== '') {
        response = await posteService.searchByDescriptionPaginated(searchTerm.trim(), params)
      } else {
        response = await posteService.getPaginated(params)
      }
      
      // Traiter la réponse paginée
      setPositions(response.data)
      setTotal(response.total)
      setTotalPages(Math.ceil(response.total / limit))
      
      // Charger les statistiques des postes
      const stats = await posteService.getStats()
      setPosteStats(stats)
    } catch (error) {
      console.error('Erreur lors du chargement des postes:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les postes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchPositions()
  }, [page, limit])


  // Les fonctions de gestion de pagination sont directement intégrées dans les contrôles UI
  

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPositions();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fonction de recherche manuelle (pour le bouton de recherche si nécessaire)
  const handleSearchClick = () => {
    setPage(1); // Réinitialiser à la première page lors d'une recherche manuelle
    fetchPositions();
  };
  

  const filteredPositions = positions


  const handleCreatePoste = async (posteData: any) => {
    try {
      await posteService.create(posteData)
      toast({
        title: "Succès",
        description: "Poste créé avec succès",
      })
      fetchPositions()
    } catch (error) {
      console.error('Erreur lors de la création du poste:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le poste",
        variant: "destructive",
      })
    }
  }

  // Gérer la mise à jour d'un poste existant
  const handleUpdatePoste = async (id: number, posteData: any) => {
    try {
      await posteService.update(id, posteData)
      toast({
        title: "Succès",
        description: "Poste mis à jour avec succès",
      })
      fetchPositions()
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du poste ${id}:`, error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le poste",
        variant: "destructive",
      })
    }
  }

  // Gérer la suppression d'un poste
  const handleDeleteClick = (poste: Poste) => {
    setPosteToDelete(poste)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!posteToDelete?.id) return
    
    try {
      await posteService.delete(posteToDelete.id)
      toast({
        title: "Succès",
        description: "Poste supprimé avec succès",
      })
      fetchPositions()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error(`Erreur lors de la suppression du poste ${posteToDelete.id}:`, error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le poste",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (position: Poste) => {
    setSelectedPosition(position)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedPosition(undefined)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedPosition(undefined)
  }
  
  const handleSubmit = (formData: any) => {
    // Récupérer l'ID de l'utilisateur connecté
    const userId = authService.getCurrentUserId();
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      })
      return;
    }
    

    formData.userId = userId;
    
    if (selectedPosition) {

      handleUpdatePoste(selectedPosition.id!, formData);
    } else {
      // Création d'un nouveau poste
      handleCreatePoste(formData);
    }
    
    // Fermer le formulaire
    handleCloseForm();
  }



  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Gestion des postes
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Recherche
              </label>
              <Input
                id="search"
                placeholder="Rechercher un poste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full">
              <Clock className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total des postes</p>
              <p className="text-2xl font-bold dark:text-white">{posteStats.total}</p>
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-full">
              <AlarmClock className="h-6 w-6 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Postes du matin</p>
              <p className="text-2xl font-bold dark:text-white">{posteStats.matin}</p>
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
              <AlarmClock className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Postes de l'après-midi</p>
              <p className="text-2xl font-bold dark:text-white">{posteStats.apresMidi}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Heure début</TableHead>
                <TableHead>Heure fin</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPositions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {position.description}
                    </div>
                  </TableCell>
                  <TableCell>{position.HeureDebut}</TableCell>
                  <TableCell>{position.HeureFin}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(position)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(position)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
        </CardContent>
      </Card>


      <PositionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        position={selectedPosition}
      />
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Êtes-vous sûr de vouloir supprimer ce poste ?"
        description="Cette action est irréversible. Le poste sera définitivement supprimé."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  )
}

// Composant de page qui fournit le contexte
export default function PositionsPage() {
  return (
    <CompanyProvider>
      <PositionsContent />
    </CompanyProvider>
  )
}