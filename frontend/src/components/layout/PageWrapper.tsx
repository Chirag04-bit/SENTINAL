import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface PageWrapperProps {
  role: 'user' | 'admin';
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PageWrapper({ role, title, subtitle, children }: PageWrapperProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar role={role} title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto bg-grid">
          {children}
        </main>
      </div>
    </div>
  );
}
