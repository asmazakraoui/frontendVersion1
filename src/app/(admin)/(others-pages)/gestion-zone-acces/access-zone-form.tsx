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
import { Checkbox } from "@/components/ui/checkbox"
import zoneAccessService, { ZoneAccessDTO } from "@/services/zoneAccessService"
import batimentService from "@/services/batimentService"
import porteService from "@/services/porteService"
import departementService from "@/services/departementService"


interface AccessZoneFormProps {
  isOpen: boolean
  onClose: () => void
  accessZone?: {
    id: string
    name: string
    building: string
    doors: string[]
    rawData?: any // Données brutes de la zone d'accès
  }
  onSave?: () => void
}

export function AccessZoneForm({ isOpen, onClose, accessZone, onSave }: AccessZoneFormProps) {
  console.log("AccessZone reçu dans le formulaire:", accessZone)
  
  const [formData, setFormData] = useState({
    name: accessZone?.name || "",
    doors: accessZone?.doors || [],
    selectedDoorIds: [] as number[]
  })
  

  
  console.log("FormData initial:", formData)
  const [buildings, setBuildings] = useState<any[]>([])
  const [doors, setDoors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mettre à jour le formulaire quand accessZone change
  useEffect(() => {
    if (accessZone) {
      console.log("AccessZone a changé:", accessZone)
      // Ne pas définir building ici, il sera déterminé à partir des portes
      setFormData(prev => ({
        ...prev,
        name: accessZone.name || "",
        doors: accessZone.doors || [],
      }))
    }
  }, [accessZone])
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        console.log("Début du chargement des données")
        // Charger les bâtiments avec leurs départements
        const buildingsData = await batimentService.getAll()
        console.log("Bâtiments chargés:", buildingsData)
        setBuildings(buildingsData)

        // Charger les portes avec leurs départements
        const doorsData = await porteService.getAll()
        console.log("Portes chargées:", doorsData)
        setDoors(doorsData)

        // Si on modifie une zone existante, charger ses portes
        if (accessZone?.id) {
          console.log("Chargement des données de la zone", accessZone.id)
          try {
            const zoneData = await zoneAccessService.getById(parseInt(accessZone.id))
            console.log("Données de la zone reçues:", zoneData)
            if (zoneData.portes && zoneData.portes.length > 0) {
              const doorIds = zoneData.portes.map((porte: { id: number }) => porte.id)
              console.log("IDs des portes:", doorIds)
              
              
              setFormData(prev => {
                const newData = {
                  ...prev,
                  name: zoneData.nom || accessZone.name || "",
                  selectedDoorIds: doorIds
                }
                console.log("Nouveau formData:", newData)
                return newData
              })
            }
          } catch (error) {
            console.error("Erreur lors du chargement de la zone:", error)
          }
        }

        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError("Impossible de charger les données nécessaires.")
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen, accessZone])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDoorToggle = (doorId: number) => {
    setFormData((prev) => {
      const selectedDoorIds = [...prev.selectedDoorIds]
      if (selectedDoorIds.includes(doorId)) {
        return { ...prev, selectedDoorIds: selectedDoorIds.filter((id) => id !== doorId) }
      } else {
        return { ...prev, selectedDoorIds: [...selectedDoorIds, doorId] }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const zoneData: ZoneAccessDTO = {
        nom: formData.name,
        porteIds: formData.selectedDoorIds
      }

      if (accessZone?.id) {
        // Mise à jour d'une zone existante
        await zoneAccessService.update(parseInt(accessZone.id), zoneData)
      } else {
        // Création d'une nouvelle zone
        await zoneAccessService.create(zoneData)
      }

      if (onSave) {
        onSave()
      }
      
      onClose()
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de la zone d'accès:", err)
      setError("Impossible d'enregistrer la zone d'accès.")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDoors = doors

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-blue-50">
        <DialogHeader className="bg-blue-100 p-4 rounded-t-lg border-b border-blue-100">
          <DialogTitle className="text-blue-800">{accessZone ? "Modifier la zone d'accès" : "Ajouter une zone d'accès"}</DialogTitle>
          <DialogDescription className="text-sm text-blue-600">
            {accessZone
              ? "Modifiez les détails de la zone d'accès ci-dessous."
              : "Remplissez les informations pour ajouter une nouvelle zone d'accès."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-black font-medium">
                Nom
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3 text-black border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                required
              />
            </div>


            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">Portes</Label>
              <div className="col-span-3 space-y-2">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement des portes...</p>
                ) : filteredDoors.length > 0 ? (
                  filteredDoors.map((door) => (
                    <div key={door.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`door-${door.id}`}
                        checked={formData.selectedDoorIds.includes(door.id)}
                        onCheckedChange={() => handleDoorToggle(door.id)}
                      />
                      <Label htmlFor={`door-${door.id}`} className="font-normal">
                        {door.nom}
                        {door.departement && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {door.departement.nom}
                            {door.departement.batiment && (
                              <span> - {door.departement.batiment.name || door.departement.batiment.nom}</span>
                            )}
                          </span>
                        )}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucune porte disponible.
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="bg-white">
            {error && <p className="text-sm text-red-500 mr-auto">{error}</p>}
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 text-white hover:bg-blue-700">
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}