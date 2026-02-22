import { useEffect } from 'react';
import '../styles/globals.css';
import '../i18n';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
