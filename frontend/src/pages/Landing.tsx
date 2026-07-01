import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Brain, BarChart3, FileText, Radio, ArrowRight, GitBranch, ExternalLink, ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

const FEATURES = [
  { icon: Radio,    color: 'text-accent',   bg: 'bg-accent/10',   border: 'border-accent/20',
    title: 'Real-Time Detection', desc: 'Monitor threats as they happen. Events are scored and explained within milliseconds.' },
  { icon: Shield,   color: 'text-primary-light', bg: 'bg-primary/10', border: 'border-primary/20',
    title: 'Fraud Detection', desc: 'Detect suspicious financial transactions using advanced ML trained on real-world data.' },
  { icon: Brain,    color: 'text-secondary-light',  bg: 'bg-secondary/10',  border: 'border-secondary/20',
    title: 'Explainable AI', desc: 'Every alert explains WHY it triggered — not just what happened. Powered by SHAP.' },
  { icon: Zap,      color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20',
    title: 'Risk Score Engine', desc: 'Every event gets a 0–100 risk score based on multiple weighted parameters.' },
  { icon: BarChart3,color: 'text-success',  bg: 'bg-success/10',  border: 'border-success/20',
    title: 'Live Analytics', desc: 'Real-time charts, threat maps, trend analysis, and geographic activity visualizations.' },
  { icon: FileText, color: 'text-danger',   bg: 'bg-danger/10',   border: 'border-danger/20',
    title: 'Report Generation', desc: 'Export PDF and CSV reports on demand. Scheduled daily, weekly, and monthly summaries.' },
];

const TECH = [
  { name: 'Python',      color: '#3B82F6' },
  { name: 'FastAPI',     color: '#06B6D4' },
  { name: 'XGBoost',     color: '#10B981' },
  { name: 'SHAP',        color: '#8B5CF6' },
  { name: 'React',       color: '#2563EB' },
  { name: 'TypeScript',  color: '#3B82F6' },
  { name: 'TailwindCSS', color: '#06B6D4' },
  { name: 'SQLite',      color: '#F59E0B' },
];

const USERS = [
  { icon: '🏦', label: 'Banks' },
  { icon: '🏢', label: 'Businesses' },
  { icon: '🛡️', label: 'Cyber Teams' },
  { icon: '🎓', label: 'Students' },
  { icon: '🏛️', label: 'Government' },
  { icon: '👤', label: 'General Public' },
];

const STEPS = [
  { num: '01', title: 'Monitor', desc: 'SENTINEL continuously watches user activities, transactions, and network events in real time.', color: 'from-accent to-primary' },
  { num: '02', title: 'Detect',  desc: 'The ML engine scores every event and flags anomalies using multi-layer analysis.', color: 'from-primary to-secondary' },
  { num: '03', title: 'Explain', desc: 'Every alert tells you exactly why it happened and what you should do about it.', color: 'from-secondary to-danger' },
];

const STATS = [
  { value: '91%',    label: 'Model Accuracy' },
  { value: '<2s',    label: 'Alert Response' },
  { value: '10+',    label: 'Chart Types' },
  { value: '6 Weeks',label: 'Build Time' },
];

export default function Landing() {
  const navigate = useNavigate();
  const heroRef  = useRef<HTMLDivElement>(null);

  // Parallax subtle effect on scroll
  useEffect(() => {
    const handler = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.15}px)`;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 to-navy-900 overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-glow-cyan">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-wide">SENTINEL</span>
            <span className="badge badge-info text-[10px] hidden sm:inline-flex">AI · BETA</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="text-slate-400 hover:text-white text-sm transition-colors hidden md:block">Features</a>
            <a href="#how"      className="text-slate-400 hover:text-white text-sm transition-colors hidden md:block">How it Works</a>
            <button onClick={() => navigate('/login')} className="btn-ghost btn-sm">Login</button>
            <button onClick={() => navigate('/admin')} className="btn-accent btn-sm">
              View Demo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-14 overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]
                        rounded-full bg-accent/8 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-secondary/10 blur-[80px] pointer-events-none" />

        {/* Animated grid */}
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

        <div ref={heroRef} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30
                          bg-accent/5 text-accent text-xs font-semibold mb-6 animate-fade-in">
            <span className="live-dot" />
            AI-Powered · Real-Time · Explainable
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6 animate-slide-up">
            Smart Emergency{' '}
            <span className="text-gradient">Network</span>{' '}
            for Threat Intelligence
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            SENTINEL detects fraud, network intrusions, and suspicious activity in real time —
            then explains exactly <em className="text-white not-italic font-medium">why</em> it happened and what you should do.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-12 animate-fade-in">
            <button
              onClick={() => navigate('/admin')}
              className="btn-accent btn-lg group"
            >
              <Radio className="w-5 h-5" />
              View Admin Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-lg border border-white/15 text-white hover:bg-white/5"
            >
              <Shield className="w-5 h-5 text-primary-light" />
              User Dashboard
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-ghost btn-lg"
            >
              Login / Register
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fade-in">
            {STATS.map(({ value, label }) => (
              <div key={label} className="card p-4 text-center hover:-translate-y-0.5">
                <p className="text-2xl font-bold text-gradient">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce">
          <span className="text-xs text-slate-600">Scroll to explore</span>
          <ChevronRight className="w-4 h-4 text-slate-600 rotate-90" />
        </div>
      </section>

      {/* ── WHAT IS SENTINEL ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="badge badge-info mb-4">What is SENTINEL?</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Your AI-Powered Security Operations Center
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            SENTINEL is a research-grade AI platform that monitors financial transactions and network
            traffic simultaneously. It uses machine learning to detect anomalies, assigns a risk score
            to every event, and generates clear explanations that anyone — technical or not — can understand.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🔍', title: 'Detects', text: 'Fraud, intrusions, suspicious logins, rapid transactions, impossible travel' },
              { icon: '📊', title: 'Scores',  text: 'Every event gets a 0–100 Risk Score with contributing factors explained' },
              { icon: '💬', title: 'Explains',text: 'Not just WHAT happened, but WHY — with SHAP-powered AI explanations' },
            ].map(({ icon, title, text }) => (
              <div key={title} className="card p-6 text-center hover:-translate-y-1">
                <span className="text-4xl mb-4 block">{icon}</span>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 bg-navy-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="badge badge-accent mb-4">Key Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Everything You Need</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Built for students, banks, businesses, and cybersecurity teams.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, bg, border, title, desc }) => (
              <div key={title} className={`card border ${border} p-6 hover:-translate-y-1 group`}>
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="badge badge-info mb-4">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Three Steps to Security</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ num, title, desc, color }, i) => (
              <div key={num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-8 h-px bg-gradient-to-r from-white/20 to-transparent z-10" />
                )}
                <div className="card p-6 hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-glow-cyan`}>
                    <span className="text-xl font-black text-white">{num}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO USES IT ── */}
      <section className="py-24 px-6 bg-navy-950/50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="badge badge-info mb-4">Built For Everyone</span>
          <h2 className="text-3xl font-bold text-white mb-12">Who Uses SENTINEL?</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {USERS.map(({ icon, label }) => (
              <div key={label} className="card p-4 flex flex-col items-center gap-2 hover:-translate-y-1">
                <span className="text-3xl">{icon}</span>
                <span className="text-xs text-slate-400 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-slate-600 uppercase tracking-widest mb-6">Built With</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {TECH.map(({ name, color }) => (
              <div key={name}
                className="px-4 py-2 rounded-lg border border-white/8 bg-white/[0.03]
                           text-sm font-medium hover:border-white/20 transition-all"
                style={{ color }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-glow p-10 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to See SENTINEL in Action?
              </h2>
              <p className="text-slate-400 mb-8">
                Jump directly into the live demo. No account needed.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button onClick={() => navigate('/admin')} className="btn-accent btn-lg">
                  <Radio className="w-5 h-5" /> Admin Dashboard
                </button>
                <button onClick={() => navigate('/dashboard')} className="btn btn-lg border border-white/15 text-white hover:bg-white/5">
                  <Shield className="w-5 h-5" /> User Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-white font-bold text-sm">SENTINEL</span>
            <span className="text-slate-600 text-xs">· Smart Emergency Network for Threat Intelligence</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-600 text-xs">6-Week AI Research Project · June 2026</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors">
              <GitBranch className="w-4 h-4" />
            </a>
            <button onClick={() => navigate('/admin')}
              className="text-slate-500 hover:text-accent transition-colors text-xs flex items-center gap-1">
              Live Demo <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
