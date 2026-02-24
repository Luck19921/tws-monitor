'use client';

import { useEffect, useRef, useState } from 'react';
import {
    createChart,
    ColorType,
    IChartApi,
    CandlestickSeries,
    HistogramSeries,
    LineSeries
} from 'lightweight-charts';
import styles from './CandlestickChart.module.css';

interface ChartData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    value: number; // Volume
}

interface CandlestickChartProps {
    symbol: string;
}

export default function CandlestickChart({ symbol }: CandlestickChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [data, setData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch(`/api/stocks/${symbol}/history`);
                if (res.ok) {
                    const json = await res.json();
                    // Lightweight charts requires data to be sorted by time ascending
                    const sortedData = json.data.sort((a: ChartData, b: ChartData) =>
                        new Date(a.time).getTime() - new Date(b.time).getTime()
                    );
                    setData(sortedData);
                }
            } catch (error) {
                console.error("Failed to fetch historical data", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchHistory();
    }, [symbol]);

    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return;

        const chartOptions = {
            layout: {
                textColor: '#a0a0ab',
                background: { type: ColorType.Solid, color: 'transparent' },
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
            },
            width: chartContainerRef.current.clientWidth,
            height: 450,
        };

        const chart = createChart(chartContainerRef.current, chartOptions) as any;
        chartRef.current = chart;

        // Create Candlestick Series
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',       // bullish
            downColor: '#ef4444',     // bearish
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });
        // Format OHLC data for lightweight-charts
        const candleData = data.map((d: ChartData) => ({
            time: d.time as string,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));
        // @ts-ignore - Lightweight charts has strict internal typing for 'time' that clashes with string occasionally
        candleSeries.setData(candleData);

        // Create Volume Series
        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#26a69a',
            priceFormat: { type: 'volume' },
            priceScaleId: '', // Set as an overlay
        });
        volumeSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.8, // highest point of the series starts at 80% from the top
                bottom: 0,
            },
        });

        const volumeData = data.map((d: ChartData) => ({
            time: d.time as string,
            value: d.value,
            color: d.close >= d.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
        }));
        // @ts-ignore
        volumeSeries.setData(volumeData);

        // Calculate 20-day Simple Moving Average (SMA)
        const sma20Series = chart.addSeries(LineSeries, {
            color: 'rgba(59, 130, 246, 0.8)', // Primary accent
            lineWidth: 2,
            title: 'SMA 20',
            crosshairMarkerVisible: false,
        });

        const smaData = [];
        const windowSize = 20;
        for (let i = 0; i < data.length; i++) {
            if (i < windowSize - 1) continue; // Not enough data

            let sum = 0;
            for (let j = 0; j < windowSize; j++) {
                sum += data[i - j].close;
            }
            smaData.push({ time: data[i].time as string, value: sum / windowSize });
        }
        // @ts-ignore
        sma20Series.setData(smaData);

        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data]);

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading historical chart data...</p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div ref={chartContainerRef} className={styles.chartContainer} />
        </div>
    );
}
