"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import userService, { User } from "@/services/userService";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";

export default function ProfileInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour l'image de profil
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    // Fonction pour récupérer les données utilisateur
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'ID utilisateur du localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error("Aucun ID utilisateur trouvé");
          setLoading(false);
          return;
        }
        
        console.log(`Tentative de récupération de l'utilisateur avec ID: ${userId}`);
        
        // Utiliser le service utilisateur
        const userData = await userService.getById(parseInt(userId));
        console.log("Données utilisateur récupérées:", userData);
        
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
        });
        
        // Charger l'image de profil si elle existe
        if (userData.profileImage) {
          const imageUrlResponse = await userService.getProfileImageUrl(userData.id);
          setImagePreview(imageUrlResponse.imageUrl);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <p className="text-center">Chargement des informations utilisateur...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <p className="text-center">Impossible de charger les informations utilisateur</p>
      </div>
    );
  }
  
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Réinitialiser le formulaire avec les données actuelles de l'utilisateur
    setFormData({
      name: user.name,
      email: user.email,
    });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  // Upload de l'image de profil
  const handleImageUpload = async () => {
    if (!imageFile || !user) return;
    
    try {
      setIsUploadingImage(true);
      
      // Utiliser le service pour l'upload d'image
      const result = await userService.uploadProfileImage(user.id, imageFile);
      
      // Mettre à jour l'utilisateur avec la nouvelle image
      setUser({
        ...user,
        profileImage: result.user.profileImage
      });
      
      // Mettre à jour la prévisualisation avec l'URL réelle
      setImagePreview(result.imageUrl);
      setImageFile(null);
      
      toast.success('Image de profil mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      toast.error('Échec de l\'upload de l\'image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Mettre à jour les informations utilisateur
      const updatedUser = await userService.update(user.id, formData);
      
      // Mettre à jour les données utilisateur localement
      setUser({
        ...user,
        name: updatedUser.name,
        email: updatedUser.email,
      });
      
      // Upload de l'image si une nouvelle image a été sélectionnée
      if (imageFile) {
        await handleImageUpload();
      }
      
      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Carte d'informations principales */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        {!isEditing ? (
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col items-center w-full gap-6 xl:flex-row xl:justify-between">
              <div className="flex flex-col items-center gap-6 xl:flex-row">
                <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 relative group">
                  {imagePreview ? (
                    <Image
                      width={80}
                      height={80}
                      src={imagePreview}
                      alt="user"
                      className="h-full w-full object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="order-3 xl:order-2">
                  <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                    {user.name}
                  </h4>
                  <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.role}
                    </p>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 xl:mt-0">
                <button 
                  onClick={handleEditClick}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  Modifier le profil
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
              Modifier le profil
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload d'image */}
              <div className="flex justify-center mb-4">
                {imagePreview ? (
                  <div className="relative">
                    <Image 
                      src={imagePreview} 
                      alt="Aperçu" 
                      width={100} 
                      height={100} 
                      className="h-[100px] w-[100px] rounded-full object-cover border-2 border-gray-200"
                      unoptimized={imagePreview.startsWith('http')}
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
                    onClick={() => document.getElementById('profile-image-upload')?.click()}
                    className="h-[100px] w-[100px] rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Ajouter photo</span>
                  </div>
                )}
                <input 
                  id="profile-image-upload"
                  type="file" 
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="name" 
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label 
                  htmlFor="email" 
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-primary"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:hover:bg-gray-600"
                  disabled={isSubmitting || isUploadingImage}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:bg-blue-400"
                  disabled={isSubmitting || isUploadingImage}
                >
                  {isSubmitting || isUploadingImage ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Carte d'informations détaillées */}
      {!isEditing && (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Informations personnelles
              </h4>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Nom complet
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {user.name}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Rôle
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {user.role}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    ID Utilisateur
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {user.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
