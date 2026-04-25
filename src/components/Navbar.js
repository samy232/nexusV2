"use client";
import { Search, Bell, User, Wallet, LogIn } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePriceFeed } from "@/hooks/usePriceFeed";

export default function Navbar() {
  const { data: session } = useSession();
  const { price, change } = usePriceFeed();

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
          gap: '1rem', 
          padding: '0.5rem 1.5rem',
          fontSize: '0.875rem'
        }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>BTC/USDT</span>
          <span style={{ 
            color: change >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)',
            fontWeight: '700',
            fontFamily: 'monospace'
          }}>
            ${price?.toLocaleString() || '---'}
          </span>
          <span style={{ 
            fontSize: '0.75rem',
            color: change >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)',
            opacity: 0.8
          }}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {session ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
              <Wallet size={18} />
              <span style={{ fontWeight: '600' }}>${session.user.balance?.toLocaleString() || '0.00'}</span>
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
            <div className="glass" style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => signOut()}>
              <User size={20} />
              <span style={{ fontSize: '0.875rem' }}>{session.user.name || session.user.email}</span>
            </div>
          </>
        ) : (
          <button 
            onClick={() => signIn()}
            className="glass" 
            style={{ 
              padding: '0.5rem 1rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer',
              color: 'var(--accent-primary)',
              fontWeight: '600'
            }}
          >
            <LogIn size={18} />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
