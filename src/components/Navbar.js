"use client";
import { Search, Bell, User, Wallet } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="glass" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.5rem',
      margin: '1rem',
      position: 'sticky',
      top: '1rem',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: '800', 
          background: 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px'
        }}>
          NEXUS
        </div>
        <div className="glass" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.5rem 1rem',
          fontSize: '0.875rem'
        }}>
          <Search size={16} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              outline: 'none',
              width: '200px'
            }} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
          <Wallet size={18} />
          <span style={{ fontWeight: '600' }}>$42,690.00</span>
        </div>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="var(--text-secondary)" />
          <span style={{ 
            position: 'absolute', 
            top: -2, 
            right: -2, 
            width: 8, 
            height: 8, 
            background: 'var(--accent-danger)', 
            borderRadius: '50%' 
          }} />
        </div>
        <div className="glass" style={{ padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}>
          <User size={20} />
        </div>
      </div>
    </nav>
  );
}
