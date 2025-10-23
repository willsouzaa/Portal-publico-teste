"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import SectionTitle from '@/components/typography/SectionTitle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Emp = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  bairro?: string | null;
  destaque?: string | null;
  descricao?: string | null;
  preco_minimo?: number | null;
  status?: string | null;
  is_oportunidade?: boolean | null;
  imagem_capa?: string | null;
  _norm_nome?: string;
  _norm_cidade?: string;
  _norm_bairro?: string;
  _norm_destaque?: string;
  _norm_descricao?: string;
};

function normalizeString(value?: string | null): string {
  if (!value) return "";
  try {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  } catch (e) {
    // Fallback if Unicode property escapes are not supported
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }
}

export default function SearchCard() {
  const [data, setData] = useState<Emp[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Emp[]>([]);
  const [precoMin, setPrecoMin] = useState<number | ''>('');
  const [precoMax, setPrecoMax] = useState<number | ''>('');
  const [status, setStatus] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/empreendimentos/list')
      .then((res) => res.json())
        .then((json) => {
          if (!mounted) return;
          const list = (json.data ?? []).map((emp: any) => ({
            ...emp,
            _norm_nome: normalizeString(emp.nome),
            _norm_cidade: normalizeString(emp.cidade),
            _norm_bairro: normalizeString(emp.bairro),
            _norm_destaque: normalizeString(emp.destaque),
            _norm_descricao: normalizeString(emp.descricao)
          }));
          setData(list);
          setLoading(false);
        })
      .catch(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: [
        { name: '_norm_nome', weight: 0.8 },
        { name: '_norm_cidade', weight: 0.6 },
        { name: '_norm_bairro', weight: 0.5 },
        { name: '_norm_destaque', weight: 0.4 },
        { name: '_norm_descricao', weight: 0.3 }
      ],
      threshold: 0.4,
      ignoreLocation: true,
      useExtendedSearch: true
    });
  }, [data]);

  useEffect(() => {
    const q = query?.trim();
    if (!q) {
      // do not show suggestions when input is empty
      setResults([]);
      return;
    }

    // Build a search that supports words in any order and exact tokens
    const tokensRaw = query
      .trim()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

    // normalize tokens (strip accents and lowercase) so 'sao jose' matches 'São José'
    const tokens = tokensRaw.map((t) => `'${normalizeString(t)}`);
    const searchString = tokens.join(' ');
    const fuseRes = fuse.search(searchString, { limit: 200 }).map((r) => r.item);

    // Apply price and status filters
    const filtered = fuseRes.filter((item) => {
      const preco = item.preco_minimo != null ? Number(item.preco_minimo) : null;
      if (precoMin !== '' && (preco === null || preco < Number(precoMin))) return false;
      if (precoMax !== '' && (preco === null || preco > Number(precoMax))) return false;
      if (status && item.status !== status) return false;
      return true;
    });

    setResults(filtered.slice(0, 5));
  }, [query, fuse, data, precoMin, precoMax, status]);

  const router = useRouter();

  function handleSelect(item: Emp) {
    const params = new URLSearchParams();
    // Prefer the typed query but also include the empreendimento name for precision
    if (query && query.trim().length) params.set('q', query.trim());
    if (item.nome) params.set('q', item.nome);
    if (item.cidade) params.set('cidade', item.cidade);
    if (item.estado) params.set('estado', item.estado);
    if (item.bairro) params.set('bairro', String(item.bairro));
    if (precoMin !== '') params.set('precoMin', String(precoMin));
    if (precoMax !== '') params.set('precoMax', String(precoMax));
    if (status) params.set('status', status);

    router.push(`/empreendimentos?${params.toString()}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      }
      return;
    }

    if (e.key === 'Escape') {
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }
  }

  return (
    <div className="container">
      <div className="bg-primary/95 text-white rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2">
          <SectionTitle className="!text-white">Encontre seu próximo imóvel em segundos</SectionTitle>
          <p className="text-white/90 mt-2">Buscas inteligentes, resultados reais — sem ruído, sem anúncios falsos.</p>
          <ul className="mt-3 text-white/90 list-disc list-inside text-sm">
            <li>Filtramos lançamentos, obras e prontos para morar com precisão.</li>
            <li>Resultados por bairro, cidade e características que importam.</li>
            <li>Somente ofertas verificadas — mais transparência pra você.</li>
          </ul>
          <p className="mt-3 font-semibold">Onde quer viver? Digite bairro, cidade ou palavra-chave.</p>
        </div>

  <div className="flex flex-col gap-2 relative">
          <Input
            ref={inputRef}
            placeholder="Digite bairro, cidade ou palavra-chave"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className="w-full text-black"
          />

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setQuery(''); setResults([]); }}>Limpar</Button>
            <Button onClick={() => { /* noop - results update as you type */ }}>Buscar</Button>
          </div>

          {/* Dropdown suggestions */}
          {results.length > 0 && (
            <ul
              role="listbox"
              aria-label="Sugestões de empreendimentos"
              aria-activedescendant={activeIndex >= 0 ? `suggestion-${results[activeIndex].id}` : undefined}
              className="absolute left-0 right-0 top-full mt-2 z-50 max-h-80 overflow-auto rounded-md border bg-white shadow-lg"
              style={{ marginTop: 6 }}
            >
              {results.map((r, idx) => (
                <li
                  key={r.id}
                  id={`suggestion-${r.id}`}
                  role="option"
                  aria-selected={activeIndex === idx}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(r)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${activeIndex === idx ? 'bg-primary/5' : 'hover:bg-primary/5'}`}
                  >
                    {r.imagem_capa ? (
                      <img src={r.imagem_capa} alt={r.nome} className="w-16 h-10 object-cover rounded-md flex-none" />
                    ) : (
                      <div className="w-16 h-10 bg-slate-100 rounded-md flex-none" />
                    )}

                    <div className="flex-1">
                      <div className="text-sm font-semibold text-primary-700">{r.nome}</div>
                      <div className="text-xs text-slate-500">{r.bairro ? `${r.bairro} · ` : ''}{r.cidade} - {r.estado}</div>
                    </div>

                    <div className="text-sm text-slate-600">{r.preco_minimo != null ? `R$ ${Number(r.preco_minimo).toLocaleString('pt-BR')}` : ''}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
    </div>
  );
}
