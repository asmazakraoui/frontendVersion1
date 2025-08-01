'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { JourFerie } from '@/services/jourFerieService';

// Schéma de validation pour le formulaire
const formSchema = z.object({
  nom: z.string().min(1, { message: 'Le nom est requis' }),
  date: z.date({
    required_error: 'La date est requise',
  }),
});

type HolidayFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  initialData?: JourFerie;
  onCancel: () => void;
};

export default function HolidayForm({ onSubmit, initialData, onCancel }: HolidayFormProps) {

  // Initialiser le formulaire avec les valeurs par défaut ou les données existantes
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: initialData?.nom || '',
      date: initialData?.date ? new Date(initialData.date) : new Date(),
    },
  });

  // Mettre à jour le formulaire si les données initiales changent
  useEffect(() => {
    if (initialData) {
      form.reset({
        nom: initialData.nom,
        date: initialData.date instanceof Date ? initialData.date : new Date(initialData.date),
      });
    }
  }, [initialData, form]);

  // Gérer la soumission du formulaire
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  // Fonction pour afficher/masquer le calendrier
  const toggleCalendar = (fieldName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('calendar-popup-' + fieldName)?.classList.toggle('hidden');
  };

  // Fonction pour fermer le calendrier
  const closeCalendar = (fieldName: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    document.getElementById('calendar-popup-' + fieldName)?.classList.add('hidden');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black font-medium">Nom du jour férié</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Jour de l'An" {...field} className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black font-medium">Date</FormLabel>
              <div className="relative">
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      readOnly
                      value={field.value ? format(field.value, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                      className="pr-10 border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black"
                      onClick={(e) => toggleCalendar(field.name, e)}
                    />
                    <div 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                      onClick={(e) => toggleCalendar(field.name, e)}
                    >
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </div>
                  </div>
                </FormControl>
                
                <div 
                  id={'calendar-popup-' + field.name} 
                  className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 hidden"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Sélectionnez une date</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => closeCalendar(field.name, e)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      closeCalendar(field.name);
                    }}
                    initialFocus
                    className="border rounded-md"
                  />
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="bg-transparent hover:bg-gray-50 border-gray-200 text-black"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            className="bg-transparent hover:bg-gray-50 border-gray-200 text-black"
          >
            {initialData ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
