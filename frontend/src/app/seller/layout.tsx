import SellerGuard from '@/components/layout/SellerGuard';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    return (
        <SellerGuard>
            {children}
        </SellerGuard>
    );
}
