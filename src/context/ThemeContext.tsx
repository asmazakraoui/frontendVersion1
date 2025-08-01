"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  // Détection du thème préféré du système
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Vérifier d'abord le localStorage
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      
      // Si pas de thème sauvegardé, utiliser la préférence du système
      if (!savedTheme) {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const systemTheme = prefersDark ? "dark" : "light";
        setThemeState(systemTheme);
      } else {
        setThemeState(savedTheme);
      }
      
      setIsInitialized(true);
    }
  }, []);

  // Appliquer le thème au document
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("theme", theme);
      
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        document.body.style.backgroundColor = "#1a2231"; // Couleur de fond sombre
        document.body.style.color = "#ffffff"; // Couleur de texte claire
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        document.body.style.backgroundColor = "#ffffff"; // Couleur de fond claire
        document.body.style.color = "#101828"; // Couleur de texte sombre
      }
    }
  }, [theme, isInitialized]);

  // Écouter les changements de préférence du système
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleChange = (e: MediaQueryListEvent) => {
        // Ne changer automatiquement que si l'utilisateur n'a pas explicitement choisi un thème
        if (!localStorage.getItem("theme")) {
          setThemeState(e.matches ? "dark" : "light");
        }
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      return newTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
