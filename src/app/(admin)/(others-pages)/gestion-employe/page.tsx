"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Facebook, Globe, Linkedin, Twitter, Plus, Trash, Edit, Upload, Key } from "lucide-react"
import employeeService, { Employee, CreateEmployeeDto, UpdateEmployeeDto } from "@/services/employeeService"
import toast from "react-hot-toast"
import { EmployeeForm } from "./employee-form"

// Carte d'employé simplifiéez
function EmployeeCard({ employee, onEdit, onDelete }: { 
  employee: Employee, 
  onEdit: (employee: Employee) => void, 
  onDelete: (id: number) => void 
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(employee.image || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Utiliser le service pour l'upload d'image
      const result = await employeeService.uploadImage(employee.id, file);
      
      toast.success('Image uploadée avec succès');
      setImageUrl(result.imageUrl);
    } catch (error) {
      console.error('Erreur d\'upload:', error);
      toast.error('Échec de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Avatar */}
      <div className="relative">
        <div className="h-24 w-full bg-blue-500" />
        <div className="absolute left-1/2 top-12 flex -translate-x-1/2 transform justify-center">
          <div 
            className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white relative group"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/jpeg,image/png,image/gif,image/webp';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleImageUpload(file);
              };
              input.click();
            }}
          >
            {isUploading ? (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  width={96} height={96}
                  className="h-full w-full object-cover"
                  unoptimized={!!imageUrl} // Skip optimization for external images
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Infos */}
      <CardContent className="mt-16 text-center">
        <h3 className="text-xl font-bold">{employee.firstName} {employee.lastName}</h3>
        <p className="text-muted-foreground">{employee.email}</p>

        {/* Icônes sociales */}
        <div className="mt-4 flex justify-center space-x-2">
          {[Facebook, Twitter, Linkedin, Globe].map((Icon, i) => (
            <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/30">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>

        {/* Badge */}
        <div className="mt-4 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="ml-2 text-sm text-muted-foreground">Employé</span>
          <span className="ml-4 text-sm text-muted-foreground">Card ID: {employee.cardId || 'Non défini'}</span>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex justify-center gap-2 border-t p-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1" 
          onClick={() => onEdit(employee)}
        >
          <Edit className="mr-2 h-4 w-4" />Modifier
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1" 
          onClick={() => onDelete(employee.id)}
        >
          <Trash className="mr-2 h-4 w-4" />Supprimer
        </Button>
      </CardFooter>
    </Card>
  )
}

// Page principale de gestion des employés
export default function EmployeesManagePage() {
  // États
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchName, setSearchName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);

  // Chargement initial
  useEffect(() => { loadEmployees(); }, []);
  
  // Recherche avec délai
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchName.trim()) return loadEmployees();
      
      // Filtrage local
      setEmployees(employees.filter(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        return fullName.includes(searchName.toLowerCase());
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchName]);

  // Fonctions
  async function loadEmployees() {
    try {
      setIsLoading(true);
      setEmployees(await employeeService.getAll());
    } catch (error) {
      toast.error("Impossible de charger les employés");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(data: CreateEmployeeDto | UpdateEmployeeDto) {
    try {
      let employee;
      if (currentEmployee) {
        employee = await employeeService.update(currentEmployee.id, data);
        toast.success("Employé mis à jour avec succès");
      } else {
        employee = await employeeService.create(data as CreateEmployeeDto);
        toast.success("Employé créé avec succès");
      }
      setIsFormOpen(false);
      loadEmployees();
      return employee;
    } catch (error) {
      toast.error("Opération échouée");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) return;
    
    try {
      await employeeService.delete(id);
      toast.success("Employé supprimé avec succès");
      loadEmployees();
    } catch {
      toast.error("Impossible de supprimer l'employé");
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Gestion des employés</h2>
        <Button onClick={() => { setCurrentEmployee(undefined); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Ajouter
        </Button>
      </div>

      {/* Recherche */}
      <div className="rounded-lg bg-muted/20 p-4">
        <Input
          placeholder="Rechercher un employé"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="h-10 bg-white w-full md:w-1/3"
        />
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center p-8"><p>Chargement...</p></div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {employees.length > 0 ? (
            employees.map(emp => (
              <EmployeeCard 
                key={emp.id} 
                employee={emp} 
                onEdit={e => { setCurrentEmployee(e); setIsFormOpen(true); }} 
                onDelete={handleDelete} 
              />
            ))
          ) : (
            <div className="col-span-full text-center p-8">
              <p>Aucun employé trouvé</p>
            </div>
          )}
        </div>
      )}

      {/* Formulaire */}
      <EmployeeForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        employee={currentEmployee}
      />
    </div>
  )
}