import { LEVEL_COLORS } from './common'
import RouteComparison from './RouteComparison'
import SHAPPanel from './SHAPPanel'

function RiskRing({ score, level }) {
  const pct = Math.max(0, Math.min(100, Number(score) || 0))
  const r = 50, c = 2 * Math.PI * r, dash = c * pct / 100
  return <div className="risk-ring-wrap"><svg className="risk-ring" viewBox="0 0 120 120"><circle className="ring-bg" cx="60" cy="60" r={r}/><circle className="ring-progress" cx="60" cy="60" r={r} stroke={LEVEL_COLORS[level]} strokeDasharray={`${dash} ${c-dash}`} /></svg><div className="ring-value"><strong>{score}</strong><small>/100</small></div></div>
}

export default function RouteRiskAnalysis({ analysis, routeIndex, setRouteIndex, selectedSegment, shap, shapLoading, shapScope }) {
  if (!analysis) return <aside className="right-column"><section className="empty-analysis"><span className="empty-icon">✦</span><span className="eyebrow">AI RISK ANALYSIS</span><h2>Your route, explained.</h2><p>Enter two San Diego locations to generate routes, compare risk and inspect the model's reasoning.</p><div className="empty-steps"><span>01 · Plan</span><span>02 · Compare</span><span>03 · Explain</span></div></section><SHAPPanel shap={null} /></aside>
  const r = analysis.routes[routeIndex], s = r.summary
  const seg = selectedSegment || r.segments.find(x => x.id === s.highest_risk_segment.id)
  return <aside className="right-column">
    <section className="risk-hero-card">
      <div className="section-heading"><div><span className="eyebrow">AI ROUTE RISK</span><h2>Risk overview</h2></div><span className="live-pill"><i /> model ready</span></div>
      <div className="risk-hero-main"><RiskRing score={s.risk_score} level={s.risk_level}/><div className="risk-copy"><span className="risk-label" style={{color:LEVEL_COLORS[s.risk_level]}}>{s.risk_level} risk</span><p>Estimated historical accident risk for this route.</p><div className="mini-stats"><span><b>{s.n_segments}</b>segments</span><span><b>{s.high_risk_segments}</b>high risk</span><span><b>{s.segments_with_history}</b>matched history</span></div></div></div>
      <div className="metric-strip"><div><small>DISTANCE</small><b>{s.distance_mi} mi</b></div><div><small>TIME</small><b>{s.estimated_time_min} min</b></div><div><small>AVG. SEGMENT</small><b>{s.average_segment_risk}</b></div></div>
      <RouteComparison analysis={analysis} routeIndex={routeIndex} setRouteIndex={setRouteIndex}/>
    </section>

    <section className="hotspot-card"><div className="hotspot-icon">!</div><div><span className="eyebrow">HIGHEST-RISK SEGMENT</span><h3>{seg.road_name || `Segment ${seg.id}`}</h3><p>{seg.accidents_nearby} historical accidents nearby · predicted score <strong>{seg.risk_score}</strong></p></div><button type="button" onClick={() => document.getElementById(`segment-${seg.id}`)?.scrollIntoView({behavior:'smooth',block:'center'})}>View</button></section>

    <section className="detail-card"><div className="section-heading"><div><span className="eyebrow">SELECTED SEGMENT</span><h3>{selectedSegment ? `Segment ${selectedSegment.id}` : 'Highest-risk segment'}</h3></div><span className="badge" style={{background:`color-mix(in srgb, ${LEVEL_COLORS[seg.risk_level]} 14%, white)`, color:LEVEL_COLORS[seg.risk_level]}}>{seg.risk_level}</span></div><div className="detail-grid"><div><small>ROAD</small><b>{seg.road_name || 'Unnamed'}</b></div><div><small>RISK SCORE</small><b>{seg.risk_score}/100</b></div><div><small>HISTORY</small><b>{seg.accidents_nearby}</b></div><div><small>SEVERITY</small><b>{seg.predicted_severity}</b></div></div>{!seg.has_history && <p className="warning-note">No historical accidents matched this segment. The score reflects modeled road/context features.</p>}</section>

    <SHAPPanel shap={shap} loading={shapLoading} scopeLabel={shapScope}/>
    <p className="disclaimer">{analysis.disclaimer}</p>
  </aside>
}
