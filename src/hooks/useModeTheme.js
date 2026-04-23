import { useEffect } from 'react';

export function useModeTheme(mode) {
  useEffect(() => {
    const nextMode = mode === 'crisis' ? 'crisis' : mode === 'peace' ? 'peace' : 'landing';
    document.body.dataset.mode = nextMode;

    if (nextMode === 'landing') {
      document.body.classList.add('landing-white');
    } else {
      document.body.classList.remove('landing-white');
    }

    return () => {
      document.body.dataset.mode = 'landing';
      document.body.classList.remove('landing-white');
    };
  }, [mode]);
}
