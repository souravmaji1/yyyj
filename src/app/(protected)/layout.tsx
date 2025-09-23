import { MainLayout } from '@/src/components/layout/MainLayout';
import { ClientAuthCheck } from '@/src/components/auth/ClientAuthCheck';
import { AdProvider } from '@/src/lib/allcontext';
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAuthCheck>
      <AdProvider>
      <MainLayout>{children}</MainLayout>
      </AdProvider>
    </ClientAuthCheck>
  );
} 