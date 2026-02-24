'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import styles from './MetricModules.module.css';

interface CompositionProps {
    symbol: string;
}

export default function CompositionMetrics({ symbol }: CompositionProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const res = await fetch(`/api/stocks/${symbol}/composition`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json.composition);
                }
            } catch (error) {
                console.error("Failed to fetch Composition data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMetrics();
    }, [symbol]);

    if (loading) return <div className={styles.loadingPulse} />;
    if (!data) return <div className={styles.error}>No Composition Data Found</div>;

    const chartData = [
        { name: 'Large Institutional', value: data.largeHolders, color: '#f59e0b' },
        { name: 'Retail', value: data.retail, color: '#3b82f6' }
    ];

    return (
        <div className={`glass-panel ${styles.moduleCard}`}>
            <h3 className={styles.title}>Free Float Composition</h3>
            <p className={styles.subtitle}>Large Institutional (大戶) vs Retail (散戶)</p>

            <div className={styles.chartArea} style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {
                                chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))
                            }
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#141416', border: '1px solid #ffffff1a', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: any) => [`${value}%`, 'Ratio']}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', color: '#a0a0ab', paddingTop: '10px' }} layout="horizontal" align="center" verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
