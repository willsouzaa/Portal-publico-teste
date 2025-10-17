# 🏢 Portal Público San Remo# Portal Público San Remo



Aplicação Next.js que expõe o catálogo público de empreendimentos da San Remo.Aplicação Next.js que expõe o catálogo público de empreendimentos da San Remo com design moderno, SEO otimizado e funcionalidades completas de captação de leads.



## 🚀 Setup Rápido (3 passos)## ✨ Funcionalidades



### 1️⃣ Configurar Banco de Dados- 🏗️ **Catálogo de Empreendimentos**: Listagem com filtros avançados de busca

- 🎨 **Design System San Remo**: Interface consistente com cores e branding corporativo

Execute este arquivo no **Supabase Dashboard > SQL Editor**:- 🔍 **SEO Otimizado**: Meta tags, Open Graph, JSON-LD e sitemap automático

- 📱 **PWA**: Suporte a Progressive Web App para instalação mobile

📁 `supabase/migrations/PORTAL_PUBLICO_SETUP.sql`- 📊 **Analytics**: Integração com Google Analytics e Meta Pixel (Facebook)

- 📧 **Captação de Leads**: Formulários de contato integrados ao Supabase

Este script configura automaticamente:- 🖼️ **Galeria de Imagens**: Visualização otimizada com Next.js Image

- ✅ Colunas necessárias (is_aprovado, destaque, etc.)- ⚡ **Performance**: SSR e otimizações automáticas do Next.js 14

- ✅ VIEW pública (somente leitura)

- ✅ RLS policies (segurança)## 🚀 Requisitos

- ✅ Tabela de leads

- ✅ Índices de performance- Node.js 18 ou 20

- Variáveis de ambiente (ver `.env.example`)

### 2️⃣ Aprovar Empreendimentos

## 📦 Instalação

Marque quais empreendimentos serão exibidos:

```bash

```sqlnpm install

-- Aprovar TODOS```

UPDATE empreendimentos SET is_aprovado = true;

## ⚙️ Configuração

-- OU aprovar seletivamente

UPDATE empreendimentos SET is_aprovado = true WHERE status = 'lancamento';Crie um arquivo `.env.local` baseado no `.env.example`:

```

```bash

### 3️⃣ Configurar `.env.local`# Supabase

SUPABASE_URL=sua-url-supabase

```bashSUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

SUPABASE_URL=https://aknihkmyjayxbntssbow.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...# Site

NEXT_PUBLIC_SITE_URL=http://localhost:3001NEXT_PUBLIC_SITE_URL=https://www.sanremo.com.br

```

# Analytics (Opcional)

**Pronto!** Rode `npm run dev` e acesse http://localhost:3001NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

NEXT_PUBLIC_META_PIXEL_ID=123456789

## 🔐 Segurança (IMPORTANTE)```



### Por que ANON KEY?## 🏃 Como rodar



Portal público usa **ANON_KEY** (não SERVICE_ROLE) por segurança:### Desenvolvimento

```bash

- ✅ **ANON KEY**: Acesso controlado por RLS policiesnpm run dev

- ❌ **SERVICE_ROLE**: Acesso total ao banco (inseguro em frontend)```



### Como funciona?A aplicação ficará disponível em `http://localhost:3000`.



```### Produção

Frontend (ANON KEY)```bash

    ↓npm run build

Supabase RLSnpm start

    ↓```

VIEW public_empreendimentos

    ↓## 📁 Estrutura

Apenas empreendimentos aprovados

``````

apps/portal-publico/

## 📦 Instalação e Uso├── app/

│   ├── api/leads/          # API route para salvar leads

```bash│   ├── components/         # Componentes do layout (Header, Footer)

# Instalar dependências│   ├── empreendimentos/    # Páginas dinâmicas [slugId]

npm install│   ├── layout.tsx          # Layout principal com Analytics

│   ├── page.tsx            # Homepage com listagem

# Desenvolvimento│   └── globals.css         # Estilos globais com design system

npm run dev          # http://localhost:3000├── components/

│   ├── ui/                 # Componentes base (Button, Card, Input)

# Produção│   ├── Analytics.tsx       # Google Analytics

npm run build│   ├── MetaPixel.tsx       # Facebook Pixel

npm run start│   ├── EmpreendimentoCard.tsx

│   ├── EmpreendimentoFilters.tsx

# Linting│   ├── EmpreendimentoList.tsx

npm run lint│   ├── ImageGallery.tsx

```│   └── LeadForm.tsx

├── lib/

## ✨ Funcionalidades│   ├── supabase/          # Cliente Supabase server-side

│   ├── seo.ts             # Helpers para metadados

- ✅ Listagem de empreendimentos com filtros│   ├── types.ts           # TypeScript types

- ✅ Página de detalhes com galeria│   ├── urls.ts            # Geração de URLs/slugs

- ✅ Busca por cidade, tipo, preço, status│   └── utils.ts           # Utilitários gerais

- ✅ Formulário de captação de leads└── public/

- ✅ SEO otimizado (SSR, meta tags, sitemap)    ├── manifest.json      # PWA manifest

- ✅ Analytics (GA4 + Meta Pixel)    └── san-remo-logo.png  # Logo e assets

- ✅ PWA instalável```

- ✅ Design System San Remo

## 🎨 Design System

## 📁 Estrutura

O projeto utiliza o mesmo design system do dashboard interno:

```

app/- **Cores Principais**:

├── page.tsx                    # Homepage  - Primary (Navy): `hsl(214 100% 18%)`

├── empreendimentos/[slugId]/   # Detalhes  - Secondary (Gold): `hsl(28 85% 55%)`

├── api/leads/                  # API de leads  

└── components/                 # Header, Footer- **Componentes**: shadcn/ui com Radix UI

- **Tipografia**: Inter

components/- **Ícones**: Lucide React

├── ui/                         # Button, Card, Input

├── EmpreendimentoCard.tsx## 📊 Analytics e Tracking

├── EmpreendimentoFilters.tsx

├── ImageGallery.tsx### Google Analytics

├── LeadForm.tsxRastreamento automático de page views. Para eventos customizados:

├── Analytics.tsx

└── MetaPixel.tsx```tsx

```import { trackEvent } from '@/components/Analytics'

trackEvent('custom_event', { param: 'value' })

## 🐛 Troubleshooting```



### ❌ "Missing Supabase environment variables"### Meta Pixel

Eventos pré-configurados disponíveis:

- Verifique `.env.local`

- Confirme `SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY````tsx

- Reinicie o servidorimport { events } from '@/components/MetaPixel'



### ❌ Nenhum empreendimento apareceevents.viewContent({ content_name: 'Empreendimento X' })

events.lead({ content_name: 'Formulário Y' })

```sqlevents.contact()

-- 1. Execute o setupevents.search('apartamento')

-- supabase/migrations/PORTAL_PUBLICO_SETUP.sql```



-- 2. Aprove empreendimentos## 📱 PWA

UPDATE empreendimentos SET is_aprovado = true;

O aplicativo pode ser instalado em dispositivos móveis. Para configurar:

-- 3. Verifique a view

SELECT * FROM public_empreendimentos;1. Adicionar ícones em `/public/icon-192.png` e `/public/icon-512.png`

```2. Customizar `manifest.json` conforme necessário

3. Build e deploy em HTTPS

### ❌ Erro de permissão RLS

## 🗄️ Banco de Dados

- Execute `PORTAL_PUBLICO_SETUP.sql`

- Verifique policies no Supabase Dashboard > Authentication > Policies### Tabelas Necessárias



## 📊 Analytics (Opcional)#### `public_empreendimentos` (View)

Deve expor dados públicos dos empreendimentos.

Configure no `.env.local`:

#### `leads` (Table)

```bash```sql

NEXT_PUBLIC_GA_ID=G-XXXXXXXXXXCREATE TABLE leads (

NEXT_PUBLIC_META_PIXEL_ID=123456789  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

```  nome TEXT NOT NULL,

  email TEXT NOT NULL,

## 📚 Documentação  telefone TEXT NOT NULL,

  mensagem TEXT,

- [IMPLEMENTACOES.md](./IMPLEMENTACOES.md) - Todas as features implementadas  empreendimento_id UUID NOT NULL,

- [Next.js](https://nextjs.org/docs)  empreendimento_nome TEXT NOT NULL,

- [Supabase](https://supabase.com/docs)  origem TEXT DEFAULT 'portal_publico',

  status TEXT DEFAULT 'novo',

## 🎯 Próximos Passos  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

- [ ] Página "Sobre Nós"```
  ```powershell
  npm run dev
  ```

## SEO and Landing Pages

This app now includes richer SEO-friendly landing slugs and seeded suggestions.
- See `SEO.md` for slug conventions and how to add region suggestions.

- [ ] Sistema de favoritos## 🔒 Segurança

- [ ] Comparação de empreendimentos

- [ ] Tour virtual 360°- Utiliza **service role** do Supabase apenas no servidor

- [ ] Chat WhatsApp- RLS policies configuradas para acesso público apenas a dados aprovados

- Validação de entrada em formulários

---- Sanitização de dados



**Desenvolvido com ❤️ para San Remo**## 🚢 Deploy


### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Outras plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js 14+.

## 📝 Próximas Melhorias

- [ ] Sistema de blog/notícias para SEO
- [ ] Testes E2E com Playwright
- [ ] Otimização de imagens com blur placeholder
- [ ] Sistema de favoritos (localStorage)
- [ ] Compartilhamento social
- [ ] Página "Sobre" e "Contato"
- [ ] Integração com CRM para leads
- [ ] Notificações push (PWA)

## 📄 Licença

Propriedade da San Remo. Todos os direitos reservados.
