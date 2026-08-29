import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const errorRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); requestAnimationFrame(() => errorRef.current?.focus()); return; }
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', authUser.id).single();
      if (profileError) { setError('Your account is missing a profile. Please ask an administrator to run the profile setup migration.'); requestAnimationFrame(() => errorRef.current?.focus()); return; }
      if (profile.role === 'ADMIN') navigate('/admin');
      else if (profile.role === 'STAFF') navigate('/staff');
      else if (profile.role === 'RIDER') navigate('/rider');
      else navigate('/customer');
    } catch (err) { console.error(err); setError('Unable to sign in right now. Please check your connection and try again.'); requestAnimationFrame(() => errorRef.current?.focus()); }
    finally { setIsLoading(false); }
  };

  return (
    <div>
      <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Secure access</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Sign in to your workspace</h2><p className="mt-2 text-sm leading-6 text-slate-500">Use your account credentials to continue to the store or admin portal.</p></div>
      {error && <div ref={errorRef} tabIndex={-1} role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 outline-none">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-5">
        <div><label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" /><input id="login-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100" /></div></div>
        <div><div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">Password</label><button type="button" onClick={() => setError('Password reset is not configured yet. Please contact an administrator.')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot password?</button></div><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" /><input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Enter your password" className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
        <button type="submit" disabled={isLoading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? 'Signing in...' : 'Sign in'} {!isLoading && <ArrowRight size={18} aria-hidden="true" />}</button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-500">Don&apos;t have an account? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">Create one</Link></p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500"><p className="font-semibold text-slate-700">Need a demo account?</p><p className="mt-1">Use the credentials provided by your administrator.</p></div>
    </div>
  );
}
