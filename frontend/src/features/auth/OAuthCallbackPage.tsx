import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageSpinner } from '@/components/common/Spinner';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    // Temporarily store tokens so getMe() can use the interceptor
    useAuthStore.setState({ accessToken, refreshToken });

    authApi
      .getMe()
      .then((user) => {
        setAuth(user, accessToken, refreshToken);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        navigate('/login?error=oauth_failed', { replace: true });
      });
  }, [navigate, setAuth]);

  return <PageSpinner />;
}
