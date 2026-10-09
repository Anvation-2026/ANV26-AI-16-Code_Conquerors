import { useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import RoutePlanner from './components/RoutePlanner'
import RiskLegend from './components/RiskLegend'
import MapLayers from './components/MapLayers'
import MapView from './components/MapView'
import SegmentTable from './components/SegmentTable'
import RouteRiskAnalysis from './components/RouteRiskAnalysis'
import { explain, getHealth, getModelInfo, getRouteRisk } from './services/api'

export default function App() {
  const [start,setStart]=useState(''),[end,setEnd]=useState(''),[option,setOption]=useState('safest')
  const [analysis,setAnalysis]=useState(null),[routeIndex,setRouteIndex]=useState(0),[selectedId,setSelectedId]=useState(null)
  const [layers,setLayers]=useState({all:true,Moderate:false,High:false,Critical:false})
  const [loading,setLoading]=useState(false),[error,setError]=useState(null)
  const [shap,setShap]=useState(null),[shapLoading,setShapLoading]=useState(false)
  const [modelReady,setModelReady]=useState(false),[modelInfo,setModelInfo]=useState(null)

  useEffect(()=>{
    Promise.all([getHealth(),getModelInfo()])
      .then(([h,m])=>{setModelReady(!!h.model_loaded);setModelInfo(m)})
      .catch(()=>setModelReady(false))
  },[])

  const generate=async()=>{
    setLoading(true);setError(null);setSelectedId(null);setShap(null)
    try{
      const a=await getRouteRisk(start.trim(),end.trim())
      setAnalysis(a)
      setRouteIndex(a.comparison[option] ?? a.comparison.safest)
    }catch(e){
      setError(e.message);setAnalysis(null)
    }finally{setLoading(false)}
  }

  useEffect(()=>{
    if(analysis && analysis.comparison[option]!=null){
      setRouteIndex(analysis.comparison[option]);setSelectedId(null)
    }
  },[option,analysis])

  useEffect(()=>{
    if(!analysis)return
    let cancelled=false
    setShapLoading(true)
    explain(analysis.analysis_id,routeIndex,selectedId)
      .then(d=>{if(!cancelled)setShap(d)})
      .catch(e=>{if(!cancelled){setShap(null);setError(e.message)}})
      .finally(()=>{if(!cancelled)setShapLoading(false)})
    return()=>{cancelled=true}
  },[analysis,routeIndex,selectedId])

  const route=analysis?.routes[routeIndex]
  const selectedSegment=route?.segments.find(s=>s.id===selectedId)||null
  const visibleStats=useMemo(()=>route?.summary||null,[route])

  return (
    <div className="app dashboard-only">
      <Navbar />
      {error && <button className="error-banner" onClick={()=>setError(null)}>⚠ {error}<span>Dismiss</span></button>}

      <div className="app-toolbar dashboard-toolbar">
        <div>
          <span className="eyebrow">SAFE ROUTE INTELLIGENCE</span>
          <h1>Plan a safer route</h1>
          <p className="toolbar-subtitle">Compare routes, inspect risk segments, and understand the AI prediction.</p>
        </div>
        <div className="toolbar-status">
          <span className={modelReady?'status-dot ready':'status-dot'} />
          {modelReady?'AI model ready':'Model unavailable'}
          {modelInfo?.algorithm && <span className="model-chip">{modelInfo.algorithm}</span>}
        </div>
      </div>

      <section className="route-planner-strip">
        <RoutePlanner
          {...{start,end,setStart,setEnd,option,setOption,loading}}
          onGenerate={generate}
          comparison={analysis?.comparison}
        />
      </section>

      <div className="dashboard-workspace">
        <main className="dashboard-main">
          <div className="map-shell">
            <div className="map-topbar">
              <div>
                <span className="eyebrow">INTERACTIVE MAP</span>
                <b>{analysis ? `${start} → ${end}` : 'Enter a start and destination above'}</b>
              </div>
              {analysis && <div className="map-pills">
                <span>{visibleStats?.n_segments} segments</span>
                <span>{visibleStats?.segments_with_history} with history</span>
              </div>}
            </div>
            <MapView
              analysis={analysis}
              routeIndex={routeIndex}
              setRouteIndex={i=>{setRouteIndex(i);setSelectedId(null)}}
              layers={layers}
              selectedId={selectedId}
              onSelectSegment={setSelectedId}
            />
          </div>

          <div className="map-tools-row">
            <RiskLegend />
            <MapLayers layers={layers} setLayers={setLayers} />
          </div>

          <SegmentTable
            segments={route?.segments}
            selectedId={selectedId}
            onSelect={setSelectedId}
            layers={layers}
          />
        </main>

        <RouteRiskAnalysis
          analysis={analysis}
          routeIndex={routeIndex}
          setRouteIndex={i=>{setRouteIndex(i);setSelectedId(null)}}
          selectedSegment={selectedSegment}
          shap={shap}
          shapLoading={shapLoading}
          shapScope={selectedSegment?`Segment ${selectedSegment.id}`:'Whole route'}
        />
      </div>
    </div>
  )
}
