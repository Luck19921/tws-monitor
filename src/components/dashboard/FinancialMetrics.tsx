import { FinancialStats } from '@/lib/api/finmind';
import { StockQuote } from '@/lib/api/fugle';
import { Activity, DollarSign, Percent, Scale, TrendingUp } from 'lucide-react';
import styles from './FinancialMetrics.module.css';

interface FinancialMetricsProps {
    stats: FinancialStats;
}

export default function FinancialMetrics({ stats }: FinancialMetricsProps) {
    return (
        <div className={styles.grid}>
            <div className={`glass-panel ${styles.card}`}>
                <div className={styles.iconWrapper}><DollarSign size={20} /></div>
                <div className={styles.data}>
                    <span className={styles.label}>Dividend Yield</span>
                    <span className={styles.value}>{stats.dividendYield.toFixed(2)}%</span>
                </div>
            </div>

            <div className={`glass-panel ${styles.card}`}>
                <div className={styles.iconWrapper}><Scale size={20} /></div>
                <div className={styles.data}>
                    <span className={styles.label}>P/E Ratio</span>
                    <span className={styles.value}>{stats.peRatio.toFixed(2)}</span>
                </div>
            </div>

            <div className={`glass-panel ${styles.card}`}>
                <div className={styles.iconWrapper}><Activity size={20} /></div>
                <div className={styles.data}>
                    <span className={styles.label}>P/B Ratio</span>
                    <span className={styles.value}>{stats.pbRatio.toFixed(2)}</span>
                </div>
            </div>

            <div className={`glass-panel ${styles.card}`}>
                <div className={styles.iconWrapper}><TrendingUp size={20} /></div>
                <div className={styles.data}>
                    <span className={styles.label}>Revenue Growth (YoY)</span>
                    <span className={styles.value}>{stats.revenueGrowth.toFixed(2)}%</span>
                </div>
            </div>

            <div className={`glass-panel ${styles.card}`}>
                <div className={styles.iconWrapper}><Percent size={20} /></div>
                <div className={styles.data}>
                    <span className={styles.label}>Gross Margin</span>
                    <span className={styles.value}>{stats.grossMargin.toFixed(2)}%</span>
                </div>
            </div>

            <div className={`glass-panel ${styles.card}`}>
                <div className={styles.iconWrapper}><Percent size={20} /></div>
                <div className={styles.data}>
                    <span className={styles.label}>Debt to Equity</span>
                    <span className={styles.value}>{stats.debtToEquity.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
