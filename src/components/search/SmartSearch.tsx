'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import styles from './SmartSearch.module.css';

interface SearchResult {
    symbol: string;
    name: string;
}

export default function SmartSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Click outside to close
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 0) {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data.results);
                        setIsOpen(true);
                    }
                } catch (error) {
                    console.error("Search error", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (symbol: string) => {
        setQuery('');
        setIsOpen(false);
        router.push(`/stock/${symbol}`);
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <div className={styles.inputContainer}>
                <Search className={styles.searchIcon} size={20} />
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Search TWS symbols or names (e.g. 2330 or 台積電)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                />
                {isLoading && <Loader2 className={styles.loadingIcon} size={18} />}
            </div>

            {isOpen && results.length > 0 && (
                <ul className={styles.dropdown}>
                    {results.map((stock) => (
                        <li
                            key={stock.symbol}
                            className={styles.resultItem}
                            onClick={() => handleSelect(stock.symbol)}
                        >
                            <div className={styles.symbol}>{stock.symbol}</div>
                            <div className={styles.name}>{stock.name}</div>
                        </li>
                    ))}
                </ul>
            )}

            {isOpen && results.length === 0 && !isLoading && query.length > 0 && (
                <div className={styles.noResults}>
                    No stocks found matching &quot;{query}&quot;
                </div>
            )}
        </div>
    );
}
