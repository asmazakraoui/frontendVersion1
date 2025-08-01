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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useCompany } from "@/context/company-context"
import { periodesTravailService } from "@/services/periodes-travailService"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import authService from "@/services/authService"
import employeeService, { Employee } from "@/services/employeeService"

interface PeriodFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  period?: {
    id: number
    description: string
    startDate: string
    endDate: string
  }
  employeeId?: number
}

export function PeriodForm({ isOpen, onClose, onSuccess, period, employeeId }: PeriodFormProps) {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  

  // État initial du formulaire
  const [formData, setFormData] = useState({
    name: "",
    startTime: "08:00",
    endTime: "17:00",
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
    employeeId: employeeId || authService.getCurrentUserId() || 0
  })

  // Charger les employés au chargement du composant
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Récupérer les employés depuis la base de données
        const data = await employeeService.getAll();
        setEmployees(data);
        
        // Si aucun employé n'est trouvé, afficher un message
        if (data.length === 0) {
          toast("Aucun employé trouvé dans la base de données");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des employés:", error);
        toast.error("Impossible de charger la liste des employés");
        
        // En cas d'erreur, utiliser des données fictives pour éviter de bloquer l'interface
        setEmployees([
          { id: 1, firstName: 'John', lastName: 'Doe' },
          { id: 2, firstName: 'Jane', lastName: 'Smith' }
        ]);
      }
    };

    // Charger les détails de la période si on est en mode édition
    const loadPeriodDetails = async () => {
      if (period?.id) {
        setLoading(true);
        try {
          const periodData = await periodesTravailService.getById(period.id);
          if (periodData) {
            setFormData({
              name: periodData.name,
              startTime: periodData.startTime,
              endTime: periodData.endTime,
              monday: periodData.monday ?? true,
              tuesday: periodData.tuesday ?? true,
              wednesday: periodData.wednesday ?? true,
              thursday: periodData.thursday ?? true,
              friday: periodData.friday ?? true,
              saturday: periodData.saturday ?? false,
              sunday: periodData.sunday ?? false,
              employeeId: periodData.employeeId
            });
          }
        } catch (error) {
          console.error("Erreur lors du chargement des détails de la période:", error);
          toast.error("Impossible de charger les détails de la période");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEmployees();
    loadPeriodDetails();
  }, [period, employeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleEmployeeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, employeeId: parseInt(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (period?.id) {
        // Mode édition
        await periodesTravailService.update(period.id, formData);
        toast.success("Période de travail mise à jour avec succès");
      } else {
        // Mode création
        await periodesTravailService.create(formData);
        toast.success("Période de travail créée avec succès");
      }
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la période de travail:", error);
      toast.error("Erreur lors de l'enregistrement de la période de travail");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal={true}>
      <DialogContent className="sm:max-w-[500px] bg-blue-50" aria-describedby="period-form-description">
        <DialogHeader className="bg-blue-100 p-5 rounded-t-lg border-b border-blue-100">
          <DialogTitle className="text-blue-800">
            {period ? "Modifier la période" : "Ajouter une période"}
          </DialogTitle>
          <p id="period-form-description" className="text-sm text-blue-600">
            {period
              ? "Modifiez les détails de la période de travail"
              : "Ajoutez une nouvelle période de travail"}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-black font-medium">
                Nom
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black w-full"
                placeholder="Ex: Horaires standard"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-black font-medium">
                Employé
              </Label>
              <Select 
                value={formData.employeeId.toString()} 
                onValueChange={handleEmployeeChange}
                disabled={loading || !!employeeId}
              >
                <SelectTrigger className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black w-full">
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-black font-medium">
                Heure de début
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black w-full"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-black font-medium">
                Heure de fin
              </Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black w-full"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-black font-medium">Jours de travail</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="monday" 
                    checked={formData.monday}
                    onCheckedChange={(checked) => handleCheckboxChange('monday', checked === true)}
                    disabled={loading}
                  />
                  <Label htmlFor="monday" className="text-black">Lundi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="tuesday" 
                    checked={formData.tuesday}
                    onCheckedChange={(checked) => handleCheckboxChange('tuesday', checked === true)}
                    disabled={loading}
                  />
                  <Label htmlFor="tuesday" className="text-black">Mardi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="wednesday" 
                    checked={formData.wednesday}
                    onCheckedChange={(checked) => handleCheckboxChange('wednesday', checked === true)}
                    disabled={loading}
                  />
                  <Label htmlFor="wednesday" className="text-black">Mercredi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="thursday" 
                    checked={formData.thursday}
                    onCheckedChange={(checked) => handleCheckboxChange('thursday', checked === true)}
                    disabled={loading}
                  />
                  <Label htmlFor="thursday" className="text-black">Jeudi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="friday" 
                    checked={formData.friday}
                    onCheckedChange={(checked) => handleCheckboxChange('friday', checked === true)}
                    disabled={loading}
                  />
                  <Label htmlFor="friday" className="text-black">Vendredi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="saturday" 
                    checked={formData.saturday}
                    onCheckedChange={(checked) => handleCheckboxChange('saturday', checked === true)}
                    disabled={loading}
                  />
                  <Label htmlFor="saturday" className="text-black">Samedi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sunday" 
                    checked={formData.sunday}
                    onCheckedChange={(checked) => handleCheckboxChange('sunday', checked === true)}
                    disabled={loading}
                  />
                  <Label htmlFor="sunday" className="text-black">Dimanche</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:max-w-[500px] bg-blue-50">
            <div className="flex justify-end space-x-4 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={loading}
                className="bg-transparent hover:bg-gray-50 border-gray-200 text-black"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-transparent hover:bg-gray-50 border-gray-200 text-black"
              >
                {loading ? "Chargement..." : "Enregistrer"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

