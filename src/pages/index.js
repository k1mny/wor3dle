import Head from 'next/head';
import { useEffect } from 'react';
import Wordle3D from '../components/wordle3d';

export default function Home() {
  // for mobile height
  useEffect(() => {
    const setFillHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    window.addEventListener('resize', setFillHeight);
    setFillHeight();

    return () => window.removeEventListener('resize', setFillHeight);
  }, []);

  return (
    <div>
      <Head>
        <title>WOR3DLE</title>
        <meta name="description" content="Wordle in physics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        style={{
          width: '100vw',
          minHeight: '100vh',
          minHeight: 'calc(var(--vh, 1vh) * 100)',
        }}
      >
        <Wordle3D />
      </main>
    </div>
  );
}
