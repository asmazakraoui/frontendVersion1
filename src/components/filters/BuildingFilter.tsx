"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import batimentService from "@/services/batimentService"

interface BuildingFilterProps {
  label?: string
  value: number | string
  onChange: (value: number) => void
  className?: string
  showAllOption?: boolean
  allOptionLabel?: string
}

export function BuildingFilter({
  label = "Bâtiment",
  value,
  onChange,
  className = "",
  showAllOption = true,
  allOptionLabel = "Tous les bâtiments"
}: BuildingFilterProps) {
  const [buildings, setBuildings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Charger les bâtiments au chargement du composant
  useEffect(() => {
    const fetchBuildings = async () => {
      setIsLoading(true)
      try {
        const buildingsData = await batimentService.getAll()
        setBuildings(buildingsData)
      } catch (error) {
        console.error("Erreur lors du chargement des bâtiments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBuildings()
  }, [])

  const handleChange = (newValue: string) => {
    onChange(parseInt(newValue))
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {label && (
        <Label htmlFor="building-filter" className="whitespace-nowrap">
          {label}
        </Label>
      )}
      <Select
        value={value.toString()}
        onValueChange={handleChange}
      >
        <SelectTrigger id="building-filter" className="w-full">
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
          ) : buildings.length > 0 ? (
            buildings.map((building) => (
              <SelectItem key={building.id} value={building.id.toString()}>
                {building.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              Aucun bâtiment disponible
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}