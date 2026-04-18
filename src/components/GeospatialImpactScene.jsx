/* eslint-disable react-refresh/only-export-components */

import PolicyImpactDashboard from './policy-dashboard/PolicyImpactDashboard';

export { createImpactMapPayload as createGeospatialPayload } from '../services/impactMapSimulation';

export default function GeospatialImpactScene({ payload }) {
  return <PolicyImpactDashboard payload={payload} />;
}
