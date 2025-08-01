// "use client"

// import { useState, useRef } from 'react'
// import { Button } from './button'
// import { Upload, X } from 'lucide-react'
// import Image from 'next/image'
// import toast from 'react-hot-toast'

// interface ImageUploadProps {
//   employeeId?: number
//   onImageUploaded?: (imageUrl: string) => void
//   className?: string
// }

// export function ImageUpload({ employeeId, onImageUploaded, className = '' }: ImageUploadProps) {
//   const [isUploading, setIsUploading] = useState(false)
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     // Validate file type
//     const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
//     if (!validTypes.includes(file.type)) {
//       toast.error('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP')
//       return
//     }

//     // Validate file size (5MB max)
//     const maxSize = 5 * 1024 * 1024
//     if (file.size > maxSize) {
//       toast.error('Fichier trop volumineux. Taille maximum: 5MB')
//       return
//     }

//     // Create preview
//     const objectUrl = URL.createObjectURL(file)
//     setPreviewUrl(objectUrl)

//     // If no employee ID, just show preview
//     if (!employeeId) return

//     // Upload to server
//     try {
//       setIsUploading(true)
//       const formData = new FormData()
//       formData.append('image', file)

//       const response = await fetch(`http://localhost:3000/employee/${employeeId}/image`, {
//         method: 'POST',
//         body: formData,
//         credentials: 'include',
//       })

//       if (!response.ok) {
//         throw new Error('Échec de l\'upload')
//       }

//       const data = await response.json()
//       toast.success('Image uploadée avec succès')
      
//       // Call callback with new image URL
//       if (onImageUploaded && data.imageUrl) {
//         onImageUploaded(data.imageUrl)
//       }
//     } catch (error) {
//       console.error('Erreur d\'upload:', error)
//       toast.error('Échec de l\'upload de l\'image')
//       // Reset preview on error
//       setPreviewUrl(null)
//     } finally {
//       setIsUploading(false)
//     }
//   }

//   const clearImage = () => {
//     setPreviewUrl(null)
//     if (fileInputRef.current) {
//       fileInputRef.current.value = ''
//     }
//   }

//   return (
//     <div className={`flex flex-col items-center gap-2 ${className}`}>
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/jpeg,image/png,image/gif,image/webp"
//         onChange={handleFileChange}
//         className="hidden"
//         disabled={isUploading}
//       />

//       {previewUrl ? (
//         <div className="relative">
//           <Image 
//             src={previewUrl} 
//             alt="Aperçu" 
//             width={150} 
//             height={150} 
//             className="h-[150px] w-[150px] rounded-full object-cover border-4 border-white"
//           />
//           <button 
//             onClick={clearImage}
//             className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white"
//             type="button"
//           >
//             <X size={16} />
//           </button>
//         </div>
//       ) : (
//         <Button 
//           type="button" 
//           variant="outline" 
//           onClick={() => fileInputRef.current?.click()}
//           disabled={isUploading}
//           className="w-[150px] h-[150px] rounded-full border-dashed flex flex-col items-center justify-center"
//         >
//           <Upload className="h-6 w-6 mb-2" />
//           <span className="text-sm">Choisir une image</span>
//         </Button>
//       )}
//     </div>
//   )
// }
