'use client';

import { useEffect, useState } from 'react';
import styles from './MetricModules.module.css';

interface MarginProps {
    symbol: string;
}

export default function MarginMetrics({ symbol }: MarginProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const res = await fetch(`/api/stocks/${symbol}/metrics`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json.margin);
                }
            } catch (error) {
                console.error("Failed to fetch Margin data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMetrics();
    }, [symbol]);

    if (loading) return <div className={styles.loadingPulse} />;
    if (!data || !data.MarginPurchaseLimit) return <div className={styles.error}>No Margin Data Available</div>;

    const purchaseRatio = Math.min((data.MarginPurchaseTodayBalance / data.MarginPurchaseLimit) * 100, 100) || 0;
    const shortRatio = Math.min((data.ShortSaleTodayBalance / data.ShortSaleLimit) * 100, 100) || 0;

    return (
        <div className={`glass-panel ${styles.moduleCard}`}>
            <h3 className={styles.title}>Margin Trading Status</h3>
            <p className={styles.subtitle}>Data date: {data.date}</p>

            <div className={styles.progressContainer}>
                <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Margin Purchase (融資) Utilization</span>
                    <span className={styles.progressStat}>
                        {data.MarginPurchaseTodayBalance.toLocaleString()} / {data.MarginPurchaseLimit.toLocaleString()}
                    </span>
                </div>
                <div className={styles.progressBar}>
                    <div
                        className={`${styles.progressFill} ${purchaseRatio > 80 ? styles.danger : ''}`}
                        style={{ width: `${purchaseRatio}%` }}
                    />
                </div>
                <p className={styles.subtitle} style={{ marginLeft: 0, marginTop: '0.25rem' }}>{purchaseRatio.toFixed(1)}% limit reached</p>
            </div>

            <div className={styles.progressContainer}>
                <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Short Sale (融券) Utilization</span>
                    <span className={styles.progressStat}>
                        {data.ShortSaleTodayBalance.toLocaleString()} / {data.ShortSaleLimit.toLocaleString()}
                    </span>
                </div>
                <div className={styles.progressBar}>
                    <div
                        className={`${styles.progressFill} ${shortRatio > 80 ? styles.danger : ''}`}
                        style={{ width: `${shortRatio}%`, background: '#f59e0b' }} // Amber color for shorting
                    />
                </div>
                <p className={styles.subtitle} style={{ marginLeft: 0, marginTop: '0.25rem' }}>{shortRatio.toFixed(1)}% limit reached</p>
            </div>
        </div>
    );
}
