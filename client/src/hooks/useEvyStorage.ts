import { useState, useEffect, useCallback } from "react";
import type {
  EvyAppState,
  EvyConfig,
  EvyAporte,
} from "../../../shared/models";
import { criarAppStateVazio } from "../../../shared/models";

const STORAGE_KEY = "evy-app-state";

/**
 * Hook para gerenciar estado persistido em localStorage
 * Sincroniza automaticamente entre abas
 */
export function useEvyStorage() {
  const [state, setState] = useState<EvyAppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
      } else {
        // Primeira vez: criar estado vazio
        const novo = criarAppStateVazio();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(novo));
        setState(novo);
      }
    } catch (error) {
      console.error("Erro ao carregar estado:", error);
      const novo = criarAppStateVazio();
      setState(novo);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sincronizar com outras abas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(parsed);
        } catch (error) {
          console.error("Erro ao sincronizar estado:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Salvar estado no localStorage
  const salvar = useCallback((novoState: EvyAppState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novoState));
      setState(novoState);
    } catch (error) {
      console.error("Erro ao salvar estado:", error);
    }
  }, []);

  // Atualizar configurações
  const atualizarConfig = useCallback(
    (config: Partial<EvyConfig>) => {
      if (!state) return;
      const novoState = {
        ...state,
        config: {
          ...state.config,
          ...config,
          ultimaAtualizacao: new Date().toISOString(),
        },
      };
      salvar(novoState);
    },
    [state, salvar]
  );

  // Atualizar patrimônio
  const atualizarPatrimonio = useCallback(
    (valor: number, motivo: string) => {
      if (!state) return;
      const novoState = {
        ...state,
        patrimonio: {
          ...state.patrimonio,
          valorTotal: valor,
          ultimaAtualizacao: new Date().toISOString(),
          historico: [
            ...state.patrimonio.historico,
            {
              data: new Date().toISOString(),
              valorAnterior: state.patrimonio.valorTotal,
              valorNovo: valor,
              motivo,
            },
          ],
        },
      };
      salvar(novoState);
    },
    [state, salvar]
  );

  // Adicionar aporte
  const adicionarAporte = useCallback(
    (aporte: Omit<EvyAporte, "id">) => {
      if (!state) return;
      const novoAporte: EvyAporte = {
        ...aporte,
        id: `${Date.now()}-${Math.random()}`,
      };
      const novoPatrimonio =
        state.patrimonio.valorTotal +
        (aporte.tipo === "aporte" ? aporte.valor : aporte.valor);

      const novoState = {
        ...state,
        aportes: [...state.aportes, novoAporte],
        patrimonio: {
          ...state.patrimonio,
          valorTotal: novoPatrimonio,
          ultimaAtualizacao: new Date().toISOString(),
          historico: [
            ...state.patrimonio.historico,
            {
              data: new Date().toISOString(),
              valorAnterior: state.patrimonio.valorTotal,
              valorNovo: novoPatrimonio,
              motivo: aporte.tipo,
            },
          ],
        },
      };
      salvar(novoState);
      return novoAporte;
    },
    [state, salvar]
  );

  // Remover aporte
  const removerAporte = useCallback(
    (id: string) => {
      if (!state) return;
      const aporte = state.aportes.find((a) => a.id === id);
      if (!aporte) return;

      const novoPatrimonio = state.patrimonio.valorTotal - aporte.valor;
      const novoState = {
        ...state,
        aportes: state.aportes.filter((a) => a.id !== id),
        patrimonio: {
          ...state.patrimonio,
          valorTotal: novoPatrimonio,
          ultimaAtualizacao: new Date().toISOString(),
          historico: [
            ...state.patrimonio.historico,
            {
              data: new Date().toISOString(),
              valorAnterior: state.patrimonio.valorTotal,
              valorNovo: novoPatrimonio,
              motivo: "remocao",
            },
          ],
        },
      };
      salvar(novoState);
    },
    [state, salvar]
  );

  // Resetar tudo
  const resetar = useCallback(() => {
    const novo = criarAppStateVazio();
    salvar(novo);
  }, [salvar]);

  return {
    state,
    isLoading,
    atualizarConfig,
    atualizarPatrimonio,
    adicionarAporte,
    removerAporte,
    resetar,
  };
}
