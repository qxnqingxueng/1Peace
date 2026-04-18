import { useEffect, useMemo, useState } from 'react';
import MainGatewayLanding from './components/MainGatewayLanding';
import PolicyBrainPage from './components/PolicyBrainPage';
import CrisisOpsPage from './components/CrisisOpsPage';

const pathways = [
  {
    id: '01',
    path: '/policy-brain',
    name: 'Policy Brain',
    stage: 'Before',
    accent: 'gold',
    blurb: 'Read policy shifts in plain language and preview how household outcomes change before a flood season starts.',
    // ... keep your other properties if your PathwayPage needs them
  },
  {
    id: '02',
    path: '/disaster-twin',
    name: 'Disaster Twin',
    stage: 'During',
    accent: 'red',
    blurb: 'Open a spatial incident view with flood depth, shelter routing, and fast guidance when conditions are already moving.',
  },
  {
    id: '03',
    path: '/aid-copilot',
    name: 'Aid Copilot',
    stage: 'After',
    accent: 'gold',
    blurb: 'Assist users to process and submit relief support requests.',
  },
  {
    id: '04',
    path: '/recovery-ledger',
    name: 'Recovery',
    stage: 'Recovery',
    accent: 'red',
    blurb: 'Track aid progress and post-disaster rebuilding timeline.',
  },
];

const knownPaths = new Set(pathways.map((item) => item.path));

function getRouteFromHash() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash || hash === '/') {
    return '/';
  }
  return knownPaths.has(hash) ? hash : '/';
}

// Keep your PathwayPage component exactly as it is
function PathwayPage({ route, onNavigate }) {
  if (route === '/policy-brain') {
    return <PolicyBrainPage onBack={() => onNavigate('/')} />;
  }

  if (route === '/disaster-twin') {
    return <CrisisOpsPage onBack={() => onNavigate('/')} />;
  }

  return (
    <main className="main-shell route-shell">
      <h1>Placeholder for Pathway: {route}</h1>
      <button onClick={() => onNavigate('/')}>Back</button>
    </main>
  );
}

function App() {
  const [route, setRoute] = useState(() => getRouteFromHash());

  // Listen for URL hash changes
  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Your clean navigation handler
  const navigate = useMemo(
    () => (path) => {
      const normalized = path === '/' ? '/' : knownPaths.has(path) ? path : '/';
      window.location.hash = normalized;
    },
    [],
  );

  // If we are not on the main page, show the specific pathway
  if (route !== '/') {
    return <PathwayPage route={route} onNavigate={navigate} />;
  }

  // Map the 2-Card Landing Page clicks to your routes
  const handleLaunch = (cardId) => {
    if (cardId === 'PEACE') {
      navigate('/policy-brain'); // Routes to Category 1
    } else if (cardId === 'CRISIS') {
      navigate('/disaster-twin'); // Routes to Category 2
    }
  };

  // Render the two-card gateway page when on '/'
  return <MainGatewayLanding onLaunch={handleLaunch} />;
}

export default App;
