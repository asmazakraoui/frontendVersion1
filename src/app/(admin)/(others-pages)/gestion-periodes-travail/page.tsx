"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, Calendar, Clock, AlertCircle } from "lucide-react"
import { PeriodForm } from "./period-form"
import { useCompany, CompanyProvider } from "@/context/company-context"
import { periodesTravailService, PeriodeTravail } from "@/services/periodes-travailService"
import { toast } from "react-hot-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

// Composant qui utilise le hook
function PeriodsContent() {
  const { selectedCompany } = useCompany()
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodeTravail | undefined>(undefined)
  const [periods, setPeriods] = useState<PeriodeTravail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, matin: 0, soir: 0 })
  
  // États pour la boîte de dialogue de confirmation de suppression
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [periodToDelete, setPeriodToDelete] = useState<PeriodeTravail | null>(null)

  // Charger les périodes de travail depuis l'API
  const fetchPeriods = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await periodesTravailService.getAll()
      setPeriods(data)
      
      // Charger les statistiques des périodes de travail
      const statsData = await periodesTravailService.getStats()
      setStats(statsData)
    } catch (err) {
      console.error("Erreur lors du chargement des périodes de travail:", err)
      setError("Impossible de charger les périodes de travail. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  // Charger les périodes au chargement du composant
  useEffect(() => {
    fetchPeriods()
  }, [])

  // Filtrer les périodes en fonction des critères de recherche
  const filteredPeriods = periods.filter((period) => {
    return period.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleEdit = (period: PeriodeTravail) => {
    setSelectedPeriod(period)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedPeriod(undefined)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedPeriod(undefined)
  }

  const handleDeleteClick = (period: PeriodeTravail) => {
    setPeriodToDelete(period)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!periodToDelete?.id) return
    
    try {
      await periodesTravailService.delete(periodToDelete.id)
      toast.success("Période de travail supprimée avec succès")
      fetchPeriods() // Recharger les périodes après la suppression
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Erreur lors de la suppression de la période de travail:", error)
      toast.error("Erreur lors de la suppression de la période de travail")
    }
  }

  const handleSuccess = () => {
    fetchPeriods() // Recharger les périodes après ajout/modification
  }

  // Les statistiques sont maintenant chargées depuis le backend

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Gestion des périodes de travail
          {selectedCompany && ` - ${selectedCompany}`}
        </h2>
        <Button onClick={handleAdd} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                placeholder="Rechercher une période..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-4 mb-4">
          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total des périodes</p>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
              )}
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-full">
              <Clock className="h-6 w-6 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Périodes du matin</p>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold dark:text-white">{stats.matin}</p>
              )}
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
              <Clock className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Périodes du soir</p>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold dark:text-white">{stats.soir}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des périodes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Jours</TableHead>
                  <TableHead>Heure de début</TableHead>
                  <TableHead>Heure de fin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeriods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Aucune période trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPeriods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {period.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {period.employee ? `${period.employee.firstName} ${period.employee.lastName}` : 'Non assigné'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {period.monday && <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Lun</span>}
                          {period.tuesday && <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Mar</span>}
                          {period.wednesday && <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Mer</span>}
                          {period.thursday && <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Jeu</span>}
                          {period.friday && <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Ven</span>}
                          {period.saturday && <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Sam</span>}
                          {period.sunday && <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Dim</span>}
                          {!period.monday && !period.tuesday && !period.wednesday && !period.thursday && 
                           !period.friday && !period.saturday && !period.sunday && 
                           <span className="text-gray-400 text-xs">Non défini</span>}
                        </div>
                      </TableCell>
                      <TableCell>{period.startTime}</TableCell>
                      <TableCell>{period.endTime}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(period)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDeleteClick(period)}
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
          )}
        </CardContent>
      </Card>

      <PeriodForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        onSuccess={handleSuccess}
        period={selectedPeriod ? {
          id: selectedPeriod.id || 0,
          description: selectedPeriod.name || '',
          startDate: selectedPeriod.startTime || '',
          endDate: selectedPeriod.endTime || ''
        } : undefined}
      />
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Êtes-vous sûr de vouloir supprimer cette période de travail ?"
        description="Cette action est irréversible. La période de travail sera définitivement supprimée."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  )
}
// Composant de page qui fournit le contexte
export default function PeriodsPage() {
  return (
    <CompanyProvider>
      <PeriodsContent />
    </CompanyProvider>
  )
}