'use client';

import Link from 'next/link';
import { TrendingUp, LayoutDashboard, Bookmark } from 'lucide-react';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <TrendingUp className={styles.icon} />
                    <Link href="/">TWS Monitor</Link>
                </div>
                <div className={styles.links}>
                    <Link
                        href="/"
                        className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                    <Link
                        href="/watchlists"
                        className={`${styles.link} ${pathname.startsWith('/watchlists') ? styles.active : ''}`}
                    >
                        <Bookmark size={18} />
                        WatchLists
                    </Link>
                </div>
            </div>
        </nav>
    );
}
