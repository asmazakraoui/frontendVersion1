"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, DoorOpen, Lock, Building } from "lucide-react"
import { AccessZoneForm } from "./access-zone-form"
import zoneAccessService, { ZoneAccess } from "@/services/zoneAccessService"
import batimentService from "@/services/batimentService"

export default function AccessZonesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<any | undefined>(undefined)
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({})
  const [buildings, setBuildings] = useState<any[]>([])
  const [filteredBuildings, setFilteredBuildings] = useState<any[]>([])
  const [accessZones, setAccessZones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ totalZones: 0, totalPortes: 0, totalBatiments: 0 })

  // Récupérer les statistiques des zones d'accès
  const fetchStats = async () => {
    try {
      const data = await zoneAccessService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Charger les zones d'accès et les bâtiments
  const loadData = async () => {
    setIsLoading(true)
    try {
      // Récupérer les statistiques
      await fetchStats();
      
      // Charger les zones d'accès
      const zonesData = await zoneAccessService.getAll()
      
      // Charger les bâtiments
      const buildingsData = await batimentService.getAll()
      
      // Formater les données pour l'affichage
      const formattedZones = zonesData.map(zone => {
        const uniqueBatiments = zone.portes && zone.portes.length > 0 
          ? [...new Set(zone.portes
              .filter(porte => porte.departement && porte.departement.batiment)
              .map(porte => porte.departement.batiment.name))]
          : [];
        
        // Joindre les noms des bâtiments en une seule chaîne
        const buildingDisplay = uniqueBatiments.length > 0 
          ? uniqueBatiments.join(", ") 
          : "Non assigné";
        
        return {
          id: zone.id?.toString() || "",
          name: zone.nom,
          building: buildingDisplay,
          doors: zone.portes ? zone.portes.map(porte => porte.nom) : [],
          rawData: zone 
        };
      })
      
      setAccessZones(formattedZones)
      setBuildings(buildingsData)
      setFilteredBuildings(buildingsData)
      setError(null)
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err)
      setError("Impossible de charger les données.")
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les données au chargement du composant
  useEffect(() => {
    loadData()
  }, [])

  // Fonction pour filtrer par bâtiment
  const filterByBuilding = async (buildingId: string) => {
    setIsLoading(true)
    try {
      if (buildingId === 'all') {
        await loadData()
        return
      }
      
      const batimentId = parseInt(buildingId)
      
      const zonesData = await zoneAccessService.getByBatimentId(batimentId)
      
      const formattedZones = zonesData.map(zone => {
        const uniqueBatiments = zone.portes && zone.portes.length > 0 
          ? [...new Set(zone.portes
              .filter(porte => porte.departement && porte.departement.batiment)
              .map(porte => porte.departement.batiment.name))]
          : [];
        
        const buildingDisplay = uniqueBatiments.length > 0 
          ? uniqueBatiments.join(", ") 
          : "Non assigné";
        
        return {
          id: zone.id?.toString() || "",
          name: zone.nom,
          building: buildingDisplay,
          doors: zone.portes ? zone.portes.map(porte => porte.nom) : [],
          rawData: zone
        };
      })
      
      setAccessZones(formattedZones)
      setError(null)
    } catch (err) {
      console.error("Erreur lors du filtrage par bâtiment:", err)
      setError("Impossible de filtrer les zones d'accès.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour rechercher des zones d'accès
  const searchZones = async (term: string) => {
    if (!term || term.trim() === '') {
      loadData()
      return
    }

    setIsLoading(true)
    try {
      const zonesData = await zoneAccessService.search(term)
      
      // Formater les données pour l'affichage (même logique que dans loadData)
      const formattedZones = zonesData.map(zone => {
        const uniqueBatiments = zone.portes && zone.portes.length > 0 
          ? [...new Set(zone.portes
              .filter(porte => porte.departement && porte.departement.batiment)
              .map(porte => porte.departement.batiment.name))]
          : [];
        
        const buildingDisplay = uniqueBatiments.length > 0 
          ? uniqueBatiments.join(", ") 
          : "Non assigné";
        
        return {
          id: zone.id?.toString() || "",
          name: zone.nom,
          building: buildingDisplay,
          doors: zone.portes ? zone.portes.map(porte => porte.nom) : [],
          rawData: zone
        };
      })
      
      setAccessZones(formattedZones)
      setError(null)
    } catch (error) {
      console.error('Erreur lors de la recherche des zones d\'accès:', error)
      setError("Impossible de rechercher les zones d'accès.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchZones(searchTerm)
    }, 500) // Délai de 500ms

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  useEffect(() => {
    setFilteredBuildings(buildings)
  }, [buildings])

  const handleEdit = (zone: any) => {
    console.log("Zone à éditer:", zone)
    setSelectedZone(zone)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedZone(undefined)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedZone(undefined)
  }
  
  const handleDelete = async (zoneId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette zone d'accès ?")) {
      try {
        await zoneAccessService.delete(parseInt(zoneId))
        loadData()
      } catch (err) {
        console.error(`Erreur lors de la suppression de la zone d'accès ${zoneId}:`, err)
        setError("Impossible de supprimer la zone d'accès.")
      }
    }
  }

  const toggleZoneExpansion = (zoneId: string) => {
    setExpandedZones((prev) => ({
      ...prev,
      [zoneId]: !prev[zoneId],
    }))
  }

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Gestion des zones d'accès</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zone de recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">

            <div className="space-y-2">
              <label htmlFor="building" className="text-sm font-medium">
                Bâtiment
              </label>
              <Select 
                defaultValue="all"
                onValueChange={(value) => {
                  filterByBuilding(value);
                }}
              >
                <SelectTrigger id="building">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {filteredBuildings && filteredBuildings.length > 0 ? (
                    filteredBuildings.map((building) => (
                      <SelectItem key={building.id} value={building.id.toString()}>
                        {building.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>Aucun bâtiment disponible</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Recherche
              </label>
              <Input
                id="search"
                placeholder="Rechercher une zone d'accès..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4 mx-auto max-w-6xl">
          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full">
              <Lock className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total des zones</p>
              <p className="text-2xl font-bold dark:text-white">{stats.totalZones}</p>
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-full">
              <DoorOpen className="h-6 w-6 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total des portes</p>
              <p className="text-2xl font-bold dark:text-white">{stats.totalPortes}</p>
            </div>
          </div>

          <div className="bg-card dark:bg-card rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
              <Building className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bâtiments</p>
              <p className="text-2xl font-bold dark:text-white">{stats.totalBatiments}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone d'accès</TableHead>
                <TableHead>Porte</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Chargement des zones d'accès...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-red-500">{error}</TableCell>
                </TableRow>
              ) : accessZones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Aucune zone d'accès trouvée</TableCell>
                </TableRow>
              ) : accessZones.map((zone) => (
                <React.Fragment key={zone.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleZoneExpansion(zone.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        {zone.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{zone.doors.length} portes</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(zone)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(zone.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedZones[zone.id] &&
                    zone.doors.map((door: string, index: number) => (
                      <TableRow key={`${zone.id}-door-${index}`} className="bg-muted/20">
                        <TableCell></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 pl-4">
                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                            {door}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" disabled>
                              <Pencil className="h-4 w-4 opacity-30" />
                            </Button>
                            <Button variant="ghost" size="icon" disabled></Button>
                            <Button variant="ghost" size="icon" disabled>
                              <Trash2 className="h-4 w-4 opacity-30" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-end p-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Précédent
              </Button>
              <Button variant="outline" size="sm" className="px-3">
                1
              </Button>
              <Button variant="outline" size="sm">
                Suivant
              </Button>
              <Select defaultValue="10">
                <SelectTrigger className="w-16">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire pour ajouter/modifier une zone d'accès */}
      <AccessZoneForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        accessZone={selectedZone} 
        onSave={loadData} 
      />
    </div>
  )
}