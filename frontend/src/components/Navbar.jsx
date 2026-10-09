function Icon({ name, size = 18 }) {
  const paths = {
    shield: <><path d="M12 3l7 3v5c0 4.4-2.7 8.1-7 10-4.3-1.9-7-5.6-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="brand" aria-label="SafeRouteAI">
        <span className="brand-mark"><Icon name="shield" size={20} /></span>
        <span>Safe<span>Route</span><em>AI</em></span>
      </div>
      <div className="nav-center">
        <span className="nav-chip">AI route intelligence</span>
        <span className="nav-chip">Historical accident data</span>
        <span className="nav-chip">Explainable risk</span>
      </div>
      <div className="nav-right">
        <span className="location-pill">● Historical-risk mode</span>
        <div className="info-button" aria-label="About SafeRouteAI"><Icon name="info" size={17} /></div>
      </div>
    </header>
  )
}
