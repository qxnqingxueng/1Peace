import { useEffect, useMemo, useState } from 'react';
import MainGatewayLanding from './components/MainGatewayLanding';
import PolicyBrainPage from './components/PolicyBrainPage';
import CrisisOpsPage from './components/CrisisOpsPage';

const pathways = [
  { id: '01', path: '/policy-brain',    name: 'Policy Brain',   stage: 'Before',   accent: 'gold' },
  { id: '02', path: '/disaster-twin',   name: 'Disaster Twin',  stage: 'During',   accent: 'red'  },
  { id: '03', path: '/aid-copilot',     name: 'Aid Copilot',    stage: 'After',    accent: 'gold' },
  { id: '04', path: '/recovery-ledger', name: 'Recovery',       stage: 'Recovery', accent: 'red'  },
];

const knownPaths = new Set(pathways.map((item) => item.path));

function getRouteFromHash() {
  const hash = window.location.hash.replace(/^#/, '');
  if (\!hash || hash === '/') return '/';
  return knownPaths.has(hash) ? hash : '/';
}

function PathwayPage({ route, onNavigate, userProfile }) {
  if (route === '/policy-brain') {
    return <PolicyBrainPage onBack={() => onNavigate('/')} userProfile={userProfile} />;
  }
  if (route === '/disaster-twin') {
    return <CrisisOpsPage onBack={() => onNavigate('/')} userProfile={userProfile} />;
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
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useMemo(
    () => (path) => {
      const normalized = path === '/' ? '/' : knownPaths.has(path) ? path : '/';
      window.location.hash = normalized;
    },
    [],
  );

  if (route \!== '/') {
    return <PathwayPage route={route} onNavigate={navigate} userProfile={userProfile} />;
  }

  const handleLaunch = (cardId) => {
    if (cardId === 'PEACE')  navigate('/policy-brain');
    if (cardId === 'CRISIS') navigate('/disaster-twin');
  };

  return (
    <MainGatewayLanding
      onLaunch={handleLaunch}
      onAuthComplete={setUserProfile}
      userProfile={userProfile}
    />
  );
}

export default App;
