import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  
  useEffect(() => {
    router.replace('/login-otp');
  }, [router]);
  
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <p>{t('login.redirecting')}</p>
    </div>
  );
}