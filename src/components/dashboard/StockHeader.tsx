'use client';

import { useState, useRef, useEffect } from 'react';
import { TrendingUp, TrendingDown, Star, BookmarkPlus, Loader2 } from 'lucide-react';
import styles from './StockHeader.module.css';

interface StockHeaderProps {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

interface WatchList {
    id: string;
    name: string;
}

export default function StockHeader({ symbol, name, price, change, changePercent }: StockHeaderProps) {
    const isPositive = change >= 0;
    const [showDropdown, setShowDropdown] = useState(false);
    const [watchlists, setWatchlists] = useState<WatchList[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchWatchLists = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/watchlists');
            if (res.ok) {
                setWatchlists(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDropdown = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown && watchlists.length === 0) {
            fetchWatchLists();
        }
    };

    const addToWatchList = async (listId: string) => {
        try {
            const res = await fetch(`/api/watchlists/${listId}/stocks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, name })
            });
            if (res.ok) {
                alert('Added to WatchList!');
                setShowDropdown(false);
            } else if (res.status === 409) {
                alert('Stock is already in this WatchList.');
            } else {
                alert('Failed to add stock.');
            }
        } catch (e) {
            console.error(e);
            alert('Failed to add stock.');
        }
    };

    return (
        <div className={`glass-panel ${styles.header}`}>
            <div className={styles.info}>
                <div>
                    <h1 className={styles.title}>{name} <span className={styles.symbol}>({symbol})</span></h1>
                    <div className={styles.priceRow}>
                        <span className={styles.price}>{price.toFixed(2)}</span>
                        <div className={`${styles.changeBadge} ${isPositive ? styles.positive : styles.negative}`}>
                            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span>{Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.actions} ref={dropdownRef}>
                <button className={styles.watchBtn} onClick={handleOpenDropdown}>
                    <Star size={18} />
                    <span>Add to WatchList</span>
                </button>

                {showDropdown && (
                    <div className={styles.dropdownMenu}>
                        <div className={styles.dropdownHeader}>Select WatchList</div>
                        {isLoading ? (
                            <div className={styles.dropdownState}><Loader2 size={16} className="animate-spin" /> Loading...</div>
                        ) : watchlists.length === 0 ? (
                            <div className={styles.dropdownState}>No WatchLists found. Create one first.</div>
                        ) : (
                            <ul className={styles.dropdownList}>
                                {watchlists.map(list => (
                                    <li key={list.id}>
                                        <button
                                            className={styles.dropdownItem}
                                            onClick={() => addToWatchList(list.id)}
                                        >
                                            <BookmarkPlus size={16} />
                                            {list.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
