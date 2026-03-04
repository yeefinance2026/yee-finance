import React, { createContext, useContext, useEffect, useState } from "react";

export type ColorTheme = "dark-green" | "light-green";

interface ThemeColorContextType {
  colorTheme: ColorTheme;
  toggleColorTheme: () => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

interface ThemeColorProviderProps {
  children: React.ReactNode;
  defaultColorTheme?: ColorTheme;
}

export function ThemeColorProvider({
  children,
  defaultColorTheme = "dark-green",
}: ThemeColorProviderProps) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem("color-theme");
    return (stored as ColorTheme) || defaultColorTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-color-theme", colorTheme);
    localStorage.setItem("color-theme", colorTheme);
  }, [colorTheme]);

  const toggleColorTheme = () => {
    setColorTheme((prev) => (prev === "dark-green" ? "light-green" : "dark-green"));
  };

  return (
    <ThemeColorContext.Provider value={{ colorTheme, toggleColorTheme }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (!context) {
    throw new Error("useThemeColor must be used within ThemeColorProvider");
  }
  return context;
}
