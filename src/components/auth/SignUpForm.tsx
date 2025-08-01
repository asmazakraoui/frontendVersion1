"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import authService from "@/services/authService"

export default function SignUpForm() {
  //Suivre l'état de l'ouverture du formulaire
  const [showPassword, setShowPassword] = useState(false)
  //Stocker data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin", // Par défaut, l'inscription crée un compte admin
  })
  //Suivre si le formulaire est en train de charger
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
//captent chaque lettre tapée et mettent à jour l'état du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, role: checked ? "admin" : "employee" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    //Empêche le comportement par défaut du navigateur 
    e.preventDefault()
    //Efface les messages d'erreur précédents
    setError(null)
    //Active l'indicateur de chargement
    setLoading(true)

    try {
      // Appel au service d'authentification pour l'inscription
      await authService.signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })

      // Rediriger vers la page de connexion après l'inscription réussie
      alert("Inscription réussie ! Veuillez vous connecter.")
      router.push("/signin")
    } catch (err: any) {
      setError(err.message || "Échec de l'inscription. Veuillez réessayer.")
      console.error("Erreur d'inscription:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-medium text-gray-700">Créez votre compte et commencez l'aventure</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">
              Nom
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="h-12 border-gray-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="h-12 border-gray-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="h-12 border-gray-300 pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
           
          </div>

          <Button 
            type="submit" 
            className="h-12 w-full bg-indigo-500 text-white hover:bg-indigo-600"
            disabled={loading}
          >
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Vous avez déjà un compte ?{" "}
          <Link href="/signin" className="font-medium text-indigo-500 hover:text-indigo-600">
            Connectez-vous
          </Link>
        </div>
      </div>
    </div>
  )
}