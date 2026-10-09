import { LEVEL_BG, LEVEL_COLORS } from './common'
export default function SegmentTable({ segments, selectedId, onSelect, layers }) {
  const rows = (segments || []).filter(s => layers.all || layers[s.risk_level])
  return <section className="segments-card"><div className="section-heading"><div><span className="eyebrow">ROUTE DETAILS</span><h3>Segment risk</h3></div><span className="route-count">{rows.length} visible</span></div>
    <div className="segment-list">{rows.length === 0 && <p className="muted empty-state">No segments to display yet.</p>}{rows.map(s => <button type="button" key={s.id} className={`segment-row ${s.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(s.id)}>
      <span className="segment-number">{s.index}</span><span className="segment-road"><b>{s.road_name || 'Unnamed road'}</b><small>{s.from_to}</small></span><span className="segment-history">{s.accidents_nearby} history</span><span className="segment-score" style={{ color: LEVEL_COLORS[s.risk_level] }}>{s.risk_score}</span><span className="badge" style={{ background: LEVEL_BG[s.risk_level], color: LEVEL_COLORS[s.risk_level] }}>{s.risk_level}</span>
    </button>)}</div>
  </section>
}
