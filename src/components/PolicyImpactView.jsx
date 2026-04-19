import { useMemo } from 'react';
import PolicyImpactDashboard from './policy-dashboard/PolicyImpactDashboard';
import { createImpactMapPayload } from '../services/impactMapSimulation';

export default function PolicyImpactView({ profile }) {
  const impactProfile = useMemo(
    () => ({
      state: profile.state || 'Selangor',
      district: profile.district || `${profile.state || 'Selangor'} Central`,
      transport: profile.transport || profile.vehicleType || 'Car',
      incomeGroup: profile.incomeGroup || 'B40',
      employmentStatus: profile.employmentStatus || 'Citizen profile',
      monthlyIncome: profile.monthlyIncome || '3000',
      monthlyCommuteSpend: profile.monthlyCommuteSpend || '220',
      monthlyUtilityBill: profile.monthlyUtilityBill || '150',
      kwspBalance: profile.kwspBalance || '12000',
      dependants: profile.dependants || '2',
      housingStatus: profile.housingStatus || 'Renting',
      householdType: profile.householdType || 'Single Parent',
    }),
    [profile],
  );

  const payload = useMemo(
    () =>
      createImpactMapPayload(
        'Show how nearby public facilities change under current Malaysia policy pressure.',
        impactProfile,
        {
          timeframe: 'day',
          scenarioType: 'budgetCut',
          radiusKm: 5,
        },
      ),
    [impactProfile],
  );

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-8 pt-3 md:px-6">
      <div className="overflow-hidden rounded-[30px] border border-[#dce6ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,244,255,0.82))] p-6 shadow-[0_22px_54px_rgba(13,33,165,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6c79a4]">Impact simulator</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#09132a] md:text-4xl">
          Public Facility Impact Map
        </h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[#55627d] md:text-base">
          Explore how policy pressure can ripple across hospitals, clinics, schools, factories, fuel stations, and civic anchors near the citizen profile. The navigation stays short as <strong>Impact</strong>, while this page keeps the full public-service context visible.
        </p>
      </div>

      <PolicyImpactDashboard payload={payload} />
    </section>
  );
}
