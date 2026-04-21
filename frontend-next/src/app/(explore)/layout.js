import Sidebar from "@/components/Sidebar";

const exploreSidebarItems = [
  { type: 'search', placeholder: 'Search...' },
  { label: 'All Problems', active: true, path: '/feed' },
  { label: 'Nearby', badge: '12', path: '/feed' },
  { label: 'Trending', badge: '🔥', path: '/feed' },
  { type: 'divider' },
  { type: 'title', label: 'Categories' },
  { label: 'Road Infrastructure', path: '/feed' },
  { label: 'Water Supply', path: '/feed' },
  { label: 'Waste Management', path: '/feed' },
  { label: 'Electricity', path: '/feed' },
  { type: 'divider' },
  { type: 'title', label: 'Urgency' },
  { label: 'Critical', badge: '🚨', path: '/feed' },
  { label: 'High', path: '/feed' },
  { label: 'Medium', path: '/feed' }
];

export default function ExploreLayout({ children }) {
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Sidebar items={exploreSidebarItems} title="Explore" />
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
