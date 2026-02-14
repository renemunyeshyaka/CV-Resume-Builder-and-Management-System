import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/login-otp');
  }, [router]);
  
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <p>Redirecting to login...</p>
    </div>
  );
}