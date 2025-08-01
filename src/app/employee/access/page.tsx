import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, DoorClosed, DoorOpen } from "lucide-react"

// Données d'exemple
const accessPoints = [
  {
    id: 1,
    building: "Mghira",
    department: "Administration",
    door: "Entrée principale",
    schedule: "8:00 - 17:00",
    days: "Lun-Ven",
  },
  {
    id: 2,
    building: "Mghira",
    department: "SIM",
    door: "Porte départementale",
    schedule: "8:00 - 17:00",
    days: "Lun-Ven",
  },
  {
    id: 3,
    building: "Mghira",
    department: "Printsecure",
    door: "Porte sécurisée",
    schedule: "8:00 - 17:00",
    days: "Lun-Ven",
  },
  {
    id: 4,
    building: "Mghira",
    department: "Technique",
    door: "Entrée technique",
    schedule: "8:00 - 17:00",
    days: "Lun-Ven",
  },
  {
    id: 5,
    building: "Tunis",
    department: "Réception",
    door: "Entrée principale",
    schedule: "8:00 - 17:00",
    days: "Lun-Ven",
  },
  {
    id: 6,
    building: "Tunis",
    department: "Salle de réunion",
    door: "Porte salle de réunion",
    schedule: "9:00 - 16:00",
    days: "Lun-Ven",
  },
  {
    id: 7,
    building: "Tunis",
    department: "Bureau principal",
    door: "Porte bureau",
    schedule: "8:00 - 17:00",
    days: "Lun-Ven",
  },
  {
    id: 8,
    building: "Tunis",
    department: "Cafétéria",
    door: "Entrée cafétéria",
    schedule: "8:00 - 17:00",
    days: "Lun-Ven",
  },
]

export default function EmployeeAccessPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Mes accès</h2>
        <Button>Demander un nouvel accès</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bâtiments</CardTitle>
            <DoorClosed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Bâtiments accessibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points d'accès</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Portes accessibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horaires</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-medium">8:00 - 17:00</div>
            <p className="text-xs text-muted-foreground">Horaires standards</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700">
              Actif
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Carte d'accès valide</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous les accès</TabsTrigger>
          <TabsTrigger value="mghira">Mghira</TabsTrigger>
          <TabsTrigger value="tunis">Tunis</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points d'accès autorisés</CardTitle>
              <CardDescription>Liste complète de vos accès dans tous les bâtiments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bâtiment</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Porte</TableHead>
                    <TableHead>Horaires</TableHead>
                    <TableHead>Jours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessPoints.map((point) => (
                    <TableRow key={point.id}>
                      <TableCell>{point.building}</TableCell>
                      <TableCell>{point.department}</TableCell>
                      <TableCell>{point.door}</TableCell>
                      <TableCell>{point.schedule}</TableCell>
                      <TableCell>{point.days}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mghira" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points d'accès - Mghira</CardTitle>
              <CardDescription>Vos accès dans le bâtiment Mghira</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Département</TableHead>
                    <TableHead>Porte</TableHead>
                    <TableHead>Horaires</TableHead>
                    <TableHead>Jours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessPoints
                    .filter((p) => p.building === "Mghira")
                    .map((point) => (
                      <TableRow key={point.id}>
                        <TableCell>{point.department}</TableCell>
                        <TableCell>{point.door}</TableCell>
                        <TableCell>{point.schedule}</TableCell>
                        <TableCell>{point.days}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tunis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points d'accès - Tunis</CardTitle>
              <CardDescription>Vos accès dans le bâtiment Tunis</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Département</TableHead>
                    <TableHead>Porte</TableHead>
                    <TableHead>Horaires</TableHead>
                    <TableHead>Jours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessPoints
                    .filter((p) => p.building === "Tunis")
                    .map((point) => (
                      <TableRow key={point.id}>
                        <TableCell>{point.department}</TableCell>
                        <TableCell>{point.door}</TableCell>
                        <TableCell>{point.schedule}</TableCell>
                        <TableCell>{point.days}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

