export interface Sku {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  price: number;
  msrp: number;
  units: number;
  lastUpdated: string;
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 100 ? 2 : 0,
  }).format(n);
}

export function computeSalePrice(cost: number): number {
  return cost;
}

