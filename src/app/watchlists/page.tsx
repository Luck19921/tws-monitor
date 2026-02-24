import WatchListManager from '@/components/watchlists/WatchListManager';

export const metadata = {
    title: 'My WatchLists | TWS Monitor',
};

export default function WatchListsPage() {
    return (
        <div>
            <WatchListManager />
        </div>
    );
}
