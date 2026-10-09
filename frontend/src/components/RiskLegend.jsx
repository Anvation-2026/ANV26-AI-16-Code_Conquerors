import { LEVEL_COLORS } from './common'
const ITEMS = [['Low','0–25'],['Moderate','26–50'],['High','51–75'],['Critical','76–100']]
export default function RiskLegend(){ return <section className="legend-card"><div className="section-heading"><div><span className="eyebrow">RISK SCALE</span><h3>Predicted historical risk</h3></div></div><div className="legend-grid">{ITEMS.map(([k,r])=><div className="legend-item" key={k}><i style={{background:LEVEL_COLORS[k]}}/><span><b>{k}</b><small>{r}</small></span></div>)}</div></section> }
