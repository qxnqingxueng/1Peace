import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Map from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import DeckGL from '@deck.gl/react';
import { ColumnLayer, PolygonLayer, ScatterplotLayer, PathLayer } from '@deck.gl/layers';

const INITIAL_VIEW_STATE = {
  longitude: 100.3696,
  latitude: 5.3941,
  zoom: 12,
  pitch: 45,
  bearing: 0,
};

/* ── PEACE MODE DATA ────────────────────────────────────────────────────── */
const peaceData = [
  { name: 'Klinik A', coordinates: [100.3700, 5.4000], impactScore: 80 },
  { name: 'Klinik B', coordinates: [100.3850, 5.3850], impactScore: 45 },
  { name: 'Klinik C', coordinates: [100.3550, 5.3900], impactScore: 60 },
];

/* ── CRISIS MODE DATA (hardcoded, Butterworth / Penang) ─────────────────── */
const FLOOD_ZONES = [{
  polygon: [
    [100.360, 5.390], [100.375, 5.395],
    [100.380, 5.385], [100.365, 5.380],
    [100.360, 5.390],
  ],
}];

// 3 PPS shelters — index matches selectedPPS in CrisisOpsPage
const PPS_POINTS = [
  { name: 'SK Butterworth 1',            coordinates: [100.395, 5.410] },
  { name: 'Dewan Masyarakat Butterworth', coordinates: [100.350, 5.375] },
  { name: 'Masjid Jamek Butterworth',    coordinates: [100.400, 5.380] },
];

// One escape route path per PPS shelter
const ESCAPE_ROUTES = [
  { path: [[100.362, 5.388], [100.358, 5.395], [100.365, 5.402], [100.395, 5.410]] },
  { path: [[100.362, 5.388], [100.360, 5.383], [100.355, 5.378], [100.350, 5.375]] },
  { path: [[100.362, 5.388], [100.368, 5.385], [100.382, 5.382], [100.400, 5.380]] },
];

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENT
   Props:
     appMode     'PEACE' | 'CRISIS'
     selectedPPS  0 | 1 | 2   — which PPS is active (CRISIS only)
     layers       { flood, pps, route, radar, road }  — layer visibility flags
───────────────────────────────────────────────────────────────────────── */
export default function MapDashboard({ appMode = 'PEACE', selectedPPS = 0, layers = {} }) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [tooltip, setTooltip]     = useState(null);
  const [time, setTime]           = useState(0);

  // Pulse animation for CRISIS mode
  useEffect(() => {
    if (appMode !== 'CRISIS') return undefined;
    let frame;
    const tick = () => { setTime((t) => (t + 1) % 100); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [appMode]);

  const handleClick = useCallback(
    (info) => {
      if (appMode !== 'CRISIS' || !info.coordinate) return setTooltip(null);
      setTooltip({
        x: info.x, y: info.y,
        data: {
          density:  'High (1,200 ppl/km²)',
          depth:    `${(Math.random() * 1.5 + 0.3).toFixed(1)}m`,
          capacity: `${Math.floor(Math.random() * 40 + 60)}%`,
          latency:  '42ms',
        },
      });
      setTimeout(() => setTooltip(null), 5000);
    },
    [appMode],
  );

  const deckLayers = useMemo(() => {
    if (appMode === 'PEACE') {
      return [
        new ColumnLayer({
          id: 'policy-impact',
          data: peaceData,
          diskResolution: 12,
          radius: 150,
          extruded: true,
          pickable: true,
          elevationScale: 50,
          getPosition: (d) => d.coordinates,
          getFillColor: [255, 204, 0, 200],
          getElevation: (d) => d.impactScore,
          transitions: { getElevation: 1000 },
        }),
      ];
    }

    if (appMode === 'CRISIS') {
      const pulse = 1 + Math.sin((time / 100) * Math.PI * 2) * 0.5;
      const result = [];

      if (layers.flood !== false) {
        result.push(
          new PolygonLayer({
            id: 'flood-zone',
            data: FLOOD_ZONES,
            pickable: true,
            stroked: true,
            filled: true,
            getPolygon: (d) => d.polygon,
            getFillColor: [0, 100, 255, 140],
            getLineColor: [0, 80, 200, 255],
            lineWidthMinPixels: 1,
          }),
        );
      }

      if (layers.pps !== false) {
        result.push(
          new ScatterplotLayer({
            id: 'pps-centers',
            data: PPS_POINTS,
            pickable: true,
            opacity: 0.9,
            stroked: true,
            filled: true,
            // selected PPS pulses larger; others stay static
            radiusScale: 6,
            radiusMinPixels: 5,
            radiusMaxPixels: 55,
            lineWidthMinPixels: 2,
            getPosition: (d) => d.coordinates,
            getRadius: (d, { index }) =>
              index === selectedPPS ? 18 * pulse : 10,
            getFillColor: (d, { index }) =>
              index === selectedPPS ? [34, 197, 94, 220] : [237, 28, 36, 180],
            getLineColor: [255, 255, 255],
            updateTriggers: { getRadius: [time, selectedPPS], getFillColor: [selectedPPS] },
          }),
        );
      }

      if (layers.route !== false) {
        result.push(
          new PathLayer({
            id: 'escape-route',
            data: [ESCAPE_ROUTES[selectedPPS]],
            pickable: false,
            widthScale: 20,
            widthMinPixels: 3,
            getPath: (d) => d.path,
            getColor: [255, 204, 0, 240],
            getWidth: () => 3,
          }),
        );
      }

      return result;
    }

    return [];
  }, [appMode, time, selectedPPS, layers]);

  return (
    <div className="relative h-full w-full bg-[#06101e] font-crisis antialiased">
      <DeckGL
        layers={deckLayers}
        initialViewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller
        onClick={handleClick}
      >
        <Map
          reuseMaps
          mapLib={maplibregl}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        />
      </DeckGL>

      {/* Click-to-query tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none rounded-2xl border border-[#FFA62B]/50 bg-[#2E5AA7]/90 p-4 text-white shadow-[0_0_28px_rgba(255,166,43,0.22)] backdrop-blur-md"
          style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
        >
          <div className="mb-2 flex items-center gap-2 border-b border-white/15 pb-2">
            <div className="h-2 w-2 rounded-full bg-[#F8E6A0] animate-pulse" />
            <h4 className="text-sm font-bold text-white/90 uppercase tracking-wider">Live Ops Insight</h4>
            <span className="ml-auto text-xs text-[#F8E6A0]">{tooltip.data.latency}</span>
          </div>
          <ul className="space-y-1 text-sm text-white/75">
            <li><span className="font-semibold text-white/60">Density:</span> {tooltip.data.density}</li>
            <li><span className="font-semibold text-white/60">Water Depth:</span> <span className="font-bold text-[#FFA62B]">{tooltip.data.depth}</span></li>
            <li><span className="font-semibold text-white/60">PPS Capacity:</span> <span className="text-[#F8E6A0]">{tooltip.data.capacity}</span></li>
          </ul>
        </div>
      )}
    </div>
  );
}
