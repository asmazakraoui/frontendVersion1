"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, DoorOpen, Lock } from "lucide-react";

// Définition des types
type AccessTypeStats = {
  type: string;
  count: string;
};

type AccessAlert = {
  id: number;
  cardId: string;
  timestamp: string;
  type: string;
  success: boolean;
  employee: {
    id: number;
    nom: string;
    prenom: string;
    cardId?: string;
  } | null;
  accessSystem: {
    id: number;
    Marque: string;
    Modele: string;
    status: boolean;
  } | null;
};

export default function DashboardPage() {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [porteCount, setPorteCount] = useState(0);
  const [systemCount, setSystemCount] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessTypeStats, setAccessTypeStats] = useState<AccessTypeStats[]>([]);
  const [accessAlerts, setAccessAlerts] = useState<AccessAlert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer le token d'authentification
        const accessToken = localStorage.getItem('accessToken');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        // Récupérer le nombre d'employés
        const employeeRes = await fetch("http://localhost:3000/employee/count", {
          method: 'GET',
          credentials: 'include',
          headers,
        });
        const employeeData = await employeeRes.json();
        
        // Récupérer le nombre de portes
        const porteRes = await fetch("http://localhost:3000/porte/count", {
          method: 'GET',
          credentials: 'include',
          headers,
        });
        const porteData = await porteRes.json();
        
        // Récupérer le nombre de systèmes d'accès
        const systemRes = await fetch("http://localhost:3000/access-system/count", {
          method: 'GET',
          credentials: 'include',
          headers,
        });
        const systemData = await systemRes.json();
        
        // Récupérer les statistiques mensuelles
        const statsRes = await fetch("http://localhost:3000/access-log/monthly-stats", {
          method: 'GET',
          credentials: 'include',
          headers,
        });
        const statsData = await statsRes.json();
        
        // Récupérer les statistiques par type d'accès (entrée/sortie)
        const typeStatsRes = await fetch("http://localhost:3000/access-log/stats/by-type", {
          method: 'GET',
          credentials: 'include',
          headers,
        });
        const typeStatsData = await typeStatsRes.json();
        
        // Récupérer les alertes d'accès (tentatives échouées)
        // const alertsRes = await fetch("http://localhost:3000/access-log/alerts", {
        //   method: 'GET',
        //   credentials: 'include',
        //   headers,
        // });
        // const alertsData = await alertsRes.json();
        
        // Mettre à jour les états
        setEmployeeCount(employeeData.count);
        setPorteCount(porteData.count);
        setSystemCount(systemData.count);
        setMonthlyStats(statsData);
        setAccessTypeStats(typeStatsData);
        //setAccessAlerts(alertsData);
        setError("");
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Employés</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{employeeCount}</div>
                <p className="text-xs text-muted-foreground">Total des employés enregistrés</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Portes</CardTitle>
                <DoorOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{porteCount}</div>
                <p className="text-xs text-muted-foreground">Total des portes dans le système</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Systèmes d'accès</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemCount}</div>
                <p className="text-xs text-muted-foreground">Total des systèmes d'accès installés</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Graphiques côte à côte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graphique des statistiques mensuelles */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Logs d'accès mensuels</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" name="Nombre d'accès" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card> 

            {/* Graphique en camembert des entrées vs sorties */}
            { <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Répartition des accès par type</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accessTypeStats.map(item => ({
                        name: item.type === 'ENTRY' ? 'Entrées' : 'Sorties',
                        value: parseInt(item.count)
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell key="entry" fill="#4f46e5" />
                      <Cell key="exit" fill="#10b981" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} accès`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card> }
          </div>

          {/* Alertes d'accès */}
          {/* <Card className="col-span-3 mt-6">
            <CardHeader>
              <CardTitle>Alertes d'accès récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {accessAlerts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Aucune alerte d'accès récente
                </div>
              ) : (
                <div className="space-y-4">
                  {accessAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-red-800">
                            {alert.employee ? `${alert.employee.prenom} ${alert.employee.nom}` : 'Utilisateur inconnu'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Accès refusé
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <p><span className="font-medium">Carte ID:</span> {alert.cardId}</p>
                        <p><span className="font-medium">Système:</span> {alert.accessSystem ? `${alert.accessSystem.Marque} ${alert.accessSystem.Modele}` : 'Inconnu'}</p>
                        <p><span className="font-medium">Type:</span> {alert.type === 'ENTRY' ? 'Entrée' : 'Sortie'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card> */}
        </>
      )}
    </div>
  );
}