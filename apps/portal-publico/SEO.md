# SEO & Landing Pages — Portal Público

Este documento descreve o que foi implementado para melhorar o ranqueamento do site público (portal-publico), como as landing pages funcionam, o sitemap e as verificações necessárias (RLS / indexabilidade). Também traz instruções de como adicionar novas landing pages e como testar no ambiente local / produção.

Resumo das alterações aplicadas
- Criado um endpoint de landing pages amigáveis por cidade/segmento: `app/empreendimentos/[landing]/page.tsx`.
  - Ex.: `/empreendimentos/apartamentos-em-lancamento-florianopolis-sc` irá procurar por `cidade=Florianópolis` e `estado=SC` e renderizar uma listagem server-side.
  - `generateMetadata` no arquivo monta title/description e alternates (canonical) usando os valores da cidade.
- Sitemap (`app/sitemap.ts`) atualizado para incluir:
  - a home `/`;
  - páginas de detalhe de empreendimento (já existentes com `buildEmpreendimentoPath`);
  - páginas de landing por cidade/estado (até 50 cidades distintas) — geradas dinamicamente consultando `public_empreendimentos`.
- Pequenas melhorias no `app/(site)/page.tsx`:
  - limpeza de parâmetros vazios no formulário de busca para evitar URLs com `q=&precoMax=`.

Por que isso ajuda o Google a indexar melhor
- URLs amigáveis (path-based) são mais legíveis e, com meta/JSON-LD server-side, o Google indexa o conteúdo filtrado corretamente.
- Sitemap com landing pages ajuda o Google a descobrir e priorizar essas páginas.
- Server-side rendering (SSR) garante que o crawler receba HTML completo (sem depender de JS client-side para preencher a lista), o que melhora indexação e velocidade.

Como as landing pages funcionam tecnicamente
1. A rota dinâmica `empreendimentos/[landing]` recebe um segmento como `apartamentos-em-lancamento-florianopolis-sc`.
2. Ela extrai o `citySlug` e `stateSlug` (os dois últimos pedaços do slug) e busca uma combinação de `cidade`/`estado` em `public_empreendimentos`.
3. Se encontrar correspondência, faz um SELECT de empreendimentos filtrando por `cidade` e `estado` e retorna HTML com a lista e metadata (title, description, openGraph, canonical).
4. Se não encontrar, retorna 404 (via `notFound()`).

Recomendações e próximos passos (rápido checklist)
- Permissões (RLS):
  - Verifique que a role anônima (anon) do Supabase tem permissão de SELECT nas tabelas usadas (`public_empreendimentos`, `galeria_fotos`, `tipologias`, `valores`, `incorporadoras`, etc.). Se RLS bloquear leitura, crawlers e usuários anônimos não verão conteúdo.
  - Teste no SQL editor (role admin) e com a anon key via um fetch simples:
    - `fetch('https://<supabase>.supabase.co/rest/v1/public_empreendimentos', { headers: { apikey: NEXT_PUBLIC_SUPABASE_ANON_KEY } })`

- Sitemap e Search Console:
  - Depois de publicar em produção, adicione a URL do sitemap (`https://<site>/sitemap.xml`) ao Google Search Console para indexação mais rápida.

- Canonical + evitar excesso de páginas:
  - Defina `rel="canonical"` em páginas que têm múltiplas variações (por exemplo, filtros via query). Prefira indexar apenas landing pages importantes (cidades, segmentos).

- Performance e escopo:
  - Se houver muitas cidades, gere apenas as landing pages prioritárias (top cidades). A implementação atual limita a 50 cidades no sitemap.
  - Para volumes maiores, considere materializar a view ou gerar sitemaps por lote.

Como adicionar uma nova landing manualmente (opção)
- Criar um `suggestion` entry (se você mantém um mecanismo de sugestões) ou simplesmente garantir que existam empreendimentos com `cidade`/`estado` correspondentes. A rota dinâmica tenta localizar a cidade/estado a partir do slug.

Como testar localmente (passos)
1. Inicie o app Next (`apps/portal-publico`) no modo dev: `cd apps/portal-publico && npm run dev`.
2. Acesse uma landing conhecida que exista no DB, por exemplo: `/empreendimentos/${buildEmpreendimentoPath(umEmpreendimento)}` (ou `/empreendimentos/<city-landing-slug>`).
3. Verifique (inspecione o HTML) que o title/meta e a lista vêm do servidor (não preenchidos depois por JS).
4. Acesse `/sitemap.xml` (Next gera automaticamente em runtime) e confirme que as entradas de landing e empreendimentos aparecem.

Notas finais
- A estratégia aplicada prioriza páginas de alto valor (landing por cidade/segmento) com SSR, metadata e sitemap para facilitar descoberta e indexação.
- Se quiser, eu posso:
  1. Criar views agregadas (vw_empreendimentos_full) que consolidem `galeria`, `tipologias`, `valores`, `documentos` e `caracteristicas` para simplificar fetchs no Next (recomendado para páginas detalhe). (Posso gerar o SQL.)
  2. Gerar/actualizar `robots.txt` (se quiser bloquear indexação de parâmetros de pesquisa internos).
  3. Implementar rotas estáticas/SSG para as top N landing pages para melhor performance/SEO.

Se concordar, eu prossigo com uma das opções acima — diga qual prefere: criar a view SQL + ajustar as queries do Next, ou somente gerar SSG para top landing pages.
# SEO & URL Conventions (Portal Público)

Este arquivo descreve como geramos URLs amigáveis para SEO e como adicionar sugestões regionais (cards) usadas nas páginas públicas.

## Objetivo


Gerar URLs que descrevam tipo, status, cidade e estado, por exemplo:

```
https://myside.com.br/apartamentos-prontos-para-morar-venda-itapema-sc/nome-do-empreendimento--<id>
```

Isso melhora CTR e indexação por palavras-chave (ex.: "apartamentos prontos para morar Itapema SC").

## Onde o código vive

- `apps/portal-publico/lib/urls/index.ts` — funções: `slugifyValue`, `buildCityStateSegment`, `buildEmpreendimentoPath`, `parseEmpreendimentoParam`.
- `apps/portal-publico/lib/suggestions.ts` — seed de sugestões e helpers para gerar cards.

## Regras de construção de slug

- Tipo: usa `empreendimento.tipo` quando disponível (ex: 'apartamentos').
- Qualificadores: adiciona `prontos-para-morar`, `em-lancamento` ou `em-obra` com base em `empreendimento.status`.
- Bairro: quando presente, adiciona o bairro ao final do segmento principal.
- Exemplo final: `apartamentos-prontos-para-morar-meia-praia-itapema-sc`.

## Como adicionar/editar sugestões regionais

1. Abra `apps/portal-publico/lib/suggestions.ts`.
2. Edite o array `SEEDS` adicionando a cidade/estado, as frases que quer expor e uma imagem (opcional).
3. No componente de UI que exibe sugestões (ex: `components/SuggestionsCardList`), chame `getSeededSuggestions()` ou `suggestionsForCity(city)`.

## SEO Notes

- Garanta `canonical` e `openGraph` corretos usando `buildEmpreendimentoPath` no `generateMetadata` das páginas de empreendimento.
- Use JSON-LD com `RealEstateListing` e `Offer` para produtos com preço.

## Testes rápidos

No console Node (ou um small script) você pode executar:

```js
const { getSeededSuggestions } = require('./lib/suggestions');
console.log(getSeededSuggestions().slice(0,5));
```

## Próximos passos

- Integrar `suggestionsForCity` em uma rota API `/api/suggestions?city=Itapema` para consumo AJAX.
- Criar componentes de UI (cards) e endpoints de sitemap para estas landing pages.
