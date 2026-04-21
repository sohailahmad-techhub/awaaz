import Sidebar from "@/components/Sidebar";

const dashboardSidebarItems = [
  { label: 'Overview', active: true, path: '/ngo' },
  { label: 'Active Projects', badge: '18', path: '/ngo' },
  { label: 'Funded History', path: '/ngo' },
  { label: 'Profile Settings', path: '/ngo' }
];

export default function NGOLayout({ children }) {
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Sidebar items={dashboardSidebarItems} title="NGO Dashboard" />
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
