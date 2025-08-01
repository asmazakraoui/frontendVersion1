"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type CompanyContextType = {
  selectedCompany: string
  selectedSubsidiary: string
  setSelectedCompany: (company: string) => void
  setSelectedSubsidiary: (subsidiary: string) => void
}

// Create context with a default undefined value but properly typed
const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedSubsidiary, setSelectedSubsidiary] = useState("")
  
  // Create the context value object
  const value = {
    selectedCompany,
    selectedSubsidiary,
    setSelectedCompany,
    setSelectedSubsidiary
  }

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider")
  }
  return context
}