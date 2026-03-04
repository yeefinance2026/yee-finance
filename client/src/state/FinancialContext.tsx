import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { FinancialState, Investimento, LancamentoDividendo } from "./financial.types"
import { supabase } from "@/lib/supabase"

interface FinancialContextType {
  state: FinancialState
  setState: React.Dispatch<React.SetStateAction<FinancialState>>
  adicionarInvestimento: (inv: Investimento) => Promise<void>
  removerInvestimento: (id: string) => Promise<void>
  adicionarDividendo: (div: LancamentoDividendo) => Promise<void>
  removerDividendo: (id: string) => Promise<void>
  setNumeroLiberdade: (valor: number) => void
  setPatrimonioAtual: (valor: number) => void
  setAporteMensal: (valor: number) => void
  setTaxaAnual: (valor: number) => void
  loadProfileFromSupabase: () => Promise<void>
}

const defaultState: FinancialState = {
  investimentos: [],
  dividendos: [],
  numeroLiberdade: 5000,
  patrimonioAtual: 0,
  aporteMensal: 1000,
  taxaAnual: 8,
  moeda: "BRL",
  profile: undefined, //
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FinancialState>(defaultState)

  const loadInvestimentos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("investimentos").select("*").eq("user_id", user.id)
      if (data) {
        setState(prev => ({
          ...prev,
          investimentos: data.map(inv => ({
            id: inv.id,
            nome: inv.nome,
            valor: Number(inv.valor),
            categoria: inv.categoria,
            taxaAnual: Number(inv.taxa_anual),
            tipoRendimento: inv.tipo_rendimento,
            dataAporte: inv.data_aporte,
          }))
        }))
      }
    } catch (err) { console.error(err) }
  }

  const loadDividendos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("dividendos").select("*").eq("user_id", user.id)
      if (data) {
        setState(prev => ({
          ...prev,
          dividendos: data.map(div => ({
            id: div.id,
            investimentoId: div.investimento_id,
            investimentoNome: div.investimento_nome,
            valor: Number(div.valor),
            data: div.data || div.data_referencia, // Tenta pegar de qualquer um dos campos
            mes: (div.data || div.data_referencia || "").slice(0, 7),
          }))
        }))
      }
    } catch (err) { console.error(err) }
  }

  const adicionarInvestimento = async (inv: Investimento) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("investimentos").insert({
        user_id: user.id,
        nome: inv.nome,
        valor: inv.valor,
        categoria: inv.categoria,
        taxa_anual: inv.taxaAnual,
        tipo_rendimento: inv.tipoRendimento,
        data_aporte: inv.dataAporte,
      }).select().maybeSingle()

      if (data) {
        setState(prev => ({
          ...prev,
          investimentos: [...prev.investimentos, {
            id: data.id,
            nome: data.nome,
            valor: Number(data.valor),
            categoria: data.categoria,
            taxaAnual: Number(data.taxa_anual),
            tipoRendimento: data.tipo_rendimento,
            dataAporte: data.data_aporte,
          }]
        }))
      }
    } catch (err) { console.error(err) }
  }

  const adicionarDividendo = async (div: LancamentoDividendo) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // CORREÇÃO DEFINITIVA: Incluindo 'data_referencia' para satisfazer o banco
      const { data, error } = await supabase.from("dividendos").insert({
        user_id: user.id,
        investimento_id: div.investimentoId,
        investimento_nome: div.investimentoNome,
        valor: div.valor,
        data: div.data,
        data_referencia: div.data, // Adicionado este campo exigido pelo seu Supabase
      }).select().maybeSingle()

      if (error) {
        console.error("Erro ao salvar dividendo:", error)
        return
      }

      if (data) {
        const novoDiv = {
          id: data.id,
          investimentoId: data.investimento_id,
          investimentoNome: data.investimento_nome,
          valor: Number(data.valor),
          data: data.data,
          mes: data.data.slice(0, 7),
        }
        setState(prev => ({
          ...prev,
          dividendos: [...prev.dividendos, novoDiv]
        }))
      }
    } catch (err) { console.error(err) }
  }

  const removerInvestimento = async (id: string) => {
    await supabase.from("investimentos").delete().eq("id", id)
    setState(prev => ({ ...prev, investimentos: prev.investimentos.filter(i => i.id !== id) }))
  }

  const removerDividendo = async (id: string) => {
    await supabase.from("dividendos").delete().eq("id", id)
    setState(prev => ({ ...prev, dividendos: prev.dividendos.filter(d => d.id !== id) }))
  }

  const loadProfileFromSupabase = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
    if (profile) {
      setState(prev => ({
        ...prev,
        profile: profile,
        numeroLiberdade: profile.monthly_income_goal || prev.numeroLiberdade,
        patrimonioAtual: profile.current_patrimony || prev.patrimonioAtual,
        aporteMensal: profile.monthly_contribution || prev.aporteMensal,
        taxaAnual: profile.expected_return_rate || prev.taxaAnual,
      }))
    }
  }, [])

  useEffect(() => {
    loadInvestimentos(); loadDividendos(); loadProfileFromSupabase();
  }, [loadProfileFromSupabase])

  return (
    <FinancialContext.Provider value={{
      state, setState, adicionarInvestimento, removerInvestimento,
      adicionarDividendo, removerDividendo, setNumeroLiberdade: (v) => setState(p => ({ ...p, numeroLiberdade: v })),
      setPatrimonioAtual: (v) => setState(p => ({ ...p, patrimonioAtual: v })),
      setAporteMensal: (v) => setState(p => ({ ...p, aporteMensal: v })),
      setTaxaAnual: (v) => setState(p => ({ ...p, taxaAnual: v })),
      loadProfileFromSupabase
    }}>
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinancial() {
  const context = useContext(FinancialContext)
  if (!context) throw new Error("useFinancial must be used within FinancialProvider")
  return context
}
