import { useMemo, useState, type ReactNode } from 'react';
import {
  createImpactMapPayload,
  RADIUS_OPTIONS,
  SCENARIO_OPTIONS,
  TIMEFRAME_CONFIG,
  TIMEFRAME_ORDER,
  type ImpactMapLineSeries,
  type ImpactMapPayload,
  type ImpactMapPoint,
  type ImpactMapUnit,
  type ScenarioType,
  type Timeframe,
} from '../../services/impactMapSimulation';

type DashboardProps = {
  payload: ImpactMapPayload;
};

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

type DashboardPanelProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

type ChartSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

type TabsProps = {
  value: Timeframe;
  onChange: (next: Timeframe) => void;
};

const palette = {
  accent: '#FFA62B',
  primary: '#2E5AA7',
  primaryDeep: '#1E3F80',
  secondary: '#86C5FF',
};

const VIEWBOX_WIDTH = 700;
const VIEWBOX_HEIGHT = 420;
const TILE_WIDTH = 86;
const TILE_HEIGHT = 43;
const ORIGIN_X = 350;
const ORIGIN_Y = 112;

function cn(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ');
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((segment) => `${segment}${segment}`).join('')
    : normalized;
  const number = Number.parseInt(full, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  };
}

function mixHex(left: string, right: string, ratio: number) {
  const amount = clamp(ratio, 0, 1);
  const leftRgb = hexToRgb(left);
  const rightRgb = hexToRgb(right);
  const r = Math.round(leftRgb.r + (rightRgb.r - leftRgb.r) * amount);
  const g = Math.round(leftRgb.g + (rightRgb.g - leftRgb.g) * amount);
  const b = Math.round(leftRgb.b + (rightRgb.b - leftRgb.b) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function isoPoint(x: number, y: number, z = 0) {
  return {
    x: ORIGIN_X + (x - y) * (TILE_WIDTH / 2),
    y: ORIGIN_Y + (x + y) * (TILE_HEIGHT / 2) - z,
  };
}

function pointString(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function severityCopy(severity: ImpactMapUnit['currentSeverity']) {
  if (severity === 'critical') return 'Critical';
  if (severity === 'high') return 'High';
  if (severity === 'watch') return 'Watch';
  return 'Stable';
}

function chartY(height: number, maxValue: number, value: number) {
  return height - (value / Math.max(maxValue, 1)) * height;
}

function sampleLabels(values: Array<{ label: string; value: number }>) {
  const step = values.length <= 6 ? 1 : values.length <= 12 ? 2 : 5;
  return values.map((entry, index) => ({ entry, visible: index % step === 0 || index === values.length - 1 }));
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/20 bg-white/10 backdrop-blur-[16px] shadow-[0_18px_48px_rgba(23,48,94,0.2)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({ children, onClick, className, type = 'button' }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'rounded-full bg-[#2E5AA7] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(46,90,167,0.42)] transition duration-300 hover:scale-[1.015] hover:bg-[#244a8f] hover:shadow-[0_16px_32px_rgba(46,90,167,0.52)]',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function CTAButton({ children, onClick, className, type = 'button' }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'relative rounded-full bg-[#FFA62B] px-5 py-2.5 text-sm font-semibold text-[#17305E] shadow-[0_14px_28px_rgba(255,166,43,0.5)] transition duration-300 hover:scale-[1.02] hover:shadow-[0_18px_36px_rgba(255,166,43,0.62)]',
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,211,149,0.4),transparent_70%)] opacity-70" />
      <span className="relative">{children}</span>
    </button>
  );
}

export function SecondaryButton({ children, onClick, className, type = 'button' }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'rounded-full border border-[#86C5FF] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#86C5FF] transition duration-300 hover:bg-[#86C5FF]/12',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DashboardPanel({ title, subtitle, action, children, className }: DashboardPanelProps) {
  return (
    <GlassCard className={cn('p-4 md:p-5', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">{title}</p>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-white/78">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </GlassCard>
  );
}

export function Tabs({ value, onChange }: TabsProps) {
  return (
    <div className="inline-flex rounded-full border border-[#86C5FF]/55 bg-white/8 p-1">
      {TIMEFRAME_ORDER.map((item) => {
        const active = item === value;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition duration-300',
              active
                ? 'bg-[#FFA62B] text-[#17305E] shadow-[0_10px_22px_rgba(255,166,43,0.52)]'
                : 'border border-[#86C5FF]/50 bg-transparent text-[#DDF0FF] hover:bg-[#86C5FF]/18',
            )}
          >
            {TIMEFRAME_CONFIG[item].label}
          </button>
        );
      })}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string | number;
  onChange: (next: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-[172px]">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-white/24 bg-white/12 px-3 text-sm text-white outline-none backdrop-blur-md transition duration-300 hover:bg-white/16 focus:border-[#86C5FF]"
      >
        {children}
      </select>
    </label>
  );
}

export function ChartSection({ title, subtitle, children }: ChartSectionProps) {
  return (
    <DashboardPanel title={title} subtitle={subtitle}>
      {children}
    </DashboardPanel>
  );
}

function renderDetail(unit: ImpactMapUnit, center: { x: number; y: number }, roofNorth: { x: number; y: number }) {
  const accent = unit.style.accent;
  switch (unit.style.detail) {
    case 'cross':
      return (
        <g>
          <rect x={center.x - 2} y={roofNorth.y + 10} width="4" height="16" rx="2" fill={accent} />
          <rect x={center.x - 8} y={roofNorth.y + 16} width="16" height="4" rx="2" fill={accent} />
        </g>
      );
    case 'flag':
      return (
        <g>
          <rect x={center.x - 1} y={roofNorth.y + 6} width="2" height="18" rx="1" fill={accent} />
          <polygon
            points={pointString([
              { x: center.x + 1, y: roofNorth.y + 8 },
              { x: center.x + 12, y: roofNorth.y + 12 },
              { x: center.x + 1, y: roofNorth.y + 16 },
            ])}
            fill={accent}
          />
        </g>
      );
    case 'chimney':
      return (
        <g>
          <rect x={center.x - 10} y={roofNorth.y + 6} width="6" height="18" rx="2" fill={accent} />
          <rect x={center.x + 4} y={roofNorth.y + 4} width="7" height="20" rx="2" fill={accent} />
        </g>
      );
    case 'pump':
      return (
        <g>
          <rect x={center.x - 14} y={roofNorth.y + 11} width="28" height="6" rx="2" fill={accent} />
          <rect x={center.x - 11} y={roofNorth.y + 17} width="3" height="12" rx="1.5" fill={accent} />
          <rect x={center.x + 8} y={roofNorth.y + 17} width="3" height="12" rx="1.5" fill={accent} />
        </g>
      );
    case 'pill':
      return <rect x={center.x - 12} y={roofNorth.y + 12} width="24" height="8" rx="4" fill={accent} />;
    case 'flame':
      return (
        <polygon
          points={pointString([
            { x: center.x, y: roofNorth.y + 4 },
            { x: center.x + 8, y: roofNorth.y + 20 },
            { x: center.x, y: roofNorth.y + 28 },
            { x: center.x - 8, y: roofNorth.y + 20 },
          ])}
          fill={accent}
        />
      );
    case 'shield':
      return (
        <polygon
          points={pointString([
            { x: center.x, y: roofNorth.y + 6 },
            { x: center.x + 10, y: roofNorth.y + 12 },
            { x: center.x + 6, y: roofNorth.y + 24 },
            { x: center.x, y: roofNorth.y + 28 },
            { x: center.x - 6, y: roofNorth.y + 24 },
            { x: center.x - 10, y: roofNorth.y + 12 },
          ])}
          fill={accent}
        />
      );
    case 'rail':
      return (
        <g>
          <rect x={center.x - 11} y={roofNorth.y + 10} width="4" height="15" rx="2" fill={accent} />
          <rect x={center.x + 7} y={roofNorth.y + 10} width="4" height="15" rx="2" fill={accent} />
          <rect x={center.x - 14} y={roofNorth.y + 7} width="28" height="4" rx="2" fill={accent} />
        </g>
      );
    case 'hall':
    default:
      return (
        <polygon
          points={pointString([
            { x: center.x, y: roofNorth.y + 7 },
            { x: center.x + 12, y: roofNorth.y + 18 },
            { x: center.x - 12, y: roofNorth.y + 18 },
          ])}
          fill={accent}
        />
      );
  }
}

function IsometricBuilding({
  unit,
  selected,
  onSelect,
}: {
  unit: ImpactMapUnit;
  selected: boolean;
  onSelect: (unitId: string) => void;
}) {
  const center = isoPoint(unit.slot.x, unit.slot.y);
  const height = unit.currentHeight;
  const width = unit.style.footprint.width;
  const depth = unit.style.footprint.depth;
  const roofNorth = { x: center.x, y: center.y - height - depth / 2 };
  const roofEast = { x: center.x + width / 2, y: center.y - height };
  const roofSouth = { x: center.x, y: center.y - height + depth / 2 };
  const roofWest = { x: center.x - width / 2, y: center.y - height };
  const groundEast = { x: center.x + width / 2, y: center.y };
  const groundSouth = { x: center.x, y: center.y + depth / 2 };
  const groundWest = { x: center.x - width / 2, y: center.y };

  const topFill = mixHex(unit.style.top, unit.currentStatusColor, unit.currentImpact / 130);
  const leftFill = mixHex(unit.style.left, '#162d59', 0.1 + unit.currentImpact / 180);
  const rightFill = mixHex(unit.style.right, '#162d59', 0.08 + unit.currentImpact / 200);

  return (
    <g
      transform={`translate(0 ${unit.dropOffset})`}
      onClick={() => onSelect(unit.id)}
      style={{ cursor: 'pointer', transition: 'transform 320ms ease, opacity 320ms ease' }}
    >
      <ellipse cx={center.x} cy={center.y + 14} rx={width / 1.2} ry={depth / 1.85} fill={selected ? 'rgba(255,166,43,0.3)' : 'rgba(23,48,94,0.26)'} />
      {selected ? (
        <ellipse
          cx={center.x}
          cy={center.y + 14}
          rx={width / 1.02}
          ry={depth / 1.55}
          fill="none"
          stroke={palette.accent}
          strokeWidth="2.4"
          opacity="0.85"
        />
      ) : null}

      <polygon points={pointString([roofWest, roofSouth, groundSouth, groundWest])} fill={leftFill} opacity={unit.brightness} />
      <polygon points={pointString([roofEast, roofSouth, groundSouth, groundEast])} fill={rightFill} opacity={unit.brightness} />
      <polygon points={pointString([roofNorth, roofEast, roofSouth, roofWest])} fill={topFill} opacity={unit.brightness} />
      {renderDetail(unit, center, roofNorth)}

      {unit.warning ? (
        <g>
          <circle cx={center.x + width * 0.3} cy={roofNorth.y + depth / 2 + 2} r="10" fill={palette.accent} stroke={palette.primaryDeep} strokeWidth="2.2" />
          <text x={center.x + width * 0.3} y={roofNorth.y + depth / 2 + 6} textAnchor="middle" fill={palette.primaryDeep} fontSize="11" fontWeight="700">
            !
          </text>
        </g>
      ) : null}
    </g>
  );
}

function IsometricLand({
  units,
  focusedUnitId,
  periodLabel,
  scenarioLabel,
  onSelect,
}: {
  units: ImpactMapUnit[];
  focusedUnitId: string;
  periodLabel: string;
  scenarioLabel: string;
  onSelect: (unitId: string) => void;
}) {
  const orderedUnits = [...units].sort((left, right) => left.slot.x + left.slot.y - (right.slot.x + right.slot.y));
  const topLeft = isoPoint(0.2, 0.7);
  const topRight = isoPoint(4.95, 0.7);
  const bottomRight = isoPoint(4.95, 4.95);
  const bottomLeft = isoPoint(0.2, 4.95);
  const tileDepth = 34;

  return (
    <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="w-full">
      <defs>
        <linearGradient id="landTopPolicy" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#c2e39f" />
          <stop offset="100%" stopColor="#80be7f" />
        </linearGradient>
        <linearGradient id="landSidePolicy" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#4f8f4b" />
          <stop offset="100%" stopColor="#3b7038" />
        </linearGradient>
      </defs>

      {Array.from({ length: 5 }).flatMap((_, x) =>
        Array.from({ length: 5 }).map((__, y) => {
          const a = isoPoint(x + 0.3, y + 0.3);
          const b = isoPoint(x + 1.1, y + 0.3);
          const c = isoPoint(x + 1.1, y + 1.1);
          const d = isoPoint(x + 0.3, y + 1.1);
          return (
            <polygon
              key={`grid-${x}-${y}`}
              points={pointString([a, b, c, d])}
              fill={(x + y) % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          );
        }),
      )}

      <polygon points={pointString([topLeft, topRight, bottomRight, bottomLeft])} fill="url(#landTopPolicy)" />
      <polygon points={pointString([bottomLeft, bottomRight, { x: bottomRight.x, y: bottomRight.y + tileDepth }, { x: bottomLeft.x, y: bottomLeft.y + tileDepth }])} fill="url(#landSidePolicy)" />
      <polygon points={pointString([topLeft, bottomLeft, { x: bottomLeft.x, y: bottomLeft.y + tileDepth }, { x: topLeft.x, y: topLeft.y + tileDepth }])} fill="#447f3f" />

      {orderedUnits.map((unit) => (
        <IsometricBuilding key={unit.id} unit={unit} selected={unit.id === focusedUnitId} onSelect={onSelect} />
      ))}

      <text x="350" y="354" textAnchor="middle" fill="rgba(255,248,231,0.9)" fontSize="13" fontWeight="700">
        {periodLabel} | {scenarioLabel}
      </text>
    </svg>
  );
}

function FocusSparkline({ values }: { values: number[] }) {
  const width = 280;
  const height = 78;
  const maxValue = Math.max(...values, 1);

  const path = values
    .map((value, index) => {
      const x = (width / Math.max(values.length - 1, 1)) * index;
      const y = chartY(height - 8, maxValue, value) + 4;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <path d={path} fill="none" stroke={palette.accent} strokeWidth="2.8" strokeLinecap="round" />
      <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill={`url(#focusSparkFill-${values.length})`} opacity="0.22" />
      <defs>
        <linearGradient id={`focusSparkFill-${values.length}`} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={palette.accent} />
          <stop offset="100%" stopColor="rgba(255,166,43,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ImpactBarChart({ values, selectedIndex }: { values: ImpactMapPoint[]; selectedIndex: number }) {
  const width = 620;
  const height = 250;
  const leftPad = 20;
  const rightPad = 16;
  const topPad = 18;
  const bottomPad = 34;
  const innerWidth = width - leftPad - rightPad;
  const innerHeight = height - topPad - bottomPad;
  const maxValue = Math.max(...values.map((entry) => entry.value), 1);
  const barWidth = innerWidth / values.length - 4;
  const labels = sampleLabels(values);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {[0.25, 0.5, 0.75, 1].map((tick) => {
        const y = topPad + innerHeight - innerHeight * tick;
        return (
          <line
            key={tick}
            x1={leftPad}
            x2={width - rightPad}
            y1={y}
            y2={y}
            stroke="rgba(248,230,160,0.26)"
            strokeDasharray="5 5"
          />
        );
      })}
      {labels.map(({ entry, visible }, index) => {
        const x = leftPad + index * (barWidth + 4);
        const barHeight = (entry.value / maxValue) * innerHeight;
        const y = topPad + innerHeight - barHeight;
        const active = index === selectedIndex;
        return (
          <g key={entry.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="7"
              fill={active ? palette.accent : index % 2 === 0 ? palette.primary : palette.secondary}
              opacity={active ? 1 : 0.86}
            />
            {visible ? (
              <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fill="rgba(255,248,231,0.72)" fontSize="11">
                {entry.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function CascadeLineChart({ series, selectedIndex }: { series: ImpactMapLineSeries[]; selectedIndex: number }) {
  const width = 620;
  const height = 250;
  const leftPad = 20;
  const rightPad = 16;
  const topPad = 18;
  const bottomPad = 34;
  const innerWidth = width - leftPad - rightPad;
  const innerHeight = height - topPad - bottomPad;
  const maxValue = Math.max(...series.flatMap((entry) => entry.values), 1);
  const length = series[0]?.values.length ?? 0;
  const activeX = leftPad + (innerWidth / Math.max(length - 1, 1)) * selectedIndex;

  const buildPath = (values: number[]) =>
    values
      .map((value, index) => {
        const x = leftPad + (innerWidth / Math.max(values.length - 1, 1)) * index;
        const y = topPad + chartY(innerHeight, maxValue, value);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

  const labels = sampleLabels(
    (series[0]?.values ?? []).map((value, index) => ({ label: `${index + 1}`, value })),
  );

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {[0.25, 0.5, 0.75, 1].map((tick) => {
          const y = topPad + innerHeight - innerHeight * tick;
          return (
            <line
              key={tick}
              x1={leftPad}
              x2={width - rightPad}
              y1={y}
              y2={y}
              stroke="rgba(248,230,160,0.24)"
              strokeDasharray="5 5"
            />
          );
        })}

        <line
          x1={activeX}
          x2={activeX}
          y1={topPad}
          y2={height - bottomPad}
          stroke="rgba(255,166,43,0.58)"
          strokeDasharray="6 6"
        />

        {series.map((entry) => {
          const values = entry.values;
          const activeValue = values[selectedIndex] ?? values[values.length - 1] ?? 0;
          const activeY = topPad + chartY(innerHeight, maxValue, activeValue);
          return (
            <g key={entry.key}>
              <path d={buildPath(values)} fill="none" stroke={entry.color} strokeWidth="3.1" strokeLinecap="round" />
              <circle cx={activeX} cy={activeY} r="5" fill={entry.color} stroke={palette.primaryDeep} strokeWidth="2" />
            </g>
          );
        })}

        {labels.map(({ visible }, index) => {
          if (!visible) {
            return null;
          }
          const x = leftPad + (innerWidth / Math.max(labels.length - 1, 1)) * index;
          return (
            <text key={`label-${index}`} x={x} y={height - 10} textAnchor="middle" fill="rgba(255,248,231,0.72)" fontSize="11">
              {index + 1}
            </text>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-2">
        {series.map((entry) => (
          <span
            key={entry.key}
            className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-xs text-white/84"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SummaryBadge({ label, value, tone }: { label: string; value: string; tone: 'normal' | 'risk' }) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-3',
        tone === 'risk' ? 'border-[#FFA62B]/55 bg-[#FFA62B]/18' : 'border-white/18 bg-white/12',
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/76">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

export default function PolicyImpactDashboard({ payload }: DashboardProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>(payload.timeframe || 'day');
  const [scenarioType, setScenarioType] = useState<ScenarioType>(payload.scenarioType || 'budgetCut');
  const [radiusKm, setRadiusKm] = useState<number>(payload.radiusKm || 5);
  const [focusedUnitId, setFocusedUnitId] = useState<string>(payload.focusedUnitId || payload.focusedUnit?.id || '');
  const [periodIndex, setPeriodIndex] = useState<number>(payload.periodIndex || 0);

  const simulation = useMemo(
    () =>
      createImpactMapPayload(payload.sourceQuestion, payload.profileContext, {
        timeframe,
        scenarioType,
        radiusKm,
        focusedUnitId,
        periodIndex,
      }),
    [payload.profileContext, payload.sourceQuestion, timeframe, scenarioType, radiusKm, focusedUnitId, periodIndex],
  );

  const focusedUnit = simulation.focusedUnit;
  const labelHints = sampleLabels(simulation.impactSeries);

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#2E5AA7]/28 bg-[linear-gradient(135deg,#F8E6A0_0%,#86C5FF_100%)] p-4 shadow-[0_26px_80px_rgba(46,90,167,0.26)] md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.34),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(46,90,167,0.2),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-soft-light [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.9)_1px,transparent_0)] [background-size:16px_16px]" />

      <div className="relative overflow-hidden rounded-[30px] border border-white/22 bg-[linear-gradient(135deg,#2E5AA7_0%,#1E3F80_100%)] p-4 shadow-[0_28px_80px_rgba(23,48,94,0.5)] md:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(134,197,255,0.25),transparent_65%)]" />
        <div className="relative grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <GlassCard className="h-full p-4 md:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F8E6A0]/85">Policy Impact Dashboard</p>
            <h3 className="mt-3 text-xl font-semibold text-white">Civic Pressure Navigator</h3>
            <p className="mt-3 text-sm leading-7 text-white/82">
              Explore how policy shifts degrade or stabilize nearby public infrastructure with an AI-assisted 3D simulation.
            </p>

            <div className="mt-4 grid gap-3">
              <SummaryBadge label="Area" value={simulation.areaName} tone="normal" />
              <SummaryBadge label="Scenario" value={simulation.scenarioLabel} tone="risk" />
              <SummaryBadge label="Radius" value={`${simulation.radiusKm}km`} tone="normal" />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <CTAButton className="flex-1 min-w-[150px]">3D Impact Map</CTAButton>
              <PrimaryButton className="flex-1 min-w-[150px]">Run Analysis</PrimaryButton>
            </div>
            <div className="mt-3">
              <SecondaryButton className="w-full">Export Scenario Snapshot</SecondaryButton>
            </div>
          </GlassCard>

          <div className="space-y-4">
            <DashboardPanel
              title="Simulation Controls"
              subtitle="Tune time horizon, scenario pressure, radius, and focus building."
              action={<Tabs value={timeframe} onChange={setTimeframe} />}
            >
              <div className="grid gap-3 md:grid-cols-3">
                <SelectField label="Scenario" value={scenarioType} onChange={(value) => setScenarioType(value as ScenarioType)}>
                  {SCENARIO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>

                <SelectField label="Radius" value={String(radiusKm)} onChange={(value) => setRadiusKm(Number(value))}>
                  {RADIUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}km
                    </option>
                  ))}
                </SelectField>

                <SelectField label="Focus Unit" value={focusedUnitId} onChange={setFocusedUnitId}>
                  {simulation.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.label}
                    </option>
                  ))}
                </SelectField>
              </div>
            </DashboardPanel>

            <div className="grid gap-4 xl:grid-cols-[1.12fr,0.88fr]">
              <DashboardPanel
                title="3D Isometric Impact Map"
                subtitle={`${simulation.focus}. ${simulation.timeframeDescription}`}
                className="p-3 md:p-4"
              >
                <div className="rounded-3xl border border-white/22 bg-[linear-gradient(160deg,rgba(134,197,255,0.35),rgba(46,90,167,0.16))] p-3 md:p-4">
                  <IsometricLand
                    units={simulation.units}
                    focusedUnitId={simulation.focusedUnitId}
                    periodLabel={simulation.periodLabel}
                    scenarioLabel={simulation.scenarioLabel}
                    onSelect={setFocusedUnitId}
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-white/18 bg-white/10 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                      Snapshot: {simulation.periodLabel}
                    </p>
                    <span className="rounded-full border border-white/22 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85">
                      Day {simulation.periodIndex + 1}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={simulation.periods.length - 1}
                    value={simulation.periodIndex}
                    onChange={(event) => setPeriodIndex(Number(event.target.value))}
                    className="policy-slider mt-3 h-2 w-full cursor-pointer appearance-none rounded-full"
                  />
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/68">
                    {labelHints.map(({ entry, visible }) =>
                      visible ? (
                        <span key={entry.label} className="rounded-full border border-white/20 bg-white/8 px-2.5 py-1">
                          {entry.label}
                        </span>
                      ) : null,
                    )}
                  </div>
                </div>
              </DashboardPanel>

              <div className="space-y-4">
                <DashboardPanel
                  title="Focus Unit Analytics"
                  subtitle={`${focusedUnit.style.label} | ${focusedUnit.distanceKm}km | ${severityCopy(focusedUnit.currentSeverity)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-2xl font-semibold text-white">{focusedUnit.label}</h4>
                      <p className="mt-2 text-sm leading-6 text-white/80">
                        Current impact {focusedUnit.currentImpact}/100 with {focusedUnit.resourceLoss}% resource loss.
                      </p>
                    </div>
                    <span className="rounded-full border border-[#FFA62B]/50 bg-[#FFA62B]/16 px-3 py-1.5 text-xs font-semibold text-[#FFE4BE]">
                      Risk {focusedUnit.currentImpact}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <SummaryBadge label="Building Degradation" value={`${Math.max(0, 100 - focusedUnit.currentHeight)}%`} tone="risk" />
                    <SummaryBadge label="Predicted Disruption" value={simulation.predictedServiceDisruption} tone="normal" />
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/18 bg-white/10 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72">30-day trend</p>
                    <div className="mt-2">
                      <FocusSparkline values={simulation.focusTrend30Day} />
                    </div>
                  </div>
                </DashboardPanel>

                <DashboardPanel title="Related Units" subtitle="Cascading services connected to the selected public unit.">
                  <div className="grid gap-2.5">
                    {simulation.relatedUnits.map((unit) => (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => setFocusedUnitId(unit.id)}
                        className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3 text-left transition duration-300 hover:scale-[1.01] hover:border-[#86C5FF] hover:shadow-[0_12px_24px_rgba(134,197,255,0.3)]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-white">{unit.label}</p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/65">
                              {unit.style.label}
                            </p>
                          </div>
                          <span className="rounded-full border border-[#FFA62B]/45 bg-[#FFA62B]/15 px-2.5 py-1 text-[11px] font-semibold text-[#FFE4BE]">
                            {unit.currentImpact}/100
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </DashboardPanel>
              </div>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {simulation.summaryCards.map((card) => (
                <GlassCard key={card.key} className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72">{card.label}</p>
                  <p className="mt-3 text-xl font-semibold text-white">{card.value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/78">{card.detail}</p>
                </GlassCard>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <ChartSection
                title="Total Affected Public Units"
                subtitle={`Bar chart by ${simulation.timeframeLabel.toLowerCase()} in ${simulation.areaName}.`}
              >
                <ImpactBarChart values={simulation.impactSeries} selectedIndex={simulation.periodIndex} />
              </ChartSection>

              <ChartSection
                title="Cascading Effect"
                subtitle="Line chart for selected unit and top linked units."
              >
                <CascadeLineChart series={simulation.cascadeSeries} selectedIndex={simulation.periodIndex} />
              </ChartSection>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

