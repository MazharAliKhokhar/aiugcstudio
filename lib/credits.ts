export const DURATION_CREDIT_COSTS: Record<number, number> = {
  15: 1,
  30: 2,
  60: 4
}

export function getCreditCost(duration: number): number {
  return DURATION_CREDIT_COSTS[duration] || 1
}
