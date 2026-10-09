export default function SHAPPanel({ shap, loading, scopeLabel }) {
  if (loading) return <section className="insight-card"><div className="section-heading"><div><span className="eyebrow">EXPLAINABLE AI</span><h3>Why this risk?</h3></div><span className="shap-badge">SHAP</span></div><div className="skeleton-list">{[1,2,3,4].map(i => <div className="skeleton" key={i} />)}</div></section>
  if (!shap) return <section className="insight-card"><div className="section-heading"><div><span className="eyebrow">EXPLAINABLE AI</span><h3>Why this risk?</h3></div><span className="shap-badge">SHAP</span></div><p className="muted">Generate a route to see the model's strongest contributing factors.</p></section>
  const max = Math.max(...shap.factors.map(f => Math.abs(f.shap_value)), 1e-9)
  return <section className="insight-card"><div className="section-heading"><div><span className="eyebrow">EXPLAINABLE AI</span><h3>Why this risk?</h3></div><span className="shap-badge">SHAP</span></div><p className="subtle">{scopeLabel} · {shap.units}</p>
    <div className="shap-list">{shap.factors.map(f => <div className="shap-row" key={f.feature}>
      <div className="shap-name"><span>{f.label}</span>{f.value != null && <small>{String(f.value)}</small>}</div>
      <div className="shap-track"><div className={`shap-bar ${f.shap_value > 0 ? 'up' : 'down'}`} style={{ width: `${Math.max(5, Math.abs(f.shap_value) / max * 100)}%` }} /></div>
      <b className={f.shap_value > 0 ? 'positive' : 'negative'}>{f.shap_value > 0 ? '+' : ''}{f.shap_value.toFixed(3)}</b>
    </div>)}</div>
    <div className="shap-key"><span><i className="dot up" /> increases risk</span><span><i className="dot down" /> decreases risk</span></div>
  </section>
}
