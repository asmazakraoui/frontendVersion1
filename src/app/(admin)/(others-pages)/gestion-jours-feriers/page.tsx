'use client';

import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import jourFerieService, { JourFerie } from "@/services/jourFerieService";
import HolidayForm from "./holiday-form";
import toast from "react-hot-toast";
import authService from "@/services/authService";

export default function GestionJoursFeries() {
  // États pour stocker nos données
  const [holidays, setHolidays] = useState<JourFerie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<JourFerie | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Charger tous les jours fériés
  const loadHolidays = async () => {
    try {
      setIsLoading(true);
      const data = await jourFerieService.getAll();
      setHolidays(data);
    } catch (error) {
      toast.error('Impossible de charger les jours fériés');
    } finally {
      setIsLoading(false);
    }
  };

  // Rechercher des jours fériés
  const searchHolidays = async (term: string) => {
    try {
      setIsLoading(true);
      // Si la recherche est vide, charger tous les jours fériés
      if (!term.trim()) {
        await loadHolidays();
        return;
      }
      // Sinon, chercher par le terme
      const data = await jourFerieService.search(term);
      setHolidays(data);
    } catch (error) {
      toast.error('Erreur de recherche');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les jours fériés au démarrage
  useEffect(() => {
    loadHolidays();
  }, []);

  // Rechercher quand le terme change (avec délai)
  useEffect(() => {
    const timer = setTimeout(() => {
      searchHolidays(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Ajouter un jour férié
  const handleAddHoliday = () => {
    setSelectedHoliday(undefined);
    setIsFormOpen(true);
  };

  // Modifier un jour férié
  const handleEditHoliday = (holiday: JourFerie) => {
    setSelectedHoliday(holiday);
    setIsFormOpen(true);
  };

  // Supprimer un jour férié
  const handleDelete = async (holiday: JourFerie) => {
    if (holiday && holiday.id) {
      try {
        await jourFerieService.delete(holiday.id);
        toast.success('Jour férié supprimé');
        loadHolidays(); // Recharger la liste
      } catch (error) {
        toast.error('Impossible de supprimer');
      }
    }
  };

  // Fermer le formulaire
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedHoliday(undefined);
  };

  // Enregistrer un jour férié (création ou modification)
  const handleSaveHoliday = async (formData: any) => {
    try {
      // Récupérer l'ID de l'utilisateur
      const userId = authService.getCurrentUserId();
      
      if (!userId) {
        toast.error("Vous devez être connecté");
        return;
      }
      
      const holidayData = {
        nom: formData.nom,
        date: formData.date,
        userId: userId
      };
      
      if (selectedHoliday?.id) {
        // Mise à jour
        await jourFerieService.update(selectedHoliday.id, holidayData);
        toast.success('Jour férié mis à jour');
      } else {
        // Création
        await jourFerieService.create(holidayData);
        toast.success('Jour férié créé');
      }
      
      handleCloseForm();
      loadHolidays(); // Recharger la liste
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  // Préparer les dates pour le calendrier
  const holidayDates = holidays.map(holiday => new Date(holiday.date));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des Jours Fériés</h1>
      
      {/* Barre de recherche et bouton d'ajout */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
            🔍
          </span>
        </div>
        <Button onClick={handleAddHoliday}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter 
        </Button>
      </div>
      
      {/* Grille avec calendrier et liste */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carte du calendrier */}
        <Card>
          <CardHeader>
            <CardTitle>Calendrier des jours fériés</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date)}
              disabled={[{ before: new Date() }]}
              modifiers={{ booked: holidayDates }}
              modifiersStyles={{
                booked: { backgroundColor: '#FFCC00', color: '#000', fontWeight: 'bold' }
              }}
              className="rounded-md border"
            />
            <div className="mt-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#FFCC00] rounded-full mr-2"></div>
                <span>Jours fériés</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte de la liste */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des jours fériés</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4">
                Chargement...
              </p>
            ) : holidays.length > 0 ? (
              <ul className="space-y-2">
                {holidays.map((holiday) => (
                  <li key={holiday.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-200">
                    <div>
                      <p className="font-medium">{holiday.nom}</p>
                      <p className="text-sm text-gray-500">{jourFerieService.formatDate(holiday.date)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditHoliday(holiday)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(holiday)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4">
                {searchTerm ? "Aucun résultat trouvé" : "Aucun jour férié défini"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formulaire dans une boîte de dialogue */}
      <Dialog 
        open={isFormOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-blue-50">
          <DialogHeader className="bg-blue-100 p-5 rounded-t-lg border-b border-blue-100">
            <DialogTitle className="text-blue-800 text-xl font-semibold">
              {selectedHoliday ? "Modifier le jour férié" : "Ajouter un jour férié"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <HolidayForm
              onSubmit={handleSaveHoliday}
              initialData={selectedHoliday}
              onCancel={handleCloseForm}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}