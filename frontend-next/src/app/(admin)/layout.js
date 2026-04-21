import Sidebar from "@/components/Sidebar";

import { LayoutDashboard, Rocket, History, Settings2, ShieldAlert } from 'lucide-react';

const adminSidebarItems = [
  { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/admin?tab=overview' },
  { label: 'Moderation', icon: <ShieldAlert size={18} />, path: '/admin?tab=overview' }, // Keep as part of overview for now or separate if needed
  { label: 'Active Projects', icon: <Rocket size={18} />, path: '/admin?tab=projects' },
  { label: 'Funded History', icon: <History size={18} />, path: '/admin?tab=history' },
  { type: 'divider' },
  { label: 'Profile Settings', icon: <Settings2 size={18} />, path: '/admin?tab=settings' }
];

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Sidebar items={adminSidebarItems} title="Admin Center" />
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
