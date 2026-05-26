import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await authApi.login(data);
      // Store tokens first so getMe() can authenticate
      useAuthStore.setState({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      const user = await authApi.getMe();
      setAuth(user, res.accessToken, res.refreshToken);
      navigate('/dashboard', { replace: true });
    } catch {
      setServerError('Invalid email or password');
    }
  };

  const inputCls =
    'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[oklch(0.62_0.18_28)] focus:ring-1 focus:ring-[oklch(0.62_0.18_28/0.3)]';
  const inputStyle = { borderColor: '#d6cfbf', background: '#faf7f1', color: '#3d342a', fontFamily: "'Crimson Pro', serif", fontSize: 15 };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {serverError && (
        <p className="rounded-lg px-3.5 py-2.5 text-sm" style={{ background: '#fef2f2', color: '#b91c1c', fontFamily: "'Crimson Pro', serif" }}>
          {serverError}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium" style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}>
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={inputCls}
          style={inputStyle}
        />
        {errors.email && (
          <p className="text-xs" style={{ color: '#b91c1c', fontFamily: "'Crimson Pro', serif" }}>{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium" style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}>
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputCls}
          style={inputStyle}
        />
        {errors.password && (
          <p className="text-xs" style={{ color: '#b91c1c', fontFamily: "'Crimson Pro', serif" }}>{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
        style={{ background: 'oklch(0.62 0.18 28)', color: '#faf7f1', fontFamily: "'Crimson Pro', serif", fontSize: 15 }}
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
