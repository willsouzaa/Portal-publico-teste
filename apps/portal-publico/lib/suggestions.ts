import { slugifyValue } from "./urls";
import type { PublicEmpreendimento } from "./types";

export type SuggestionCard = {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  image?: string; // url to image (can be storage or public)
  region: { city: string; state: string };
};

// Seeded suggestions based on common searches. Keep this small and editable.
const SEEDS: Array<{ city: string; state: string; phrases: string[]; image?: string }> = [
  { city: "Itapema", state: "SC", phrases: ["Apartamentos à venda em Itapema", "Apartamentos prontos para morar em Itapema", "Apartamentos na planta em Itapema"], image: "/branding/san-remo-logo2.png" },
  { city: "Florianópolis", state: "SC", phrases: ["Apartamentos à venda em Florianópolis", "Apartamentos na planta em Florianópolis", "Apartamentos prontos para morar em Florianópolis"], image: "/branding/san-remo-logo2.png" },
  { city: "Goiânia", state: "GO", phrases: ["Apartamentos à venda em Goiânia", "Apartamentos na planta em Goiânia", "Apartamentos prontos para morar em Goiânia"], image: "/branding/san-remo-logo2.png" },
  { city: "Curitiba", state: "PR", phrases: ["Apartamentos à venda em Curitiba", "Apartamentos na planta em Curitiba", "Apartamentos prontos para morar em Curitiba"], image: "/branding/san-remo-logo2.png" },
  { city: "Balneário Camboriú", state: "SC", phrases: ["Apartamento à venda Balneário Camboriú", "Apartamentos prontos para morar em Balneário Camboriú"], image: "/branding/san-remo-logo2.png" },
  { city: "Belo Horizonte", state: "MG", phrases: ["Apartamentos à venda em Belo Horizonte", "Apartamentos na planta em Belo Horizonte", "Apartamentos à venda no Santo Agostinho"], image: "/branding/san-remo-logo2.png" }
];

export function buildSuggestionSlug(phrase: string, city: string, state: string) {
  // reuse slugify conventions but keep descriptive path
  const phraseSlug = slugifyValue(phrase);
  const citySlug = slugifyValue(city);
  const stateSlug = slugifyValue(state);
  return `${phraseSlug}-${citySlug}-${stateSlug}`;
}

export function getSeededSuggestions(): SuggestionCard[] {
  const cards: SuggestionCard[] = [];
  SEEDS.forEach((s) => {
    s.phrases.forEach((p, idx) => {
      cards.push({
        id: `${s.city}-${idx}`,
        title: p,
        subtitle: `${s.city}, ${s.state}`,
        slug: buildSuggestionSlug(p, s.city, s.state),
        image: s.image,
        region: { city: s.city, state: s.state }
      });
    });
  });
  return cards;
}

export function suggestionsForCity(city: string, state?: string, limit = 6): SuggestionCard[] {
  const all = getSeededSuggestions().filter((c) => c.region.city.toLowerCase() === city.toLowerCase() && (!state || c.region.state.toLowerCase() === state.toLowerCase()));
  return all.slice(0, limit);
}
