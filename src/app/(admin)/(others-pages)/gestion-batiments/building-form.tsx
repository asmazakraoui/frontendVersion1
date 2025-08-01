"use client"

import type React from "react"

import { useState } from "react"
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

interface BuildingFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: any) => void
  building?: {
    id?: number
    name: string
    adresse: string
    numTel: string
  }
}

export function BuildingForm({ isOpen, onClose, onSubmit, building }: BuildingFormProps) {
 
  const [formData, setFormData] = useState({
    name: building?.name || "",
    adresse: building?.adresse || "",
    numTel: building?.numTel || ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-md bg-blue-50" aria-describedby="building-form-description">
        <DialogHeader className="bg-blue-100 p-5 rounded-t-lg border-b border-blue-100">
          <DialogTitle className="text-blue-800 text-xl font-semibold">
            {building ? "Modifier le bâtiment" : "Ajouter un bâtiment"}
          </DialogTitle>
          <p id="building-form-description" className="text-sm text-blue-600 mt-2">
            {building
              ? "Modifiez les détails du bâtiment ci-dessous."
              : "Remplissez les informations pour ajouter un nouveau bâtiment."}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="space-y-5">
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
                <Label htmlFor="adresse" className="text-black font-medium">
                  Adresse
                </Label>
                <Input
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numTel" className="text-black font-medium">
                  Téléphone
                </Label>
                <Input
                  id="numTel"
                  name="numTel"
                  value={formData.numTel}
                  onChange={handleChange}
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter className="sm:max-w-md bg-blue-50">
            <div className="flex justify-end space-x-4 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="bg-transparent hover:bg-gray-50 border-gray-200 text-black"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-transparent hover:bg-gray-50 border-gray-200 text-black"
              >
                {building ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}