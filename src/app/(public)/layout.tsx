import { MainLayout } from '@/src/components/layout/MainLayout';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
} 