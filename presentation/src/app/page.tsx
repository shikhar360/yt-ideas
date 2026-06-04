"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, AlertTriangle, CheckCircle, Lightbulb, Search } from 'lucide-react';

interface BlueprintData {
  title: string;
  painPoints: string[];
  benefit: string;
  steps: { metaphor?: string; description: string }[];
  mistake: string;
  research: { title: string; content: string }[];
  updatedAt: string;
}

export default function PresentationPage() {
  const [data, setData] = useState<BlueprintData | null>(null);

  useEffect(() => {
    fetch('/data/latest.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Error loading data:", err));
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <p className="animate-pulse">Loading latest presentation data...</p>
    </div>
  );

  return (
    <main className="bg-black text-white">
      {/* 1. THE HOOK */}
      <section className="min-h-screen flex items-center justify-between p-20 bg-black">
        <div className="max-w-2xl">
          <span className="px-3 py-1 bg-lime-400 text-black text-xs font-bold uppercase tracking-widest rounded">Phase 1: The Hook</span>
          <h1 className="text-7xl font-black mt-6 leading-tight uppercase tracking-tighter">
            {data.title}
          </h1>
          <div className="mt-12 space-y-4">
            {data.painPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-4">
                <AlertTriangle className="text-pink-500 mt-1 shrink-0" size={24} />
                <p className="text-2xl text-stone-300 italic">"{point}"</p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-[300px] h-[450px] border-4 border-dashed border-pink-500 bg-pink-500/5 flex items-center justify-center text-pink-500 font-mono text-center p-8 rounded-2xl">
          TALENT ZONE<br/>(HOISTED LEFT)
        </div>
      </section>

      {/* 2. THE SOLUTION / BENEFIT */}
      <section className="min-h-screen flex items-center justify-between p-20 bg-stone-900">
        <div className="w-[300px] h-[450px] border-4 border-dashed border-blue-500 bg-blue-500/5 flex items-center justify-center text-blue-500 font-mono text-center p-8 rounded-2xl order-2">
          TALENT ZONE<br/>(HOISTED RIGHT)
        </div>
        <div className="max-w-2xl order-1">
          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded">Phase 2: The Solution</span>
          <h2 className="text-6xl font-black mt-6 leading-none text-blue-500 uppercase">
            The Big Payoff
          </h2>
          <div className="mt-8 p-10 bg-black border-l-8 border-blue-500">
            <p className="text-4xl font-bold text-white leading-tight">
              {data.benefit}
            </p>
          </div>
        </div>
      </section>

      {/* 3. THE GUIDE / STEPS */}
      <section className="min-h-screen flex flex-col justify-center p-20 bg-black">
        <span className="px-3 py-1 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest rounded w-fit">Phase 3: The Guide</span>
        <h2 className="text-6xl font-black mt-6 mb-16 uppercase">How to Win</h2>
        <div className="grid grid-cols-3 gap-8">
          {data.steps.map((step, i) => (
            <div key={i} className="p-8 bg-stone-900 border border-stone-800 rounded-lg">
              <span className="text-amber-500 font-black text-4xl block mb-4">0{i+1}</span>
              {step.metaphor && <h3 className="text-2xl font-bold mb-4 text-white uppercase">{step.metaphor}</h3>}
              <p className="text-lg text-stone-400">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DEEP DIVE / RESEARCH */}
      {data.research && data.research.length > 0 && (
        <section className="min-h-screen flex flex-col justify-center p-20 bg-stone-900">
          <div className="flex items-center gap-4 mb-12">
            <Search className="text-yellow-400 w-12 h-12" />
            <h2 className="text-6xl font-black uppercase text-yellow-400">Deep Dive Research</h2>
          </div>
          <div className="grid grid-cols-2 gap-12">
            {data.research.map((item, i) => (
              <div key={i} className="bg-black p-8 rounded-xl border border-stone-800">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-stone-800 pb-2">{item.title}</h3>
                <div className="text-stone-400 font-mono text-sm overflow-hidden h-64 whitespace-pre-wrap">
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. THE TRAP */}
      <section className="min-h-screen flex items-center justify-between p-20 bg-black">
        <div className="max-w-2xl">
          <span className="px-3 py-1 bg-pink-500 text-white text-xs font-bold uppercase tracking-widest rounded">Phase 4: The Pitfall</span>
          <h2 className="text-6xl font-black mt-6 leading-none text-pink-500 uppercase">
            Avoid the Trap
          </h2>
          <div className="mt-8 p-10 bg-stone-900 border-l-8 border-pink-500 flex items-center gap-6">
            <AlertTriangle className="text-pink-500 w-24 h-24 shrink-0" />
            <p className="text-3xl font-bold text-white italic">
              "{data.mistake}"
            </p>
          </div>
        </div>
        <div className="w-[300px] h-[450px] border-4 border-dashed border-pink-500 bg-pink-500/5 flex items-center justify-center text-pink-500 font-mono text-center p-8 rounded-2xl">
          TALENT ZONE<br/>(CLOSING POSITION)
        </div>
      </section>
    </main>
  );
}
