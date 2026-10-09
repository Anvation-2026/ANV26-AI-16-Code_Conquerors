import { LEVEL_COLORS } from './common'
const ROLES = [['safest', 'Safest route', 'shield'], ['balanced', 'Balanced route', 'balance'], ['fastest', 'Fastest route', 'bolt']]
export default function RouteComparison({ analysis, routeIndex, setRouteIndex }) {
  if (!analysis) return null
  const { comparison, routes } = analysis
  return <div className="compare-block"><div className="section-heading"><div><span className="eyebrow">OPTIONS</span><h3>Choose your route</h3></div><span className="route-count">{routes.length} route{routes.length !== 1 ? 's' : ''}</span></div>
    <div className="compare-list">{ROLES.map(([k, title, icon]) => {
      const i = comparison[k]
      if (i == null) return <div className="compare-card unavailable" key={k}><div><b>{title}</b><small>Not available from routing service</small></div></div>
      const s = routes[i].summary
      return <button type="button" className={`compare-card ${i === routeIndex ? 'active' : ''}`} key={k} onClick={() => setRouteIndex(i)}>
        <span className="compare-icon">{icon === 'shield' ? '✓' : icon === 'balance' ? '↔' : '⚡'}</span>
        <span className="compare-main"><b>{title}</b><small>{s.distance_mi} mi · {s.estimated_time_min} min</small></span>
        <span className="compare-risk" style={{ color: LEVEL_COLORS[s.risk_level] }}><strong>{s.risk_score}</strong><small>{s.risk_level}</small></span>
      </button>
    })}</div>
  </div>
}
