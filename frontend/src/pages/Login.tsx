import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Eye, EyeOff, Mail, Lock, User, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';
import { getPasswordStrength, PASSWORD_STRENGTH_LABELS, PASSWORD_STRENGTH_COLORS } from '../utils/validators';
import { ROUTES } from '../utils/constants';

type Tab = 'login' | 'register';

export default function Login() {
  const navigate  = useNavigate();
  const [tab, setTab]             = useState<Tab>('login');
  const { login: authLogin }        = useAuth();
  const location                    = useLocation();
  const [showPass, setShowPass]     = useState(false);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [name, setName]             = useState('');
  const [loading, setLoading]       = useState(false);

  // Use shared validator from utils
  const strength      = getPasswordStrength(password);
  const strengthColor = PASSWORD_STRENGTH_COLORS[strength];
  const strengthLabel = PASSWORD_STRENGTH_LABELS[strength];

  // Redirect destination: back to intended page or role default
  const from = (location.state as any)?.from?.pathname ?? ROUTES.USER_DASHBOARD;

  const handleLogin = async () => {
    if (!email || !password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const { user, access_token } = await authService.login({ email, password });
      authLogin(user, access_token);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : from, { replace: true });
    } catch {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const { user, access_token } = await authService.register({ name, email, password });
      authLogin(user, access_token);
      toast.success('Account created! Welcome to SENTINEL.');
      navigate(ROUTES.USER_DASHBOARD, { replace: true });
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}>

      {/* Background glows */}
      <div className="absolute top-1/3 left-1/4  w-96 h-96 rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-accent/8  blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Back link */}
      <button onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors">
        <Shield className="w-4 h-4 text-accent" />
        <span className="font-bold">SENTINEL</span>
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="card-glow p-8 rounded-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center
                            justify-center mx-auto mb-4 shadow-glow-cyan">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {tab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {tab === 'login' ? 'Sign in to your SENTINEL dashboard' : 'Start monitoring with SENTINEL'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg bg-navy-900/80 border border-white/5 p-1 mb-6">
            {(['login','register'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all
                  ${tab === t
                    ? 'bg-primary text-white shadow-glow-blue'
                    : 'text-slate-500 hover:text-white'}`}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-4">
            {tab === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input className="input pl-10" placeholder="Full Name"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input className="input pl-10" placeholder="Email Address" type="email"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input className="input pl-10 pr-10" placeholder="Password"
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)} />
              <button onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength */}
            {tab === 'register' && password.length > 0 && (
              <div>
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
                      ${i <= strength ? strengthColor : 'bg-white/10'}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-500">Password strength: <span className="text-white">{strengthLabel}</span></p>
              </div>
            )}

            {tab === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-primary" />
                  <span className="text-xs text-slate-500">Remember me</span>
                </label>
                <button className="text-xs text-accent hover:underline">Forgot password?</button>
              </div>
            )}

            <button
              onClick={tab === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-semibold justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-slate-600">or jump straight in</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Demo shortcuts */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { toast.success('Entering Admin Dashboard'); navigate('/admin'); }}
              className="btn-ghost py-2.5 justify-center gap-2 border-danger/20 hover:bg-danger/5 hover:text-danger">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Try as Admin</span>
            </button>
            <button onClick={() => { toast.success('Entering User Dashboard'); navigate('/dashboard'); }}
              className="btn-ghost py-2.5 justify-center gap-2 border-accent/20 hover:bg-accent/5 hover:text-accent">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Try as User</span>
            </button>
          </div>

          <p className="text-center text-xs text-slate-600 mt-4">
            Demo mode — no real data is stored or transmitted.
          </p>
        </div>
      </div>
    </div>
  );
}
