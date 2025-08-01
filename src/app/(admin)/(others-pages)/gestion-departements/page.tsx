"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, Building, FolderOpen } from "lucide-react"
import { DepartmentForm } from "./department-form"
import { useCompany, CompanyProvider } from "@/context/company-context"
import batimentService, { Batiment } from "@/services/batimentService"
import departementService, { Departement, PaginationParams, PaginatedResponse } from "@/services/departementService"
import toast from "react-hot-toast"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

function DepartmentsContent() {
  // États
  const { selectedCompany } = useCompany()
  const [searchTerm, setSearchTerm] = useState("")
  const [buildingFilter, setBuildingFilter] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Departement | undefined>(undefined)
  const [departments, setDepartments] = useState<Departement[]>([])
  const [buildings, setBuildings] = useState<Batiment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalDepartements: 0, totalBatiments: 0 })
  
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // États pour la boîte de dialogue de confirmation de suppression
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<Departement | null>(null)
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchDepartements(),
        fetchBatiments(),
        fetchStats()
      ])
    }
    
    fetchData()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchDepartements(searchTerm)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])
  
  useEffect(() => {
    if (searchTerm) {
      searchDepartements(searchTerm)
    } else {
      fetchDepartements()
    }
  }, [page, limit])
  
  const fetchDepartements = async () => {
    try {
      setLoading(true)
      const params: PaginationParams = { page, limit }
      const response = await departementService.getPaginated(params)
      setDepartments(response.data)
      setTotal(response.total)
      setTotalPages(Math.ceil(response.total / limit))
    } catch (error) {
      toast.error("Impossible de charger les départements")
    } finally {
      setLoading(false)
    }
  }
  
  const fetchBatiments = async () => {
    try {
      const data = await batimentService.getAll()
      setBuildings(data)
    } catch (error) {
      toast.error("Impossible de charger les bâtiments")
    }
  }
  
  const fetchStats = async () => {
    try {
      const data = await departementService.getStats()
      setStats(data)
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error)
    }
  }

  const searchDepartements = async (term: string) => {
    if (!term.trim()) return fetchDepartements()
    
    try {
      setLoading(true)
      const currentPage = term !== searchTerm ? 1 : page
      if (term !== searchTerm) setPage(1)
      
      const params: PaginationParams = { page: currentPage, limit }
      const response = await departementService.search(term, params)
      setDepartments(response.data)
      setTotal(response.total)
      setTotalPages(Math.ceil(response.total / limit))
    } catch (error) {
      toast.error("Erreur lors de la recherche")
    } finally {
      setLoading(false)
    }
  }

  const filteredDepartments = departments.filter((department) => {
    return !buildingFilter || buildingFilter === 'all' || 
           (department.batiment && department.batiment.id === parseInt(buildingFilter))
  })

  const handleEdit = (department: Departement) => {
    setSelectedDepartment(department)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedDepartment(undefined)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedDepartment(undefined)
  }
  
  const handleDeleteClick = (department: Departement) => {
    setDepartmentToDelete(department)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete?.id) return
    
    try {
      await departementService.delete(departmentToDelete.id)
      toast.success("Département supprimé avec succès")
      await fetchDepartements()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error("Impossible de supprimer le département")
    }
  }
  
  const handleFormSubmit = async (formData: any) => {
    const departementData = {
      nom: formData.nom,
      description: formData.description,
      batimentId: parseInt(formData.batimentId)
    }
    
    try {
      if (selectedDepartment?.id) {
        await departementService.update(selectedDepartment.id, departementData)
        toast.success("Département mis à jour avec succès")
      } else {
        await departementService.create(departementData)
        toast.success("Département créé avec succès")
      }
      handleCloseForm()
      fetchDepartements()
    } catch (error) {
      toast.error("Impossible d'enregistrer le département")
    }
  }

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Gestion des départements
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
              <label htmlFor="building" className="text-sm font-medium">
                Bâtiment
              </label>
              <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                <SelectTrigger id="building">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id?.toString() || ""}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Recherche
              </label>
              <Input
                id="search"
                placeholder="Rechercher un département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 mx-auto max-w-4xl">
          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full">
              <FolderOpen className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total départements</p>
              <p className="text-2xl font-bold dark:text-white">{stats.totalDepartements}</p>
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-full">
              <Building className="h-6 w-6 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bâtiments</p>
              <p className="text-2xl font-bold dark:text-white">{stats.totalBatiments}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Bâtiment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      {department.nom}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {department.batiment?.name || "Non assigné"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(department)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
  variant="ghost" 
  size="icon" 
  onClick={() => handleDeleteClick(department)}
  className="text-red-500 hover:text-red-700 hover:bg-red-100"
>
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
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
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
                  setPage(1) // Réinitialiser à la page 1 quand on change la limite
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

      {/* Formulaire pour ajouter/modifier un département */}
      <DepartmentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        department={selectedDepartment}
        buildings={buildings}
      />
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Êtes-vous sûr de vouloir supprimer ce département ?"
        description="Cette action est irréversible. Le département sera définitivement supprimé."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  )
}

// Composant de page qui fournit le contexte
export default function DepartmentsPage() {
  return (
    <CompanyProvider>
      <DepartmentsContent />
    </CompanyProvider>
  )
}