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
import { Switch } from "@/components/ui/switch"
import typeCongeService, { TypeConge } from "@/services/typeCongeService"

interface LeaveTypeFormProps {
  isOpen: boolean
  onClose: () => void
  leaveType?: TypeConge
  company?: string
  onSubmit: (formData: any) => void
}

export function LeaveTypeForm({ isOpen, onClose, leaveType, company, onSubmit }: LeaveTypeFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    daysAllowed: "",
    unlimited: false,
    carryOver: false,
    company: company || "",
  })
  
  // Mettre à jour le formulaire lorsque leaveType change
  useEffect(() => {
    if (leaveType) {
      setFormData({
        name: leaveType.nom || "",
        daysAllowed: leaveType.joursAutorises === 'illimite' ? "" : leaveType.joursAutorises,
        unlimited: leaveType.joursAutorises === 'illimite',
        carryOver: leaveType.report || false,
        company: company || "",
      })
    } else {
      // Réinitialiser le formulaire
      setFormData({
        name: "",
        daysAllowed: "",
        unlimited: false,
        carryOver: false,
        company: company || "",
      })
    }
  }, [leaveType, company])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Convertir les données du formulaire au format attendu par l'API
    const typeCongeData = {
      nom: formData.name,
      joursAutorises: formData.unlimited ? 'illimite' : formData.daysAllowed,
      report: formData.carryOver
    }
    
    // Appeler la fonction onSubmit avec les données du formulaire
    onSubmit(typeCongeData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-blue-50">
        <DialogHeader className="bg-blue-100 p-4 rounded-t-lg">
          <DialogTitle className="text-blue-700">
            {leaveType ? "Modifier le type de congé" : "Ajouter un type de congé"}
          </DialogTitle>
          <DialogDescription className="text-blue-600">
            {leaveType
              ? "Modifiez les détails du type de congé ci-dessous."
              : "Remplissez les informations pour ajouter un nouveau type de congé."}
            {company && ` Pour la société: ${company}`}
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 py-4">
              <div className="flex items-center">
                <Label htmlFor="name" className="w-32 text-right pr-4 text-black font-medium">
                  Nom
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="flex-1 text-black border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                  required
                />
              </div>

              <div className="flex items-center">
                <Label htmlFor="unlimited" className="w-32 text-right pr-4 text-black font-medium">
                  Jours illimités
                </Label>
                <div className="flex-1 flex items-center">
                  <Switch
                    id="unlimited"
                    checked={formData.unlimited}
                    onCheckedChange={(checked) => handleSwitchChange("unlimited", checked)}
                    className="h-7 w-14 bg-gray-300 data-[state=checked]:bg-blue-600"
                  />
                  <span className="ml-3 text-sm font-medium">
                    {formData.unlimited ? "Activé" : "Désactivé"}
                  </span>
                </div>
              </div>
              
              {!formData.unlimited && (
                <div className="flex items-center">
                  <Label htmlFor="daysAllowed" className="w-32 text-right pr-4 text-black font-medium">
                    Jours autorisés
                  </Label>
                  <Input
                    id="daysAllowed"
                    name="daysAllowed"
                    type="number"
                    min="1"
                    value={formData.daysAllowed}
                    onChange={handleChange}
                    className="flex-1 text-black border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                    required={!formData.unlimited}
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <Label htmlFor="carryOver" className="w-32 text-right pr-4 text-black font-medium">
                  Report autorisé
                </Label>
                <div className="flex-1 flex items-center">
                  <Switch
                    id="carryOver"
                    checked={formData.carryOver}
                    onCheckedChange={(checked) => handleSwitchChange("carryOver", checked)}
                    className="h-7 w-14 bg-gray-300 data-[state=checked]:bg-blue-600"
                  />
                  <span className="ml-3 text-sm font-medium">
                    {formData.carryOver ? "Activé" : "Désactivé"}
                  </span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="bg-transparent text-black border border-gray-200 hover:bg-gray-100"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-transparent text-black border border-gray-200 hover:bg-gray-100"
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}