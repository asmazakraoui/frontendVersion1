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
import { useCompany } from "@/context/company-context"
import { Poste } from "@/services/posteService"

interface PositionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: any) => void
  position?: Poste
}

export function PositionForm({ isOpen, onClose, onSubmit, position }: PositionFormProps) {
  const { selectedCompany } = useCompany()

  const [formData, setFormData] = useState({
    description: position?.description || "",
    HeureDebut: position?.HeureDebut || "",
    HeureFin: position?.HeureFin || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Appeler la fonction onSubmit passée en prop avec les données du formulaire
    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-md bg-blue-50">
        <DialogHeader className="bg-blue-100 p-4 rounded-t-lg">
          <DialogTitle className="text-blue-800">{position ? "Modifier le poste" : "Ajouter un poste"}</DialogTitle>
          <DialogDescription className="text-blue-600">
            {position
              ? "Modifiez les détails du poste ci-dessous."
              : "Remplissez les informations pour ajouter un nouveau poste."}
            {selectedCompany && ` Pour la société: ${selectedCompany}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-black font-medium">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3 text-black border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="HeureDebut" className="text-right text-black font-medium">
                Heure début
              </Label>
              <Input
                id="HeureDebut"
                name="HeureDebut"
                type="time"
                value={formData.HeureDebut}
                onChange={handleChange}
                className="col-span-3 text-black border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="HeureFin" className="text-right text-black font-medium">
                Heure fin
              </Label>
              <Input
                id="HeureFin"
                name="HeureFin"
                type="time"
                value={formData.HeureFin}
                onChange={handleChange}
                className="col-span-3 text-black border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

