"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import porteService, { Porte, PaginatedResponse } from "@/services/porteService"

interface DoorFilterProps {
  label?: string
  value: number | string
  onChange: (value: number) => void
  departementId?: number
  batimentId?: number
  className?: string
  showAllOption?: boolean
  allOptionLabel?: string
  disabled?: boolean
}

export function DoorFilter({
  label = "Porte",
  value,
  onChange,
  departementId = 0,
  batimentId = 0,
  className = "",
  showAllOption = true,
  allOptionLabel = "Toutes les portes",
  disabled = false
}: DoorFilterProps) {
  const [doors, setDoors] = useState<Porte[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Charger les portes au chargement du composant ou quand le département/bâtiment change
  useEffect(() => {
    const fetchDoors = async () => {
      setIsLoading(true)
      try {
        let doorsData: Porte[] = []
        
        // Récupération selon les filtres
        if (batimentId > 0 && departementId > 0) {
          const batimentDoorsResponse = await porteService.getByBatiment(batimentId)
          const batimentDoorsList = 'data' in batimentDoorsResponse ? batimentDoorsResponse.data : batimentDoorsResponse
          doorsData = batimentDoorsList.filter(door => door.departement?.id === departementId)
        } else if (departementId > 0) {
          const departementDoorsResponse = await porteService.getByDepartement(departementId)
          doorsData = 'data' in departementDoorsResponse ? departementDoorsResponse.data : departementDoorsResponse
        } else if (batimentId > 0) {
          const batimentDoorsResponse = await porteService.getByBatiment(batimentId)
          doorsData = 'data' in batimentDoorsResponse ? batimentDoorsResponse.data : batimentDoorsResponse
        } else {
          doorsData = await porteService.getAll()
        }
        
        setDoors(doorsData)
        
        // Réinitialiser si la porte sélectionnée n'existe plus
        if (value && doorsData.length > 0 && !doorsData.some(door => door.id === parseInt(value.toString()))) {
          onChange(0)
        }
      } catch (error) {
        console.error("Erreur chargement portes:", error)
        setDoors([])
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchDoors()
  }, [batimentId, departementId]) // Dépendances ajoutées

  const handleChange = (newValue: string) => {
    onChange(newValue ? parseInt(newValue) : 0)
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {label && (
        <Label htmlFor="door-filter" className="whitespace-nowrap">
          {label}
        </Label>
      )}
      <Select
        value={value ? value.toString() : ""}
        onValueChange={handleChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="door-filter" className="w-full">
          <SelectValue placeholder={allOptionLabel} />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && <SelectItem value="">
            {allOptionLabel}
          </SelectItem>}
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Chargement...
            </SelectItem>
          ) : doors.length > 0 ? (
            doors.map((door) => (
              <SelectItem key={door.id ?? 'unknown'} value={(door.id ?? 0).toString()}>
                {door.nom}
                {door.departement && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({door.departement.nom})
                  </span>
                )}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              {departementId > 0 
                ? "Aucune porte disponible pour ce département" 
                : batimentId > 0
                  ? "Aucune porte disponible pour ce bâtiment"
                  : "Aucune porte disponible"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}