import { notFound } from 'next/navigation';
import StockHeader from '@/components/dashboard/StockHeader';
import FinancialMetrics from '@/components/dashboard/FinancialMetrics';
import CandlestickChart from '@/components/charts/CandlestickChart';
import RadarMetrics from '@/components/charts/RadarMetrics';
import InstitutionalMetrics from '@/components/dashboard/modules/InstitutionalMetrics';
import CompositionMetrics from '@/components/dashboard/modules/CompositionMetrics';
import MarginMetrics from '@/components/dashboard/modules/MarginMetrics';
import NewsModule from '@/components/dashboard/modules/NewsModule';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ symbol: string }>;
}

import { headers } from 'next/headers';

export default async function StockPage({ params }: PageProps) {
    const { symbol } = await params;

    // Build dynamic base URL for server-side fetch (works in dev + production)
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/stocks/${symbol}`, { cache: 'no-store' });
    let stockData = null;

    if (res.ok) {
        stockData = await res.json();
    }

    if (!stockData || !stockData.quote) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    Failed to track {symbol}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Real-time Header & Controls */}
            <StockHeader
                symbol={stockData.symbol}
                name={stockData.quote.name || `Stock ${stockData.symbol}`}
                price={stockData.quote.price}
                change={stockData.quote.change}
                changePercent={stockData.quote.changePercent}
            />

            {/* Top Region: Charts and Health Layout */}
            <div className={styles.topChartsLayout}>
                <div className={styles.mainChartSection}>
                    <h2 className={styles.sectionTitle}>Price Action & Volume</h2>
                    <div className={styles.chartContainer}>
                        <CandlestickChart symbol={symbol} />
                    </div>
                </div>

                <div className={styles.sideMetricsSection}>
                    <h2 className={styles.sectionTitle}>Factor Strength Analysis</h2>
                    <div className={styles.chartContainer}>
                        <RadarMetrics stats={stockData.stats} />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <FinancialMetrics stats={stockData.stats} />
                    </div>
                </div>
            </div>

            {/* Bottom Region: Advanced Data Modules */}
            <div className={styles.advancedGrid}>
                <div className={styles.moduleWrapper}>
                    <CompositionMetrics symbol={symbol} />
                </div>
                <div className={styles.moduleWrapper}>
                    <InstitutionalMetrics symbol={symbol} />
                </div>
                <div className={styles.moduleWrapper}>
                    <MarginMetrics symbol={symbol} />
                </div>
                <div className={styles.moduleWrapperNews}>
                    <NewsModule symbol={symbol} />
                </div>
            </div>
        </div>
    );
}
