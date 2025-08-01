"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompany } from "@/context/company-context"
import porteService, { PorteDTO } from "@/services/porteService"
import departementService, { Departement } from "@/services/departementService"
import batimentService, { Batiment } from "@/services/batimentService"

interface DoorFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  door?: {
    id?: number
    name: string
    department: string
    departmentId?: number
    batimentId?: number
    company?: string
  }
  buildings: any[]
  departments: any[]
}

export function DoorForm({ isOpen, onClose, onSave, door, buildings, departments }: DoorFormProps) {
  //const { selectedCompany } = useCompany()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [realDepartments, setRealDepartments] = useState<Departement[]>([])
  const [realBuildings, setRealBuildings] = useState<Batiment[]>([])
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false)
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false)
  
  const [formData, setFormData] = useState({
    name: door?.name || "",
    department: door?.department || "",
    departmentId: door?.departmentId || 0,
    batimentId: door?.batimentId || 0,
   // company: door?.company || selectedCompany || "",
  })
  
  // Charger les bâtiments depuis l'API
  const loadBuildings = async () => {
    setIsLoadingBuildings(true)
    try {
      const data = await batimentService.getAll()
      setRealBuildings(data)
    } catch (error) {
      console.error('Erreur lors du chargement des bâtiments:', error)
      setRealBuildings([])
    } finally {
      setIsLoadingBuildings(false)
    }
  }

  // Charger les départements depuis l'API
  const loadDepartments = async () => {
    setIsLoadingDepartments(true)
    try {
      const data = await departementService.getAll()
      setRealDepartments(data)
    } catch (error) {
      console.error('Erreur lors du chargement des départements:', error)
      setRealDepartments([])
    } finally {
      setIsLoadingDepartments(false)
    }
  }

  useEffect(() => {
    loadDepartments()
    loadBuildings()
  }, [])

  // Mettre à jour le formulaire lorsque la porte sélectionnée change
  useEffect(() => {
    console.log('useEffect - door changé:', door)
    if (door) {
      // S'assurer que toutes les données sont correctement remplies
      setFormData({
        name: door.name || "",
        department: door.department || "",
        departmentId: door.departmentId || 0,
        batimentId: door.batimentId || 0,
       // company: door.company || selectedCompany || "",
      })
      console.log('FormData mis à jour avec:', {
        name: door.name || "",
        department: door.department || "",
        departmentId: door.departmentId || 0,
        batimentId: door.batimentId || 0
      })
    } else {
      setFormData({
        name: "",
        department: "",
        departmentId: 0,
        batimentId: 0,
      })
    }
  }, [door])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "department") {
      // Trouver le département sélectionné
      const selectedDept = realDepartments.find(dept => dept.nom === value)
      
      // Récupérer le batimentId du département sélectionné
      const batimentId = selectedDept?.batiment?.id || 0
      
      console.log("Département sélectionné:", selectedDept)
      console.log("BatimentId récupéré:", batimentId)
      
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        departmentId: selectedDept?.id || 0,
        batimentId: batimentId
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const porteData: PorteDTO = {
        nom: formData.name,
        departementId: formData.departmentId,
        batimentId: formData.batimentId,
        zonesAccess: [] // Vous pourriez ajouter la sélection des zones d'accès plus tard
      }
      
      console.log("Données envoyées au serveur:", porteData)
      
      if (door?.id) {
        // Mise à jour d'une porte existante
        await porteService.update(door.id, porteData)
      } else {
        // Création d'une nouvelle porte
        await porteService.create(porteData)
      }
      
      onSave() 
      onClose() 
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la porte:', error)
      // Vous pourriez ajouter une notification d'erreur ici
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-blue-50">
        <DialogHeader className="bg-blue-100 p-5 rounded-t-lg border-b border-blue-100">
          <DialogTitle className="text-blue-800">{door ? "Modifier la porte" : "Ajouter une porte"}</DialogTitle>
          <DialogDescription className="text-sm text-blue-600">
            {door
              ? "Modifiez les détails de la porte ci-dessous."
              : "Remplissez les informations pour ajouter une nouvelle porte."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-black font-medium">
                  Nom
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-black font-medium">
                  Département
                </Label>
                <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                  <SelectTrigger id="department" className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black">
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDepartments ? (
                      <SelectItem value="loading" disabled>Chargement...</SelectItem>
                    ) : realDepartments.length === 0 ? (
                      <SelectItem value="none" disabled>Aucun département disponible</SelectItem>
                    ) : (
                      realDepartments.map((department) => (
                        <SelectItem key={`dept-${department.id}`} value={department.nom}>
                          {department.nom}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:max-w-md bg-blue-50">
            <div className="flex justify-end space-x-4 w-full">
              <Button type="button" variant="outline" onClick={onClose} className="bg-transparent hover:bg-gray-50 border-gray-200 text-black" disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" className="bg-transparent hover:bg-gray-50 border-gray-200 text-black" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

