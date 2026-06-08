import lampImg from "@/assets/sku-lamp.jpg";
import throwImg from "@/assets/sku-throw.jpg";
import mirrorImg from "@/assets/sku-mirror.jpg";
import platesImg from "@/assets/sku-plates.jpg";
import chairImg from "@/assets/sku-chair.jpg";
import booksImg from "@/assets/sku-books.jpg";

export type Category =
  | "Lighting"
  | "Textiles"
  | "Decor"
  | "Housewares"
  | "Furniture"
  | "Books & Media";

export type Condition = "Like New" | "Lightly Used" | "Vintage";

export interface Sku {
  id: string;
  name: string;
  category: Category;
  condition: Condition;
  unitsPerPallet: number;
  pricePerUnit: number;
  retailPerUnit: number;
  image: string;
  blurb: string;
}

export const CATALOG: Sku[] = [
  {
    id: "CB-LMP-204",
    name: "Brass Accent Lamps",
    category: "Lighting",
    condition: "Like New",
    unitsPerPallet: 48,
    pricePerUnit: 9,
    retailPerUnit: 39,
    image: lampImg,
    blurb: "Returned designer table lamps. Mixed brass and bronze finishes.",
  },
  {
    id: "CB-TXT-118",
    name: "Wool Throw Blankets",
    category: "Textiles",
    condition: "Like New",
    unitsPerPallet: 120,
    pricePerUnit: 6,
    retailPerUnit: 32,
    image: throwImg,
    blurb: "Overstock throws in natural fiber. Cream, rust, sage colorways.",
  },
  {
    id: "CB-DEC-501",
    name: "Round Brass Mirrors",
    category: "Decor",
    condition: "Lightly Used",
    unitsPerPallet: 36,
    pricePerUnit: 12,
    retailPerUnit: 58,
    image: mirrorImg,
    blurb: "Floor model wall mirrors. Minor scuffs on backplate, glass perfect.",
  },
  {
    id: "CB-HW-330",
    name: "Stoneware Dinner Sets",
    category: "Housewares",
    condition: "Like New",
    unitsPerPallet: 60,
    pricePerUnit: 14,
    retailPerUnit: 64,
    image: platesImg,
    blurb: "4-piece stoneware sets in sage and cream. Boxed, sealed.",
  },
  {
    id: "CB-FRN-220",
    name: "Rattan Accent Chairs",
    category: "Furniture",
    condition: "Vintage",
    unitsPerPallet: 12,
    pricePerUnit: 28,
    retailPerUnit: 149,
    image: chairImg,
    blurb: "Mixed-era rattan and woven seating. Light wear, structurally sound.",
  },
  {
    id: "CB-BKS-014",
    name: "Hardcover Coffee Table Books",
    category: "Books & Media",
    condition: "Lightly Used",
    unitsPerPallet: 200,
    pricePerUnit: 2,
    retailPerUnit: 28,
    image: booksImg,
    blurb: "Curated lifestyle, art, and design titles. Average 2 lbs per book.",
  },
];

export const CATEGORIES: Category[] = [
  "Lighting",
  "Textiles",
  "Decor",
  "Housewares",
  "Furniture",
  "Books & Media",
];

export const CONDITIONS: Condition[] = ["Like New", "Lightly Used", "Vintage"];

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
