"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import departementService, { Departement, PaginatedResponse } from "@/services/departementService"

interface DepartmentFilterProps {
  label?: string
  value: number | string
  onChange: (value: number) => void
  buildingId?: number
  className?: string
  showAllOption?: boolean
  allOptionLabel?: string
  disabled?: boolean
}

export function DepartmentFilter({
  label = "Département",
  value,
  onChange,
  buildingId = 0,
  className = "",
  showAllOption = true,
  allOptionLabel = "Tous les départements",
  disabled = false
}: DepartmentFilterProps) {
  const [departments, setDepartments] = useState<Departement[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Charger les départements au chargement du composant ou quand le bâtiment change
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true)
      try {
        let departmentsData;
        
        // Si un bâtiment est sélectionné, utiliser la méthode de filtrage par bâtiment
        if (buildingId > 0) {
          departmentsData = await departementService.getByBatiment(buildingId)
        } else {
          // Sinon, charger tous les départements
          departmentsData = await departementService.getAll()
        }
        
        // Extraire les départements, qu'il s'agisse d'une réponse paginée ou d'un tableau
        const departmentsList = 'data' in departmentsData ? departmentsData.data : departmentsData
        setDepartments(departmentsList)
        
        // Si le département sélectionné n'est pas dans la liste, réinitialiser la sélection
        if (value && departmentsList.length > 0 && !departmentsList.some(dept => dept.id === parseInt(value.toString()))) {
          onChange(0)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des départements:", error)
        setDepartments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartments()
  }, [buildingId])

  const handleChange = (newValue: string) => {
    onChange(parseInt(newValue))
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {label && (
        <Label htmlFor="department-filter" className="whitespace-nowrap">
          {label}
        </Label>
      )}
      <Select
        value={value.toString()}
        onValueChange={handleChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="department-filter" className="w-full">
          <SelectValue placeholder={allOptionLabel} />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && <SelectItem value="0">
            {allOptionLabel}
          </SelectItem>}
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Chargement...
            </SelectItem>
          ) : departments.length > 0 ? (
            departments.map((department) => (
              <SelectItem key={`dept-${department.id}-${department.nom}`} value={(department.id ?? 0).toString()}>
                {department.nom}
                {department.batiment && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({department.batiment.nom || department.batiment.name})
                  </span>
                )}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              {buildingId > 0 
                ? "Aucun département disponible pour ce bâtiment" 
                : "Aucun département disponible"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
