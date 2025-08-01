"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { LeaveTypeForm } from "./leave-type-form"
import { useCompany, CompanyProvider } from "@/context/company-context"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import typeCongeService, { TypeConge } from "@/services/typeCongeService"
import authService from "@/services/authService"
import { toast } from "react-hot-toast"

// Composant interne qui utilise le hook
function LeaveTypesContent() {
  const { selectedCompany } = useCompany()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedLeaveType, setSelectedLeaveType] = useState<TypeConge | undefined>(undefined)
  const [leaveTypes, setLeaveTypes] = useState<TypeConge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [typeCongeToDelete, setTypeCongeToDelete] = useState<TypeConge | null>(null)
  
  // Charger les types de congés depuis l'API
  const fetchLeaveTypes = async () => {
    try {
      setIsLoading(true)
      const data = await typeCongeService.getAll()
      setLeaveTypes(data)
    } catch (error) {
      console.error('Erreur lors du chargement des types de congés:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les types de congés au chargement de la page
  useEffect(() => {
    fetchLeaveTypes()
  }, [])

  const handleAddLeaveType = () => {
    setSelectedLeaveType(undefined)
    setIsFormOpen(true)
  }

  const handleEditLeaveType = (leaveType: TypeConge) => {
    setSelectedLeaveType(leaveType)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedLeaveType(undefined)
  }
  
  // Ouvrir la boîte de dialogue de confirmation de suppression
  const handleDeleteConfirm = (typeConge: TypeConge) => {
    setTypeCongeToDelete(typeConge)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteLeaveType = async () => {
    if (typeCongeToDelete && typeCongeToDelete.id) {
      try {
        await typeCongeService.delete(typeCongeToDelete.id)
        fetchLeaveTypes()
        setIsDeleteDialogOpen(false)
      } catch (error) {
        console.error('Erreur lors de la suppression du type de congé:', error)
      }
    }
  }
  
  // Gérer la soumission du formulaire (création/modification)
  const handleFormSubmit = async (formData: any) => {
    try {
      // Récupérer l'ID de l'utilisateur connecté
      const userId = authService.getCurrentUserId();
      
      if (!userId) {
        toast.error("Vous devez être connecté pour effectuer cette action.");
        return;
      }
      
      const typeCongeData = {
        nom: formData.nom,
        joursAutorises: formData.joursAutorises,
        report: formData.report,
        userId: userId
      }
      
      if (selectedLeaveType?.id) {
        await typeCongeService.update(selectedLeaveType.id, typeCongeData)
        toast.success("Type de congé mis à jour avec succès")
      } else {
        await typeCongeService.create(typeCongeData)
        toast.success("Type de congé créé avec succès")
      }
      handleCloseForm()
      fetchLeaveTypes()
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error)
      alert("Une erreur est survenue. Veuillez réessayer.")
    }
  }

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Gestion des types de congés
          {selectedCompany && ` - ${selectedCompany}`}
        </h2>
        <Button onClick={handleAddLeaveType} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau      
            </Button>
      </div>





      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 dark:bg-muted/20">
                <TableHead className="w-[300px]">Nom</TableHead>
                <TableHead className="w-[200px]">Jours autorisés</TableHead>
                <TableHead className="w-[200px]">Report</TableHead>
                <TableHead className="w-[150px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 dark:text-gray-300">Chargement...</TableCell>
                </TableRow>
              ) : leaveTypes.length > 0 ? (
                leaveTypes.map((leaveType) => (
                  <TableRow key={leaveType.id} className="border-t dark:border-muted">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium dark:text-white">{leaveType.nom}</span>
                      </div>
                    </TableCell>
                    <TableCell className="dark:text-gray-300">{typeCongeService.formatJoursAutorises(leaveType.joursAutorises)}</TableCell>
                    <TableCell className="dark:text-gray-300">{leaveType.report ? "Oui" : "Non"}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => handleEditLeaveType(leaveType)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteConfirm(leaveType)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 dark:text-gray-300">Aucun type de congé trouvé</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Formulaire modal pour ajouter/modifier un type de congé */}
      <LeaveTypeForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        leaveType={selectedLeaveType}
        company={selectedCompany}
        onSubmit={handleFormSubmit}
      />
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-600 text-xl font-semibold">Êtes-vous sûr de vouloir supprimer ce type de congé ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Cette action est irréversible. Le type de congé sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 border-t border-gray-100">
            <AlertDialogCancel className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLeaveType} className="bg-blue-600 hover:bg-blue-700 text-white">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Composant de page qui fournit le contexte
export default function LeaveTypesPage() {
  return (
    <CompanyProvider>
      <LeaveTypesContent />
    </CompanyProvider>
  )
}