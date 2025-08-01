// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Societe, SocieteDTO } from "@/services/societeService"

// interface SocieteFormProps {
//   societe?: Societe
//   onSubmit: (data: SocieteDTO) => void
//   onCancel: () => void
// }

// export function SocieteForm({ societe, onSubmit, onCancel }: SocieteFormProps) {
//   const [formData, setFormData] = useState({
//     nom: "",
//     adresse: "",
//     codePostal: "",
//     ville: "",
//     pays: ""
//   })

//   // Pré-remplir le formulaire si on est en mode édition
//   useEffect(() => {
//     if (societe) {
//       setFormData({
//         nom: societe.nom || "",
//         adresse: societe.adresse || "",
//         codePostal: societe.codePostal || "",
//         ville: societe.ville || "",
//         pays: societe.pays || ""
//       })
//     }
//   }, [societe])

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setFormData(prev => ({ ...prev, [name]: value }))
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     onSubmit(formData)
//   }

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>{societe ? "Modifier la société" : "Ajouter une société"}</CardTitle>
//         </CardHeader>
//         <form onSubmit={handleSubmit}>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="nom">Nom</Label>
//               <Input
//                 id="nom"
//                 name="nom"
//                 value={formData.nom}
//                 onChange={handleChange}
//                 placeholder="Nom de la société"
//                 required
//               />
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="adresse">Adresse</Label>
//               <Input
//                 id="adresse"
//                 name="adresse"
//                 value={formData.adresse}
//                 onChange={handleChange}
//                 placeholder="Adresse"
//                 required
//               />
//             </div>
            
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="codePostal">Code postal</Label>
//                 <Input
//                   id="codePostal"
//                   name="codePostal"
//                   value={formData.codePostal}
//                   onChange={handleChange}
//                   placeholder="Code postal"
//                   required
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="ville">Ville</Label>
//                 <Input
//                   id="ville"
//                   name="ville"
//                   value={formData.ville}
//                   onChange={handleChange}
//                   placeholder="Ville"
//                   required
//                 />
//               </div>
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="pays">Pays</Label>
//               <Input
//                 id="pays"
//                 name="pays"
//                 value={formData.pays}
//                 onChange={handleChange}
//                 placeholder="Pays"
//                 required
//               />
//             </div>
//           </CardContent>
          
//           <CardFooter className="flex justify-between">
//             <Button type="button" variant="outline" onClick={onCancel}>
//               Annuler
//             </Button>
//             <Button type="submit">
//               {societe ? "Mettre à jour" : "Créer"}
//             </Button>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   )
// }
