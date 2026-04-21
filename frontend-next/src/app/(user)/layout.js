import Sidebar from "@/components/Sidebar";

const userSidebarItems = [
  { label: 'Profile Overview', active: true, path: '/profile' },
  { label: 'My Reports', badge: '5', path: '/profile' },
  { label: 'Saved Projects', path: '/profile' },
  { label: 'Settings', path: '/profile' }
];

export default function UserLayout({ children }) {
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Sidebar items={userSidebarItems} title="My Account" />
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
