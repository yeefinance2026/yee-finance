import { FinancialState } from "./financial.types"

const KEY = "evy_v1_state"

export function loadState(): FinancialState | null {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveState(state: FinancialState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}
