'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './MetricModules.module.css';

interface InstitutionalProps {
    symbol: string;
}

export default function InstitutionalMetrics({ symbol }: InstitutionalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const res = await fetch(`/api/stocks/${symbol}/metrics`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json.institutional);
                }
            } catch (error) {
                console.error("Failed to fetch Institutional data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMetrics();
    }, [symbol]);

    if (loading) return <div className={styles.loadingPulse} />;
    if (!data) return <div className={styles.error}>No Institutional Data Found</div>;

    const chartData = [
        {
            name: 'Foreign',
            Buy: data.foreignBuy,
            Sell: data.foreignSell,
            Net: data.foreignBuy - data.foreignSell
        },
        {
            name: 'Trust',
            Buy: data.trustBuy,
            Sell: data.trustSell,
            Net: data.trustBuy - data.trustSell
        },
        {
            name: 'Dealers',
            Buy: data.dealerBuy,
            Sell: data.dealerSell,
            Net: data.dealerBuy - data.dealerSell
        }
    ];

    return (
        <div className={`glass-panel ${styles.moduleCard}`}>
            <h3 className={styles.title}>Institutional Trading (Latest)</h3>
            <p className={styles.subtitle}>Data date: {data.date}</p>

            <div className={styles.chartArea} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Net Buy/Sell Activity</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <XAxis dataKey="name" tick={{ fill: '#a0a0ab', fontSize: 12 }} />
                            <YAxis tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} tick={{ fill: '#a0a0ab', fontSize: 12 }} width={45} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#141416', border: '1px solid #ffffff1a', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#a0a0ab' }}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(value: any, name: any) => [value.toLocaleString(), name]}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#a0a0ab' }} />
                            <Bar dataKey="Buy" stackId="a" fill="#22c55e" />
                            <Bar dataKey="Sell" stackId="a" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Total Volume Composition</p>
                    <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Foreign', value: data.foreignBuy + data.foreignSell, color: '#3b82f6' },
                                    { name: 'Trust', value: data.trustBuy + data.trustSell, color: '#f59e0b' },
                                    { name: 'Dealers', value: data.dealerBuy + data.dealerSell, color: '#8b5cf6' }
                                ].filter(d => d.value > 0)}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={65}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {
                                    [
                                        { name: 'Foreign', value: data.foreignBuy + data.foreignSell, color: '#3b82f6' },
                                        { name: 'Trust', value: data.trustBuy + data.trustSell, color: '#f59e0b' },
                                        { name: 'Dealers', value: data.dealerBuy + data.dealerSell, color: '#8b5cf6' }
                                    ].filter(d => d.value > 0).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))
                                }
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#141416', border: '1px solid #ffffff1a', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(value: any) => [value.toLocaleString(), 'Volume']}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#a0a0ab' }} layout="vertical" align="right" verticalAlign="middle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={styles.summaryGrid}>
                {chartData.map((inst, i) => (
                    <div key={i} className={styles.summaryItem}>
                        <span className={styles.instName}>{inst.name} Net</span>
                        <span className={inst.Net >= 0 ? styles.pos : styles.neg}>
                            {inst.Net > 0 ? '+' : ''}{inst.Net.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
