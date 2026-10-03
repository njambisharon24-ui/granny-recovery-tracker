import { NavLink, Outlet } from 'react-router-dom'
import { navItems } from '../data'

function AppLayout({ onLogout, user }) {
  const today = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const displayName = user?.name || 'Caregiver'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Caregiver support</p>
          <h1>Granny Recovery Tracker</h1>
        </div>
        <div className="header-pills">
          <span className="pill soft">Today • {today}</span>
          <span className="pill accent">{displayName}</span>
          <button type="button" className="logout-button" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <nav className="nav-grid" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-button active' : 'nav-button')}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
