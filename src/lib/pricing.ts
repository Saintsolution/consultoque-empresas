// Pricing rules for CONSULTOQUE collective plans
// Individual: R$ 33 (R$ 30 from 10 enrollments total)
// Family: R$ 66 (R$ 60 from 10 enrollments total)
// Discount applies when the TOTAL number of enrollments reaches 10 or more,
// regardless of plan type (e.g. 4 individual + 6 family = 10 -> discount on both).

export const INDIVIDUAL_PRICE = 33;
export const INDIVIDUAL_PRICE_BULK = 30;
export const FAMILY_PRICE = 66;
export const FAMILY_PRICE_BULK = 60;
export const BULK_THRESHOLD = 10;

export type PlanType = 'individual' | 'familia';

export interface HolderEntry {
  id: string;
  plan: PlanType;
  name: string;
  cpf: string;
}

export function priceForPlan(plan: PlanType, total: number): number {
  if (total >= BULK_THRESHOLD) {
    return plan === 'individual' ? INDIVIDUAL_PRICE_BULK : FAMILY_PRICE_BULK;
  }
  return plan === 'individual' ? INDIVIDUAL_PRICE : FAMILY_PRICE;
}

export interface PriceBreakdown {
  individualCount: number;
  familyCount: number;
  total: number;
  individualUnit: number;
  familyUnit: number;
  individualSubtotal: number;
  familySubtotal: number;
  totalMonthly: number;
  hasBulkDiscount: boolean;
  savings: number;
}

export function calculatePrice(holders: HolderEntry[]): PriceBreakdown {
  const total = holders.length;
  const individualCount = holders.filter((h) => h.plan === 'individual').length;
  const familyCount = holders.filter((h) => h.plan === 'familia').length;

  const individualUnit = priceForPlan('individual', total);
  const familyUnit = priceForPlan('familia', total);

  const individualSubtotal = individualCount * individualUnit;
  const familySubtotal = familyCount * familyUnit;
  const totalMonthly = individualSubtotal + familySubtotal;

  const fullPrice = individualCount * INDIVIDUAL_PRICE + familyCount * FAMILY_PRICE;
  const savings = Math.max(0, fullPrice - totalMonthly);

  return {
    individualCount,
    familyCount,
    total,
    individualUnit,
    familyUnit,
    individualSubtotal,
    familySubtotal,
    totalMonthly,
    hasBulkDiscount: total >= BULK_THRESHOLD,
    savings,
  };
}

// CPF / CNPJ formatting helpers (display only)
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

// Lightweight validators (format-based, not real CPF math)
export function isValidCPF(value: string): boolean {
  const d = onlyDigits(value);
  return d.length === 11;
}

export function isValidCNPJ(value: string): boolean {
  const d = onlyDigits(value);
  return d.length === 14;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
