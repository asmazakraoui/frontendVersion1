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
import { AccessSystem } from "@/services/access-systemService"

// Types pour les portes et bâtiments
type Door = {
  id: number
  nom: string
  departement?: {
    id: number
    name: string
    batiment?: {
      id: number
      name: string
    }
  }
  batiment?: {
    id: number
    name: string
    societe?: string
  }
}

type Building = {
  id: number
  name: string
  company: string
}

// Interface pour le formulaire
interface AccessSystemFormProps {
  isOpen: boolean
  onClose: () => void
  accessSystem?: {
    id: string
    brand: string
    model: string
    ipAddress: string
    port: string
    door: string
    building: string
    company?: string
    doorId?: string
    buildingId?: string
  }
  buildings: Building[]
  doors?: Door[]
  onSave: (formData: any) => void
}

export function AccessSystemForm({ isOpen, onClose, accessSystem, buildings, doors = [], onSave }: AccessSystemFormProps) {
  const { selectedCompany } = useCompany()

  const [formData, setFormData] = useState({
    brand: accessSystem?.brand || "",
    model: accessSystem?.model || "",
    door: accessSystem?.door || "",
    company: accessSystem?.company || selectedCompany || "",
    doorId: accessSystem?.doorId || ""
  })
  
  const selectedDoor = doors.find(door => door.id.toString() === formData.doorId)
  
  const buildingId = selectedDoor?.batiment?.id?.toString() || 
                    selectedDoor?.departement?.batiment?.id?.toString() || ""
  
  useEffect(() => {
    if (accessSystem) {
      setFormData({
        brand: accessSystem.brand || "",
        model: accessSystem.model || "",
        door: accessSystem.door || "",
        company: accessSystem.company || selectedCompany || "",
        doorId: accessSystem.doorId || ""
      });
    }
  }, [accessSystem, selectedCompany])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dataToSave = {
      ...formData,
      buildingId: buildingId 
    }
    onSave(dataToSave)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-blue-50">
        <DialogHeader className="bg-blue-100 p-5 rounded-t-lg border-b border-blue-100">
          <DialogTitle className="text-blue-800">{accessSystem ? "Modifier le système d'accès" : "Ajouter un système d'accès"}</DialogTitle>
          <DialogDescription className="text-sm text-blue-600">
            {accessSystem
              ? "Modifiez les détails du système d'accès ci-dessous."
              : "Remplissez les informations pour ajouter un nouveau système d'accès."}
            {selectedCompany && ` Pour la société: ${selectedCompany}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand" className="text-black font-medium">
                  Marque
                </Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-black font-medium">
                  Modèle
                </Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="door" className="text-black font-medium">
                  Porte
                </Label>
                <Select value={formData.doorId} onValueChange={(value) => handleSelectChange("doorId", value)}>
                  <SelectTrigger id="door" className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black">
                    <SelectValue placeholder="Sélectionner une porte" />
                  </SelectTrigger>
                  <SelectContent>
                    {doors.map((door) => (
                      <SelectItem key={door.id} value={door.id.toString()}>
                        {door.nom} {door.departement?.batiment?.name ? `(${door.departement.batiment.name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="building" className="text-black font-medium">
                  Bâtiment associé
                </Label>
                <div className="border rounded p-2 bg-muted/20">
                  {selectedDoor ? (
                    <>
                      {selectedDoor.batiment?.name || selectedDoor.departement?.batiment?.name || "Aucun bâtiment associé"}
                      {(selectedDoor.batiment?.name || selectedDoor.departement?.batiment?.name) && (
                        <span className="text-sm text-muted-foreground ml-2">
                          (Déterminé automatiquement par la porte sélectionnée)
                        </span>
                      )}
                      {!selectedDoor.batiment?.name && !selectedDoor.departement?.batiment?.name && (
                        <span className="text-sm text-red-500 ml-2">
                          Attention: Cette porte n'a pas de bâtiment associé!
                        </span>
                      )}
                    </>
                  ) : (
                    "Sélectionnez d'abord une porte"
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:max-w-md bg-blue-50">
            <div className="flex justify-end space-x-4 w-full">
              <Button type="button" variant="outline" onClick={onClose} className="bg-transparent hover:bg-gray-50 border-gray-200 text-black">
                Annuler
              </Button>
              <Button type="submit" className="bg-transparent hover:bg-gray-50 border-gray-200 text-black">
                Enregistrer
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

