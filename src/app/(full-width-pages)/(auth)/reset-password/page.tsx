"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, ArrowLeft } from "lucide-react"
import authService from "@/services/authService"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Récupérer le token de réinitialisation depuis l'URL
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError("Token de réinitialisation manquant. Veuillez utiliser le lien complet envoyé par email.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    
    // Vérifier que le token est présent
    if (!token) {
      setError("Token de réinitialisation manquant. Veuillez utiliser le lien complet envoyé par email.")
      return
    }
    
    setError(null)
    setLoading(true)
    setSuccess(false)

    try {
      // Appel au service d'authentification pour la réinitialisation du mot de passe
      await authService.resetPassword(token, password)
      
      // Afficher le message de succès
      setSuccess(true)
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push("/signin")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la réinitialisation du mot de passe.")
      console.error("Erreur lors de la réinitialisation du mot de passe:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-medium text-gray-700">Réinitialisation du mot de passe</h1>
          <p className="mt-2 text-sm text-gray-500">
            Veuillez entrer votre nouveau mot de passe
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-600">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 border-gray-300 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="h-12 w-full bg-indigo-500 text-white hover:bg-indigo-600"
              disabled={loading || !token}
            >
              {loading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
            </Button>

            <div className="text-center">
              <Link href="/signin" className="flex items-center justify-center text-sm text-gray-500 hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la page de connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
