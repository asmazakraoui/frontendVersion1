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

import { Batiment } from "@/services/batimentService"
import { Departement } from "@/services/departementService"
import { BuildingFilter } from "@/components/filters/BuildingFilter"

interface DepartmentFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: any) => void
  department?: Departement
  buildings: Batiment[]
}

export function DepartmentForm({ isOpen, onClose, onSubmit, department, buildings }: DepartmentFormProps) {
  const { selectedCompany } = useCompany()

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    batimentId: 0,
  })
  
  useEffect(() => {
    if (department) {
      setFormData({
        nom: department.nom || "",
        description: department.description || "",
        batimentId: department.batiment?.id || department.batimentId || 0,
      })
    } else {
      setFormData({
        nom: "",
        description: "",
        batimentId: 0,
      })
    }
  }, [department])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-md bg-blue-50" aria-describedby="department-form-description">
        <DialogHeader className="bg-blue-100 p-5 rounded-t-lg border-b border-blue-100">
          <DialogTitle className="text-blue-800">{department ? "Modifier le département" : "Ajouter un département"}</DialogTitle>
          <p id="department-form-description" className="text-sm text-blue-600">
            {department
              ? "Modifiez les détails du département ci-dessous."
              : "Remplissez les informations pour ajouter un nouveau département."}
            {selectedCompany && ` Pour la société: ${selectedCompany}`}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-black font-medium">
                  Nom
                </Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-black font-medium">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batimentId" className="text-black font-medium">
                  Bâtiment
                </Label>
                <BuildingFilter
                  label=""
                  value={formData.batimentId}
                  onChange={(value) => handleSelectChange("batimentId", value)}
                  showAllOption={false}
                  className="w-full"
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
                {department ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}