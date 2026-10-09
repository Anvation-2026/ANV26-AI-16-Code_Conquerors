export default function MapLayers({ layers, setLayers }) {
  const set = k => e => setLayers({ ...layers, [k]: e.target.checked })
  return <section className="layer-card"><div className="section-heading"><div><span className="eyebrow">MAP FILTERS</span><h3>Risk layers</h3></div></div>
    <label className="switch-row"><span><b>All route segments</b><small>Show every predicted risk</small></span><input type="checkbox" checked={layers.all} onChange={set('all')} /></label>
    {['Moderate','High','Critical'].map(k => <label className="switch-row" key={k}><span><b>{k} risk</b><small>Highlight {k.toLowerCase()} segments</small></span><input type="checkbox" checked={layers[k]} disabled={layers.all} onChange={set(k)} /></label>)}
  </section>
}
