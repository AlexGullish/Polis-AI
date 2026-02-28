'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Globe } from 'lucide-react';
import { CITIES } from '@/lib/cities';
import { CityData } from '@/lib/types';

interface Props {
  selectedCity: CityData | null;
  onSelect: (city: CityData) => void;
}

export default function CitySearch({ selectedCity, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? CITIES.filter(
      c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase())
    )
    : CITIES;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-lg cursor-text"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
        onClick={() => setOpen(true)}
      >
        <Search size={16} style={{ color: 'var(--text-secondary)' }} />
        <input
          type="text"
          placeholder="Search city..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--text-primary)' }}
        />
        {selectedCity && !query && (
          <span className="text-sm font-medium" style={{ color: 'var(--accent-blue)' }}>
            {selectedCity.name}
          </span>
        )}
      </div>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg z-50 overflow-hidden"
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              No cities found
            </div>
          ) : (
            filtered.map(city => (
              <button
                key={city.id}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:opacity-80"
                style={{
                  background: selectedCity?.id === city.id ? 'var(--bg-card-hover)' : 'transparent',
                }}
                onClick={() => {
                  onSelect(city);
                  setQuery('');
                  setOpen(false);
                }}
              >
                <Globe size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {city.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {city.country} · Pop. {(city.population * 1e6).toLocaleString()}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
