"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, DoorOpen, FolderOpen } from "lucide-react"
import { DoorForm } from "./door-form"
import { useCompany, CompanyProvider } from "@/context/company-context"
import porteService, { Porte, PaginationParams, PaginatedResponse } from "@/services/porteService"
import departementService from "@/services/departementService"
import batimentService from "@/services/batimentService"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

function DoorsContent() {
  const { selectedCompany } = useCompany()
  const [searchTerm, setSearchTerm] = useState("")
  const [buildingFilter, setBuildingFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDoor, setSelectedDoor] = useState<any | undefined>(undefined)
  const [doors, setDoors] = useState<any[]>([])
  const [buildings, setBuildings] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // États pour la pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // États pour la boîte de dialogue de confirmation de suppression
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [doorToDelete, setDoorToDelete] = useState<any | null>(null)

  // Charger les données initiales
  const loadData = async () => {
    setIsLoading(true)
    try {
      const params: PaginationParams = { page, limit }
      const [doorsResponse, buildingsData, departmentsData] = await Promise.all([
        porteService.getPaginated(params),
        batimentService.getAll(),
        departementService.getAll()
      ])
      setDoors(doorsResponse.data)
      setTotal(doorsResponse.total)
      setTotalPages(Math.ceil(doorsResponse.total / limit))
      setBuildings(buildingsData)
      setDepartments(departmentsData)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, limit])

  // Filtrage unifié
  useEffect(() => {
    const fetchFilteredDoors = async () => {
      setIsLoading(true)
      try {
        const params: PaginationParams = { page, limit }
        let response: PaginatedResponse<Porte> | Porte[] = { data: [], total: 0 }
        
        const getBuildingId = () => buildings.find(b => b.name === buildingFilter)?.id
        const getDepartmentId = () => departments.find(d => d.nom === departmentFilter)?.id
        
        const buildingId = getBuildingId()
        const departmentId = getDepartmentId()
        const hasBuilding = buildingFilter && buildingFilter !== "all"
        const hasDepartment = departmentFilter && departmentFilter !== "all"
        const hasSearch = searchTerm.trim() !== ''

        // Réinitialiser la page à 1 si les filtres changent
        if ((hasBuilding || hasDepartment || hasSearch) && page !== 1) {
          setPage(1)
          return
        }

        if (hasBuilding && hasDepartment && buildingId && departmentId) {
          // Pour le cas combiné, on doit faire un filtrage côté client après avoir récupéré les portes par bâtiment
          const batimentResponse = await porteService.getByBatiment(buildingId, params)
          // Vérifier si la réponse est déjà paginée
          if (batimentResponse && typeof batimentResponse === 'object' && 'data' in batimentResponse) {
            const filteredData = batimentResponse.data.filter(door => door.departement?.id === departmentId)
            response = { data: filteredData, total: filteredData.length }
          } else {
            // Si c'est un tableau simple, le convertir en format paginé
            const filteredData = (batimentResponse as Porte[]).filter(door => door.departement?.id === departmentId)
            response = { data: filteredData, total: filteredData.length }
          }
        } else if (hasDepartment && departmentId) {
          const result = await porteService.getByDepartement(departmentId, params)
          // Vérifier si la réponse est déjà paginée
          response = result && typeof result === 'object' && 'data' in result 
            ? result 
            : { data: result as Porte[], total: (result as Porte[]).length }
        } else if (hasBuilding && buildingId) {
          const result = await porteService.getByBatiment(buildingId, params)
          // Vérifier si la réponse est déjà paginée
          response = result && typeof result === 'object' && 'data' in result 
            ? result 
            : { data: result as Porte[], total: (result as Porte[]).length }
        } else if (hasSearch) {
          const result = await porteService.search(searchTerm, params)
          // Vérifier si la réponse est déjà paginée
          response = result && typeof result === 'object' && 'data' in result 
            ? result 
            : { data: result as Porte[], total: (result as Porte[]).length }
        } else {
          response = await porteService.getPaginated(params)
        }
        
        if (response && typeof response === 'object' && 'data' in response) {
          // Réponse paginée
          setDoors(response.data)
          setTotal(response.total)
          setTotalPages(Math.ceil(response.total / limit))
        } else {
          // Fallback pour les cas où l'API ne retourne pas une réponse paginée
          const doors = response as Porte[]
          setDoors(doors)
          setTotal(doors.length)
          setTotalPages(Math.ceil(doors.length / limit))
        }
      } catch (error) {
        console.error('Erreur filtrage portes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const delayDebounceFn = setTimeout(() => {
      fetchFilteredDoors()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [buildingFilter, departmentFilter, searchTerm, buildings, departments, page, limit])

  const handleEdit = (door: any) => {
    console.log('Porte à modifier:', door)
    setSelectedDoor({
      id: typeof door.id === 'string' ? parseInt(door.id, 10) : door.id,
      name: door.nom,
      department: door.departement?.nom || '',
      departmentId: door.departement?.id || 0,
      batimentId: door.batiment?.id || 0
    })
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedDoor(undefined)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedDoor(undefined)
  }
  
  const handleSave = () => {
    loadData()
  }
  
  const handleDeleteClick = (door: any) => {
    setDoorToDelete(door)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!doorToDelete?.id) return
    
    try {
      await porteService.delete(doorToDelete.id)
      loadData()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  // Statistiques calculées
  const stats = {
    total: doors.length,
    departments: new Set(doors.map(d => d.departement?.nom)).size
  }

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Gestion des portes
          {selectedCompany && ` - ${selectedCompany}`}
        </h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bâtiment</label>
              <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {buildings.map(building => (
                    <SelectItem key={building.id} value={building.name}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Département</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {departments.map(department => (
                    <SelectItem key={department.id} value={department.nom}>
                      {department.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Recherche</label>
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full">
              <DoorOpen className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total portes</p>
              <p className="text-2xl font-bold dark:text-white">{isLoading ? '...' : stats.total}</p>
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-full">
              <FolderOpen className="h-6 w-6 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Départements</p>
              <p className="text-2xl font-bold dark:text-white">{isLoading ? '...' : stats.departments}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">Chargement...</div>
          ) : doors.length === 0 ? (
            <div className="p-8 text-center">Aucune porte trouvée</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Porte</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doors.map(door => (
                    <TableRow key={door.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4 text-muted-foreground" />
                          {door.nom}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          {door.departement?.nom || 'Non assigné'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(door)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(door)}>
                            <Trash2 className="h-4 w-4" />
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
            </>
          )}
        </CardContent>
      </Card>

      <DoorForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        door={selectedDoor}
        buildings={buildings}
        departments={departments}
      />
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Êtes-vous sûr de vouloir supprimer cette porte ?"
        description="Cette action est irréversible. La porte sera définitivement supprimée."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  )
}

export default function DoorsPage() {
  return (
    <CompanyProvider>
      <DoorsContent />
    </CompanyProvider>
  )
}