import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, Phone, History, User as UserIcon, Settings,
  LogOut, Menu, X, Shield, Radio, Users, ScrollText, Siren,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
}

interface SidebarLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  badge?: ReactNode;
}

export function SidebarLayout({ children, navItems, title, badge }: SidebarLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (to: string) => {
    if (to === '/dashboard' || to === '/responder') return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-navy-800 bg-navy-900/40 backdrop-blur-md">
        <SidebarContent
          navItems={navItems}
          title={title}
          badge={badge}
          isActive={isActive}
          profile={profile}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 border-r border-navy-800 bg-navy-900 lg:hidden animate-slide-in-right">
            <SidebarContent
              navItems={navItems}
              title={title}
              badge={badge}
              isActive={isActive}
              profile={profile}
              onSignOut={handleSignOut}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between border-b border-navy-800 bg-navy-900/60 px-4 py-3 backdrop-blur-md">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-navy-200 hover:text-white"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-sm font-bold text-white">{title}</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  navItems, title, badge, isActive, profile, onSignOut, onClose,
}: {
  navItems: NavItem[];
  title: string;
  badge?: ReactNode;
  isActive: (to: string) => boolean;
  profile: { name: string; role: string; email?: string } | null;
  onSignOut: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-navy-800 px-5 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-info-500 to-info-700">
            <Siren className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Silent Trigger</p>
            <p className="text-[10px] text-navy-400 uppercase tracking-wider">{title}</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-navy-400 hover:text-white lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {badge && <div className="px-3 pt-3">{badge}</div>}

      <nav className="flex-1 space-y-1 px-3 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-info-600/20 text-info-400 border-l-2 border-info-500'
                  : 'text-navy-300 hover:bg-navy-800/50 hover:text-navy-100'
              )}
            >
              <Icon className="h-4.5 w-4.5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-navy-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-navy-100">
            {profile?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-navy-100 truncate">{profile?.name}</p>
            <p className="text-[10px] text-navy-400 uppercase">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-300 hover:bg-emergency-500/10 hover:text-emergency-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export function UserSidebarLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      title="User Portal"
      navItems={[
        { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { label: 'My Device', to: '/device', icon: Cpu },
        { label: 'Emergency Contacts', to: '/contacts', icon: Phone },
        { label: 'Incident History', to: '/incidents', icon: History },
        { label: 'Profile', to: '/profile', icon: UserIcon },
        { label: 'Settings', to: '/settings', icon: Settings },
      ]}
    >
      {children}
    </SidebarLayout>
  );
}

export function ResponderSidebarLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      title="Response Center"
      navItems={[
        { label: 'Emergency Center', to: '/responder', icon: Radio },
        { label: 'Active Incidents', to: '/responder/active', icon: Siren },
        { label: 'Resolved Incidents', to: '/responder/resolved', icon: History },
        { label: 'Users', to: '/responder/users', icon: Users },
        { label: 'Devices', to: '/responder/devices', icon: Cpu },
        { label: 'Activity Logs', to: '/responder/logs', icon: ScrollText },
      ]}
    >
      {children}
    </SidebarLayout>
  );
}
