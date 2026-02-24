import SmartSearch from '@/components/search/SmartSearch';
import { TrendingUp, Activity, PieChart } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className="animate-fade-in">
      <header className={styles.hero}>
        <h1 className={styles.title}>Track the Taiwan Stock Market with Confidence</h1>
        <p className={styles.subtitle}>
          Real-time insights, comprehensive financial health metrics, and personalized WatchLists tailored for pro-level analytics.
        </p>
        <div className={styles.searchWrapper}>
          <SmartSearch />
        </div>
      </header>

      <section className={styles.features}>
        <div className="glass-panel p-6">
          <TrendingUp className={styles.featureIcon} size={32} />
          <h3>Real-time Tracking</h3>
          <p>Get instant price quotes and intraday trends from top providers.</p>
        </div>
        <div className="glass-panel p-6">
          <Activity className={styles.featureIcon} size={32} />
          <h3>Deep Financials</h3>
          <p>Explore PE ratios, PB ratios, margins, and dividend yields easily.</p>
        </div>
        <div className="glass-panel p-6">
          <PieChart className={styles.featureIcon} size={32} />
          <h3>Custom WatchLists</h3>
          <p>Organize your portfolio into high-yield, growth, or swing trade lists.</p>
        </div>
      </section>
    </div>
  );
}
