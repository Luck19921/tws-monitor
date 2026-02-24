'use client';

import { useEffect, useState } from 'react';
import styles from './MetricModules.module.css';
import { ExternalLink } from 'lucide-react';
import { NewsItem } from '@/lib/api/news';

interface NewsProps {
    symbol: string;
}

export default function NewsModule({ symbol }: NewsProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            try {
                const res = await fetch(`/api/stocks/${symbol}/news`);
                if (res.ok) {
                    const json = await res.json();
                    setNews(json.news);
                }
            } catch (error) {
                console.error("Failed to fetch Contextual News", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, [symbol]);

    if (loading) return <div className={styles.loadingPulse} />;
    if (!news || news.length === 0) return <div className={styles.error}>No recent news found for {symbol}</div>;

    return (
        <div className={`glass-panel ${styles.moduleCard}`}>
            <h3 className={styles.title}>Contextual News</h3>
            <p className={styles.subtitle}>Latest headlines via Yahoo Finance TW</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {news.map((item) => (
                    <a
                        key={item.id}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-elevated)',
                            textDecoration: 'none',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                    >
                        <div style={{ flex: 1, paddingRight: '1rem' }}>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.4, marginBottom: '0.25rem' }}>
                                {item.title}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {item.pubDate} • {item.source}
                            </div>
                        </div>
                        <ExternalLink size={16} color="var(--text-secondary)" />
                    </a>
                ))}
            </div>
        </div>
    );
}
