const OPTIONS = [
  ['safest', 'Safest route', 'Prioritize lower predicted risk'],
  ['balanced', 'Balanced route', 'Trade off risk and travel time'],
  ['fastest', 'Fastest route', 'Prioritize estimated travel time'],
]

export default function RoutePlanner({ start, end, setStart, setEnd, option, setOption, onGenerate, loading, comparison }) {
  const swap = () => { setStart(end); setEnd(start) }
  return (
    <section className="planner-card glass-card">
      <div className="eyebrow">ROUTE PLANNER</div>
      <div className="planner-title-row"><div><h2>Plan a safer journey</h2><p>Compare routes using your accident-risk model.</p></div><span className="ai-orb">AI</span></div>
      <div className="route-inputs">
        <label className="location-field"><span className="field-dot start-dot">A</span><span><small>START</small><input value={start} onChange={e => setStart(e.target.value)} placeholder="e.g. San Diego Airport" /></span></label>
        <button type="button" className="swap-button" onClick={swap} aria-label="Swap locations">↕</button>
        <label className="location-field"><span className="field-dot end-dot">B</span><span><small>DESTINATION</small><input value={end} onChange={e => setEnd(e.target.value)} placeholder="e.g. Balboa Park" /></span></label>
      </div>
      <div className="planner-divider" />
      <div className="section-label">Choose your priority</div>
      <div className="route-options">
        {OPTIONS.map(([key, title, desc]) => {
          const unavailable = comparison && comparison[key] == null
          return <button type="button" key={key} className={`route-option ${option === key ? 'selected' : ''} ${unavailable ? 'disabled' : ''}`} disabled={unavailable} onClick={() => setOption(key)}>
            <span className={`option-radio ${option === key ? 'checked' : ''}`} />
            <span><b>{title}</b><small>{desc}</small></span>
          </button>
        })}
      </div>
      <button className="primary-cta" onClick={onGenerate} disabled={loading || !start.trim() || !end.trim()}>
        <span>{loading ? 'Analyzing routes…' : 'Analyze route'}</span><span>→</span>
      </button>
      <p className="planner-note">Historical accident risk • San Diego area • No live traffic input</p>
    </section>
  )
}
