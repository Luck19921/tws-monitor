'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Folder, Loader2 } from 'lucide-react';
import styles from './WatchListManager.module.css';

interface Stock {
    id: string;
    symbol: string;
    name: string;
}

interface WatchList {
    id: string;
    name: string;
    stocks: Stock[];
}

export default function WatchListManager() {
    const [watchlists, setWatchlists] = useState<WatchList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newListName, setNewListName] = useState('');

    const fetchWatchLists = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/watchlists');
            if (res.ok) {
                const data = await res.json();
                setWatchlists(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchLists();
    }, []);

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        try {
            const res = await fetch('/api/watchlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newListName.trim() })
            });
            if (res.ok) {
                setNewListName('');
                setIsCreating(false);
                fetchWatchLists();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteList = async (id: string) => {
        if (!confirm('Are you sure you want to delete this WatchList?')) return;
        try {
            const res = await fetch(`/api/watchlists/${id}`, { method: 'DELETE' });
            if (res.ok) fetchWatchLists();
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemoveStock = async (listId: string, stockId: string) => {
        try {
            const res = await fetch(`/api/watchlists/${listId}/stocks?stockId=${stockId}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchWatchLists();
        } catch (e) {
            console.error(e);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingState}>
                <Loader2 className={styles.spinIcon} size={32} />
                <p>Loading your WatchLists...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Your Portfolios</h1>
                <button
                    className={styles.createBtn}
                    onClick={() => setIsCreating(!isCreating)}
                >
                    <Plus size={18} />
                    <span>New WatchList</span>
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateList} className={`glass-panel ${styles.createForm}`}>
                    <input
                        type="text"
                        placeholder="e.g. High Dividend Yield"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        className={styles.input}
                        autoFocus
                    />
                    <div className={styles.formActions}>
                        <button type="button" onClick={() => setIsCreating(false)} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" className={styles.submitBtn} disabled={!newListName.trim()}>Create</button>
                    </div>
                </form>
            )}

            {watchlists.length === 0 && !isCreating ? (
                <div className={styles.emptyState}>
                    <Folder size={48} className={styles.emptyIcon} />
                    <h3>No WatchLists Found</h3>
                    <p>Create your first WatchList to start tracking stocks seamlessly.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {watchlists.map(list => (
                        <div key={list.id} className={`glass-panel ${styles.listCard}`}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>{list.name}</h3>
                                <button
                                    className={styles.deleteListBtn}
                                    onClick={() => handleDeleteList(list.id)}
                                    title="Delete WatchList"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className={styles.stocksList}>
                                {list.stocks.length === 0 ? (
                                    <p className={styles.emptyStocks}>No stocks added yet. Search a stock to add it.</p>
                                ) : (
                                    list.stocks.map(stock => (
                                        <div key={stock.id} className={styles.stockItem}>
                                            <Link href={`/stock/${stock.symbol}`} className={styles.stockLink}>
                                                <span className={styles.stockSymbol}>{stock.symbol}</span>
                                                <span className={styles.stockName}>{stock.name}</span>
                                            </Link>
                                            <button
                                                className={styles.removeStockBtn}
                                                onClick={() => handleRemoveStock(list.id, stock.id)}
                                                title="Remove from list"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
