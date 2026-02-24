'use client';

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip
} from 'recharts';
import styles from './RadarMetrics.module.css';
import { FinancialStats } from '@/lib/api/finmind';

interface RadarMetricsProps {
    stats: FinancialStats;
}

export default function RadarMetrics({ stats }: RadarMetricsProps) {
    // Normalize stats to a 0-100 scale for visual comparison (mock normalization scheme)
    const data = [
        { subject: 'Dividend Yield', value: Math.min(stats.dividendYield * 15, 100), actual: `${stats.dividendYield}%` },
        { subject: 'P/E Strength', value: Math.max(100 - (stats.peRatio * 2), 10), actual: stats.peRatio },
        { subject: 'P/B Strength', value: Math.max(100 - (stats.pbRatio * 10), 10), actual: stats.pbRatio },
        { subject: 'Rev Growth', value: Math.min(stats.revenueGrowth * 3, 100), actual: `${stats.revenueGrowth}%` },
        { subject: 'Gross Margin', value: Math.min(stats.grossMargin, 100), actual: `${stats.grossMargin}%` },
        { subject: 'Fin Health', value: Math.max(100 - (stats.debtToEquity * 50), 10), actual: stats.debtToEquity.toFixed(2) },
    ];

    return (
        <div className={`glass-panel ${styles.wrapper}`}>
            <h3 className={styles.title}>Factor Strength Analysis</h3>
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a0a0ab', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Stock Profile"
                            dataKey="value"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.4}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#141416', border: '1px solid #ffffff1a', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#a0a0ab' }}
                            // @ts-ignore - Recharts internal Payload typing is highly complex
                            formatter={(val: number | string | undefined, name: string, props: { payload: { actual: string | number } }) => [props?.payload?.actual, name]}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
