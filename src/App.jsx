import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from './api.js';
import { useLocalStorage } from './hooks.js';

// Componentes internos de la UI para evitar errores de carga
const MediaCard = ({ result, accent, t }) => (
    <div className="grid md:grid-cols-12 gap-12 items-center text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 bg-slate-950/40 p-8 rounded-[3rem] border border-slate-800/50 shadow-2xl">
        <div className="md:col-span-5 relative group">
            <div className={`absolute -inset-4 bg-[${accent.from}] rounded-[3.5rem] blur-2xl opacity-10`} />
            <img src={`https://image.tmdb.org/t/p/w780${result.poster_path}`} className="relative rounded-[3rem] shadow-2xl border border-white/5 w-full aspect-[2/3] object-cover" alt="poster" />
        </div>
        <div className="md:col-span-7">
            <div className="flex items-center gap-3 mb-6 text-sm font-black tracking-widest text-slate-500 uppercase">
                <span className="text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl">★ {result.vote_average?.toFixed(1)}</span>
                <span className="border border-slate-800 px-3 py-1.5 rounded-xl">{result.release_date?.split('-')[0] || result.first_air_date?.split('-')[0]}</span>
            </div>
            <h3 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase break-words">
                {result.title || result.name}
            </h3>
            <p className="text-slate-400 text-xl leading-relaxed mb-12 font-medium line-clamp-6">{result.overview}</p>
            <div className="flex flex-wrap gap-4">
                <button className="px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 uppercase">
                    {t.trailer}
                </button>
            </div>
        </div>
    </div>
);

export default function App() {
    const [mediaType, setMediaType] = useLocalStorage('sd_type', 'movie');
    const [accent, setAccent] = useState({ name: 'Indigo', from: '#6366f1' });
    const [language, setLanguage] = useState('es');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const t = {
        es: { title: "¿No sabes qué ver?", movies: "Películas", series: "Series", roll: "Lanzar Dado", trailer: "Ver Tráiler", searching: "Buscando..." },
        en: { title: "Don't know what to watch?", movies: "Movies", series: "Series", roll: "Roll the Dice", trailer: "Watch Trailer", searching: "Searching..." }
    }[language];

    const rollDice = async () => {
        setLoading(true);
        setResult(null);
        try {
            const params = {
                language: language === 'es' ? 'es-ES' : 'en-US',
                watch_region: 'ES',
                page: Math.floor(Math.random() * 5) + 1,
                with_watch_monetization_types: 'flatrate'
            };
            const data = await api.discoverMedia(mediaType, params);
            if (data.results?.length > 0) {
                const pick = data.results[Math.floor(Math.random() * data.results.length)];
                const details = await api.getFullDetails(mediaType, pick.id, language);
                setResult(details);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 pb-20">
            {/* Header StreamDice */}
            <nav className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">
                <div className="text-2xl font-black tracking-tighter italic uppercase text-white">
                    Stream<span className="text-indigo-500">Dice</span>
                </div>
                <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
                    <button onClick={() => setMediaType('movie')} className={`px-5 py-2 rounded-xl text-xs font-black ${mediaType === 'movie' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>{t.movies.toUpperCase()}</button>
                    <button onClick={() => setMediaType('tv')} className={`px-5 py-2 rounded-xl text-xs font-black ${mediaType === 'tv' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>{t.series.toUpperCase()}</button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-20 text-center">
                <div className="mb-24">
                    <h2 className="text-6xl md:text-9xl font-black text-white tracking-tightest leading-[0.85] mb-12 uppercase">
                        {t.title.split('?')[0]}<span className="text-indigo-500">?</span>
                    </h2>
                    
                    <button 
                        onClick={rollDice} 
                        disabled={loading}
                        className="bg-white text-black px-14 py-8 rounded-[2.5rem] font-black text-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
                    >
                        {loading ? t.searching.toUpperCase() : `🎲 ${t.roll.toUpperCase()}`}
                    </button>
                </div>

                {result && <MediaCard result={result} accent={accent} t={t} />}
            </main>
        </div>
    );
}