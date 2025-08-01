"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import authService from "@/services/authService"
import employeeService, { Employee, CreateEmployeeDto, UpdateEmployeeDto } from "@/services/employeeService"
import { Upload, X } from "lucide-react"
import toast from "react-hot-toast"

// Champs du formulaire
const formFields = [
  { id: 'firstName', label: 'Prénom', required: true },
  { id: 'lastName', label: 'Nom', required: true },
  { id: 'email', label: 'Email', type: 'email', required: true },
  { id: 'phoneNumber', label: 'Téléphone' },
  { id: 'address', label: 'Adresse' },
];

type FormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateEmployeeDto | UpdateEmployeeDto) => Promise<Employee | void>
  employee?: Employee
}

export function EmployeeForm({ isOpen, onClose, onSubmit, employee }: FormProps) {
  // État du formulaire avec valeurs par défaut
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    userId: authService.getCurrentUserId() || undefined,
  });
  
  // État pour l'image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialisation du formulaire
  useEffect(() => {
    if (!employee) {
      setFormData({ ...formData, firstName: "", lastName: "", email: "", phoneNumber: "", address: "" });
      setImagePreview(null);
      setImageFile(null);
      return;
    }
    
    // Charger les données de l'employé en mode édition
    setFormData({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      phoneNumber: employee.phoneNumber || "",
      address: employee.address || "",
      userId: employee.userId || authService.getCurrentUserId() || undefined,
    });
    
    // Charger l'image si elle existe
    if (employee.image) {
      setImagePreview(employee.image);
    }
  }, [employee]);
  
  // Gérer la sélection d'une image
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Valider le type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP');
      return;
    }
    
    // Valider la taille (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux. Taille maximum: 5MB');
      return;
    }
    
    // Créer une prévisualisation
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setImageFile(file);
  };
  
  // Supprimer l'image sélectionnée
  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  // Gérer la soumission du formulaire avec l'image
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Soumettre d'abord les données de l'employé
    const employeeData = { ...formData, userId: authService.getCurrentUserId() || 1 };
    const result = await onSubmit(employeeData);
    
    // Si un fichier image est sélectionné et que l'employé a été créé/mis à jour avec succès
    if (imageFile && result && result.id) {
      try {
        setIsUploading(true);
        
        // Utiliser le service pour l'upload d'image
        await employeeService.uploadImage(result.id, imageFile);
        toast.success('Image uploadée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'upload de l\'image:', error);
        toast.error('Échec de l\'upload de l\'image');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-blue-50">
        <DialogHeader className="bg-blue-100 p-5 rounded-t-lg border-b border-blue-100">
          <DialogTitle className="text-blue-800">{employee ? 'Modifier' : 'Ajouter'} un employé</DialogTitle>
          <DialogDescription className="text-sm text-blue-600">
            {employee
              ? "Modifiez les détails de l'employé ci-dessous."
              : "Remplissez les informations pour ajouter un nouvel employé."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="flex justify-center mb-4">
              {imagePreview ? (
                <div className="relative">
                  <Image 
                    src={imagePreview} 
                    alt="Aperçu" 
                    width={100} 
                    height={100} 
                    className="h-[100px] w-[100px] rounded-full object-cover border-2 border-gray-200"
                    unoptimized={imagePreview.startsWith('http')} // Skip optimization for external images
                  />
                  <button 
                    onClick={(e) => { e.preventDefault(); clearImage(); }}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="h-[100px] w-[100px] rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Ajouter photo</span>
                </div>
              )}
              <input 
                id="image-upload"
                type="file" 
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            {formFields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-black font-medium">{field.label}</Label>
                <Input 
                  id={field.id}
                  type={field.type || 'text'}
                  value={formData[field.id as keyof typeof formData] as string || ''}
                  onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                  required={field.required}
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-black"
                />
              </div>
            ))}
          </div>
          <DialogFooter className="sm:max-w-md bg-blue-50">
            <div className="flex justify-end space-x-4 w-full">
              <Button type="button" variant="outline" onClick={onClose} className="bg-transparent hover:bg-gray-50 border-gray-200 text-black" disabled={isUploading}>Annuler</Button>
              <Button type="submit" className="bg-transparent hover:bg-gray-50 border-gray-200 text-black" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Traitement...
                  </>
                ) : (
                  employee ? 'Mettre à jour' : 'Créer'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
