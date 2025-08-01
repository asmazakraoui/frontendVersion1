// frontend/src/app/(admin)/(others-pages)/gestion-logs-acces/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AccessLog, accessLogService } from "@/services/access-logService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


// Fonction simple pour exporter des données en CSV
function exportCSV(data: any[]) {
  if (!data || data.length === 0) return;
  
  // Créer les lignes du CSV
  let csvContent = "Carte,Date,Type,Utilisateur,Système d'accès,Statut,Raison\n";
  
  // Ajouter chaque log
  data.forEach(log => {
    const date = format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: fr });
    const type = log.type === "ENTRY" ? "Entrée" : "Sortie";
    const employee = log.employee ? `${log.employee.firstName || ''} ${log.employee.lastName || ''}`.trim() : "Inconnu";
    const system = log.accessSystem ? `${log.accessSystem.Marque || ''} ${log.accessSystem.Modele || ''}`.trim() : "Inconnu";
    const status = log.success ? "Accordé" : "Refusé";
    const reason = log.message || "";
    
    csvContent += `"${log.cardId}","${date}","${type}","${employee}","${system}","${status}","${reason}"\n`;
  });
  
  // Créer un lien de téléchargement
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `logs_acces_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function AccessLogsPage() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>(""); // "" pour tous, "ENTRY" pour entrée, "EXIT" pour sortie
  const [selectedStatus, setSelectedStatus] = useState<string>(""); // "" pour tous, "success" pour réussis, "failed" pour refusés

  // Charger les données au chargement du composant et à chaque changement de filtre
  useEffect(() => {
    fetchLogs();
  }, [selectedType, selectedStatus]); // Ajouter selectedType et selectedStatus comme dépendances

  // Fonction pour récupérer les logs
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Utiliser la méthode du service pour récupérer les logs filtrés
      const success = selectedStatus ? selectedStatus === 'success' : undefined;
      const data = await accessLogService.getFilteredLogs(selectedType, success);
      setLogs(data);
    } catch (error) {
      console.error("Erreur lors du chargement des logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Journalisation des accès</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCSV(logs)} disabled={isLoading || logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres simples */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-48">
                <label className="block text-sm font-medium mb-1">Type d'accès</label>
                <select 
                  className="w-full p-2 border rounded-md" 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  aria-label="Filtrer par type d'accès"
                >
                  <option value="">Tous</option>
                  <option value="ENTRY">Entrée</option>
                  <option value="EXIT">Sortie</option>
                </select>
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select 
                  className="w-full p-2 border rounded-md" 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  aria-label="Filtrer par statut d'accès"
                >
                  <option value="">Tous</option>
                  <option value="success">Accordés</option>
                  <option value="failed">Refusés</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Historique des accès ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun log d'accès trouvé.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carte</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Système d'accès</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Raison du refus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className={!log.success ? "bg-red-50" : ""}
                    >
                      <TableCell>{log.cardId}</TableCell>
                      <TableCell>
                        {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.type === "ENTRY" ? "default" : "secondary"}>
                          {log.type === "ENTRY" ? "Entrée" : "Sortie"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.employee ? (
                          <span>
                            {`${log.employee.firstName || ''} ${log.employee.lastName || ''}`.trim() || `Employé #${log.employeeId}`}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Inconnu</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.accessSystem ? (
                          <span>
                            {log.accessSystem.Marque} {log.accessSystem.Modele}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Inconnu</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {log.success ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-700">Accordé</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-700">Refusé</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {!log.success && log.message ? (
                          <span className="text-red-700">{log.message}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}