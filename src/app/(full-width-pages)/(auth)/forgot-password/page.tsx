"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import authService from "@/services/authService"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setSuccess(false)

    try {
      // Appel au service d'authentification pour la demande de réinitialisation
      await authService.forgotPassword(email)
      
      // Afficher le message de succès
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la demande de réinitialisation.")
      console.error("Erreur lors de la demande de réinitialisation:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-medium text-gray-700">Mot de passe oublié</h1>
          <p className="mt-2 text-sm text-gray-500">
            Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-600">
              Un e-mail contenant les instructions de réinitialisation a été envoyé à {email}.
              Veuillez vérifier votre boîte de réception.
            </div>
            <Link href="/signin" className="flex items-center text-sm text-gray-500 hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la page de connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Adresse e-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-300"
                placeholder="nom@exemple.com"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="h-12 w-full bg-indigo-500 text-white hover:bg-indigo-600"
              disabled={loading}
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
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
