import React, { useState } from 'react';
import { api } from './api.js';
import { useLocalStorage } from './hooks.js';

export default function App() {
    const [mediaType, setMediaType] = useLocalStorage('mp_type', 'movie');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const rollDice = async () => {
        setLoading(true);
        try {
            const params = {
                watch_region: 'US',
                page: Math.floor(Math.random() * 10) + 1,
            };
            const data = await api.discoverMedia(mediaType, params);
            if (data.results?.length > 0) {
                const pick = data.results[Math.floor(Math.random() * data.results.length)];
                const details = await api.getFullDetails(mediaType, pick.id);
                setResult(details);
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/40">
            <nav className="flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
                <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                    MOVIE<span className="text-indigo-500">PICKER</span>
                </h1>
                <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
                    <button onClick={() => setMediaType('movie')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mediaType === 'movie' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>MOVIES</button>
                    <button onClick={() => setMediaType('tv')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mediaType === 'tv' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>SERIES</button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-20 text-center">
                <div className="mb-32">
                    <h2 className="text-7xl md:text-[11rem] font-black tracking-tightest leading-[0.8] mb-12 uppercase">
                        DON'T KNOW <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">WHAT TO WATCH?</span>
                    </h2>
                    <button 
                        onClick={rollDice}
                        className="bg-white text-black px-16 py-8 rounded-[3rem] font-black text-3xl hover:scale-105 transition-all shadow-2xl uppercase active:scale-95"
                    >
                        {loading ? 'ROLLING...' : '🎲 ROLL THE DICE'}
                    </button>
                </div>

                {result && (
                    <div className="grid md:grid-cols-12 gap-16 items-center text-left animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        <div className="md:col-span-5">
                            <img 
                                src={`https://image.tmdb.org/t/p/w780${result.poster_path}`} 
                                className="rounded-[3.5rem] shadow-2xl border border-white/10 w-full aspect-[2/3] object-cover"
                                alt="poster"
                            />
                        </div>
                        <div className="md:col-span-7">
                            <div className="flex items-center gap-4 mb-6 text-sm font-black text-slate-500 uppercase">
                                <span className="text-amber-400 bg-amber-400/10 px-4 py-1.5 rounded-xl">★ {result.vote_average.toFixed(1)}</span>
                                <span>{result.release_date?.split('-')[0] || result.first_air_date?.split('-')[0]}</span>
                            </div>
                            <h3 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase">
                                {result.title || result.name}
                            </h3>
                            <p className="text-slate-400 text-2xl leading-relaxed mb-12 font-medium">{result.overview}</p>
                            <div className="flex gap-4">
                                <button className="px-12 py-6 rounded-[1.5rem] bg-indigo-600 text-white font-black text-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 uppercase">
                                    Watch Trailer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}