"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ items, title = "Filters" }) {
  const pathname = usePathname();

  return (
    <div className="sidebar">
      {title && (
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', padding: '0 16px 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </p>
      )}
      {items.map((item, index) => {
        if (item.type === 'search') {
          return (
            <div key={index} style={{ padding: '0 0 16px' }}>
              <input placeholder={item.placeholder || "Search..."} style={{ fontSize: '14px', borderRadius: 'var(--radius-full)' }} />
            </div>
          );
        }
        if (item.type === 'divider') {
          return <hr key={index} className="divider" style={{ margin: '12px 0' }} />;
        }
        if (item.type === 'title') {
          return (
            <p key={index} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', padding: '12px 16px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {item.label}
            </p>
          );
        }
        
        const isActive = pathname === item.path || (item.active);
        
        return (
          <Link 
            href={item.path || "#"} 
            key={index} 
            className={`sidebar-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            {item.icon && <span style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>{item.icon}</span>}
            {item.label}
            {item.badge && (
              <span style={{ 
                background: isActive ? '#BFDBFE' : 'var(--color-bg-hover)', 
                color: isActive ? 'var(--color-primary-hover)' : 'var(--color-text-muted)', 
                fontSize: '11px', padding: '2px 8px', borderRadius: '12px', marginLeft: 'auto', fontWeight: 600 
              }}>
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
