import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Map from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import DeckGL from '@deck.gl/react';
import { ColumnLayer, PolygonLayer, ScatterplotLayer, PathLayer } from '@deck.gl/layers';

const INITIAL_VIEW_STATE = { longitude: 100.3696, latitude: 5.3941, zoom: 12, pitch: 45, bearing: 0 };

const peaceData = [
  { name: 'Klinik A', coordinates: [100.3700, 5.4000], impactScore: 80 },
  { name: 'Klinik B', coordinates: [100.3850, 5.3850], impactScore: 45 },
  { name: 'Klinik C', coordinates: [100.3550, 5.3900], impactScore: 60 }
];

const crisisFloodData = [{
  polygon: [[100.360, 5.390], [100.375, 5.395], [100.380, 5.385], [100.365, 5.380], [100.360, 5.390]]
}];

const crisisPPSData = [
  { name: 'PPS Sekolah Kebangsaan A', coordinates: [100.395, 5.410] },
  { name: 'PPS Dewan Masyarakat B', coordinates: [100.350, 5.375] },
  { name: 'PPS Masjid C', coordinates: [100.400, 5.380] }
];

const crisisRouteData = [{
  path: [[100.362, 5.388], [100.358, 5.395], [100.355, 5.405], [100.395, 5.410]]
}];

export default function MapDashboard({ appMode = 'PEACE' }) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [tooltip, setTooltip] = useState(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrame;
    const animate = () => { setTime(t => (t + 1) % 100); animationFrame = requestAnimationFrame(animate); };
    if (appMode === 'CRISIS') animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [appMode]);

  const handleMapClick = useCallback((info) => {
    if (appMode !== 'CRISIS' || !info.coordinate) return setTooltip(null);
    setTooltip({
      x: info.x, y: info.y,
      data: {
        density: "High (1,200 ppl/km²)",
        waterDepth: `${(Math.random() * 1.5 + 0.3).toFixed(1)}m`,
        nearestPpsCapacity: `${Math.floor(Math.random() * 40 + 60)}%`,
        latency: "42ms"
      }
    });
    setTimeout(() => setTooltip(null), 5000);
  }, [appMode]);

  const layers = useMemo(() => {
    if (appMode === 'PEACE') {
      return [
        new ColumnLayer({
          id: 'policy-impact', data: peaceData, diskResolution: 12, radius: 150, extruded: true,
          pickable: true, elevationScale: 50, getPosition: d => d.coordinates,
          getFillColor: [255, 204, 0, 200], getElevation: d => d.impactScore,
          transitions: { getElevation: 1000 }
        })
      ];
    } 
    if (appMode === 'CRISIS') {
      const pulseMultiplier = 1 + Math.sin((time / 100) * Math.PI * 2) * 0.5;
      return [
        new PolygonLayer({
          id: 'flood-zone', data: crisisFloodData, pickable: true, stroked: true, filled: true,
          getPolygon: d => d.polygon, getFillColor: [0, 100, 255, 150], getLineColor: [0, 50, 150, 255], lineWidthMinPixels: 1,
        }),
        new ScatterplotLayer({
          id: 'pps-centers', data: crisisPPSData, pickable: true, opacity: 0.8, stroked: true, filled: true,
          radiusScale: 100 * pulseMultiplier, radiusMinPixels: 5, radiusMaxPixels: 50, lineWidthMinPixels: 2,
          getPosition: d => d.coordinates, getFillColor: [237, 28, 36, 200], getLineColor: [255, 255, 255],
          updateTriggers: { getRadius: [time] }
        }),
        new PathLayer({
          id: 'escape-route', data: crisisRouteData, pickable: true, widthScale: 20, widthMinPixels: 2,
          getPath: d => d.path, getColor: [255, 204, 0, 255], getWidth: () => 2
        })
      ];
    }
    return [];
  }, [appMode, time]);

  return (
    <div className="relative h-[78vh] w-full bg-[#86C5FF] font-crisis antialiased">
      <DeckGL layers={layers} initialViewState={viewState} onViewStateChange={({ viewState }) => setViewState(viewState)} controller={true} onClick={handleMapClick}>
        <Map
          reuseMaps
          mapLib={maplibregl}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        />
      </DeckGL>
      {tooltip && (
        <div className="absolute z-50 pointer-events-none rounded-2xl border border-[#FFA62B]/50 bg-[#2E5AA7]/90 p-4 text-white shadow-[0_0_28px_rgba(255,166,43,0.22)] backdrop-blur-md transition-all duration-300 ease-out" style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}>
          <div className="mb-2 flex items-center gap-2 border-b border-white/15 pb-2">
            <div className="h-2 w-2 rounded-full bg-[#F8E6A0] animate-pulse"></div>
            <h4 className="text-sm font-bold text-white/90 uppercase tracking-wider">Live Ops Insight</h4>
            <span className="ml-auto text-xs text-[#F8E6A0]">{tooltip.data.latency}</span>
          </div>
          <ul className="space-y-1 text-sm text-white/75">
            <li><span className="font-semibold text-white/60">Density:</span> {tooltip.data.density}</li>
            <li><span className="font-semibold text-white/60">Water Depth:</span> <span className="font-bold text-[#FFA62B]">{tooltip.data.waterDepth}</span></li>
            <li><span className="font-semibold text-white/60">PPS Capacity:</span> <span className="text-[#F8E6A0]">{tooltip.data.nearestPpsCapacity}</span></li>
          </ul>
        </div>
      )}
    </div>
  );
}
