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

export default function SignInForm(){
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Appel au service d'authentification pour la connexion
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      })

      // Si la connexion réussit, rediriger vers le dashboard
      router.push("/dashboard")
    } catch (err: any) {
      // Gérer les différents types d'erreurs
      if (err.message && err.message.includes("Accès refusé")) {
        // Message spécifique pour les utilisateurs non-admin
        setError("Accès refusé. Seuls les administrateurs peuvent se connecter à cette application.")
      } else {
        // Message générique pour les autres erreurs
        setError(err.message || "Échec de la connexion. Veuillez vérifier vos identifiants.")
      }
      console.error("Erreur de connexion:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-medium text-gray-700">Veuillez vous connecter à votre compte et commencer l'aventure.</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
              {error}
            </div>
          )}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-primary">
                Forgot Password?
              </Link>
            </div>
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
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={handleCheckboxChange}
              className="h-5 w-5 border-gray-300 text-primary"
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal text-gray-600">
              Remember Me
            </Label>
          </div>

          <Button 
            type="submit" 
            className="h-12 w-full bg-indigo-500 text-white hover:bg-indigo-600"
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          New on our platform?{" "}
          <Link href="/signup" className="font-medium text-indigo-500 hover:text-indigo-600">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}