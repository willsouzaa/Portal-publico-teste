"use client";

import { useEffect, useState } from 'react';

type Review = {
  author_name?: string;
  rating?: number;
  text?: string;
  time?: number;
  relative_time_description?: string;
};

export default function GoogleReviews() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  // Request only 5-star reviews by default
  const res = await fetch('/api/google-reviews?stars=5');
        if (!res.ok) {
          const t = await res.text().catch(() => '');
          if (!mounted) return;
          setError('Erro ao buscar avaliações');
          setLoading(false);
          console.error('google-reviews fetch failed', res.status, t);
          return;
        }
        const j = await res.json();
        if (!mounted) return;
        if (!j.success) {
          setError(j.error || 'Erro ao buscar avaliações');
        } else {
          setRating(j.rating ?? null);
          setTotal(j.user_ratings_total ?? null);
          setReviews(Array.isArray(j.reviews) ? j.reviews.slice(0, 3) : []);
        }
      } catch (err) {
        if (!mounted) return;
        setError('Erro interno');
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="container py-6">Carregando avaliações...</div>;
  if (error) return <div className="container py-6 text-sm text-red-600">{error}</div>;

  return (
    <section className="container py-8" aria-label="Avaliações Google">
      <div className="rounded-2xl border p-6 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold">{rating ? rating.toFixed(1) : '-'}</div>
          <div>
            <div className="text-sm text-slate-600">Avaliação média no Google</div>
            <div className="text-xs text-slate-500">{total ?? 0} avaliações</div>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          {reviews.length === 0 && <div className="text-sm text-slate-500">Sem avaliações públicas</div>}
          {reviews.map((r, i) => (
            <blockquote key={i} className="border-l-2 pl-4"> 
              <div className="flex items-center justify-between">
                <strong className="text-sm">{r.author_name || 'Anônimo'}</strong>
                <span className="text-xs text-slate-500">{r.rating ?? '-'} ★</span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{r.text}</p>
              <div className="mt-1 text-xs text-slate-400">{r.relative_time_description ?? ''}</div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
