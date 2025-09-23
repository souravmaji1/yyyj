import { MainLayout } from '../../components/layout/MainLayout';

export default function MainPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
} 