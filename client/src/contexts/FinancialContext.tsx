import React, { createContext, useContext, useState, useEffect } from "react";

export interface FinancialState {
  patrimonio: number;
  aporteMensal: number;
  despesaMensal: number;
  taxaAnual: number;
}

interface FinancialContextType {
  state: FinancialState;
  setState: (newState: Partial<FinancialState>) => void;
  reset: () => void;
}

const defaultState: FinancialState = {
  patrimonio: 50000,
  aporteMensal: 1000,
  despesaMensal: 5000,
  taxaAnual: 0.04,
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateInternal] = useState<FinancialState>(() => {
    // Carregar do localStorage se existir
    const saved = localStorage.getItem("evy-financial-state");
    return saved ? JSON.parse(saved) : defaultState;
  });

  // Salvar no localStorage sempre que state mudar
  useEffect(() => {
    localStorage.setItem("evy-financial-state", JSON.stringify(state));
  }, [state]);

  const setState = (newState: Partial<FinancialState>) => {
    setStateInternal((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  const reset = () => {
    setStateInternal(defaultState);
    localStorage.removeItem("evy-financial-state");
  };

  return (
    <FinancialContext.Provider value={{ state, setState, reset }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error("useFinancial must be used within FinancialProvider");
  }
  return context;
}
