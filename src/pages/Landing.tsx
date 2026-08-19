import { Link, useNavigate } from 'react-router-dom';
import {
  Siren, Shield, MapPin, Video, Mic, Cpu, Radio, Activity, ArrowRight,
  Lock, Zap, AlertTriangle, Eye, EyeOff, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-40 border-b border-navy-800/50 bg-navy-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-info-500 to-info-700">
              <Siren className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Silent Trigger</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#problem" className="text-sm text-navy-300 hover:text-white transition-colors">Problem</a>
            <a href="#solution" className="text-sm text-navy-300 hover:text-white transition-colors">Solution</a>
            <a href="#features" className="text-sm text-navy-300 hover:text-white transition-colors">Features</a>
            <a href="#technology" className="text-sm text-navy-300 hover:text-white transition-colors">Technology</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
            <Button size="sm" onClick={() => navigate('/login')}>Live Demo <ArrowRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-info-950/20 via-navy-950 to-navy-950" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(239,68,68,0.05) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-info-500/30 bg-info-500/10 px-3 py-1 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-info-400 animate-pulse" />
              <span className="text-xs font-semibold text-info-300 uppercase tracking-wider">Hackathon Prototype</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight">
              SILENT<br />
              <span className="bg-gradient-to-r from-info-400 to-info-600 bg-clip-text text-transparent">TRIGGER</span>
            </h1>
            <p className="mt-4 text-xl text-navy-200 font-semibold">
              AI-Enabled Discreet Emergency Detection & Real-Time Response System
            </p>
            <p className="mt-4 text-base text-navy-300 max-w-xl leading-relaxed">
              When asking for help openly isn't safe, Silent Trigger provides a discreet path to emergency response.
              A compact wearable device that operates independently of a smartphone — silently triggering location
              sharing, audio, and video evidence to a real-time response platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('/login')}>
                Explore Solution <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/login')}>Live Demo</Button>
              <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>Login</Button>
            </div>
          </div>

          {/* Device SVG */}
          <div className="flex justify-center animate-fade-in">
            <DeviceConcept />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-navy-800/50">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="The Problem"
            title="Conventional SOS is not always safe"
            subtitle="Existing emergency systems have critical limitations when someone is in danger and cannot openly call for help."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: AlertTriangle, title: 'Open SOS Limitations', desc: 'Dialing emergency services or shouting for help can escalate danger when an aggressor is nearby.' },
              { icon: Cpu, title: 'Smartphone Dependency', desc: 'Most SOS apps require a phone — which can be confiscated, out of battery, or out of reach.' },
              { icon: Radio, title: 'Delayed Communication', desc: 'Unlocking a phone, opening an app, and navigating to SOS wastes precious seconds in emergencies.' },
              { icon: Eye, title: 'No Immediate Evidence', desc: 'Traditional SOS does not capture location, audio, or video evidence for responders.' },
            ].map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-navy-800/50 bg-navy-900/20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="The Solution"
            title="A discreet, independent path to safety"
            subtitle="Silent Trigger bridges the gap between silent activation and rapid emergency response."
          />
          <div className="mt-12 flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl">
              {['Silent Trigger', 'Emergency Detection', 'Location', 'Audio / Video', 'Emergency Platform', 'Responder'].map((step, idx, arr) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="rounded-lg border border-info-500/30 bg-info-500/10 px-4 py-2.5 text-sm font-semibold text-info-300">
                    {step}
                  </div>
                  {idx < arr.length - 1 && <ChevronRight className="h-5 w-5 text-navy-500 hidden sm:block" />}
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-navy-400 max-w-2xl text-center">
              The proposed hardware device silently triggers an emergency event. The backend instantly captures
              simulated GPS, audio, and video, then alerts the responder dashboard — all without touching a phone.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-navy-800/50">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="Key Features"
            title="Everything a responder needs, in real time"
            subtitle="From silent activation to incident resolution — the complete emergency response ecosystem."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: EyeOff, title: 'Silent Activation', desc: 'Trigger an emergency discreetly without alerting anyone nearby. A hidden button on the device starts the entire response chain.' },
              { icon: Cpu, title: 'Independent Hardware', desc: 'Proposed compact wearable operating independently of a smartphone — with its own GPS, cellular, camera, and microphone.' },
              { icon: MapPin, title: 'Location Sharing', desc: 'Real-time GPS coordinates sent to the responder dashboard with accuracy indicators and live map visualization.' },
              { icon: Video, title: 'Audio / Video Evidence', desc: 'Simulated audio and video streams provide responders with critical context about the situation on the ground.' },
              { icon: Radio, title: 'Emergency Dashboard', desc: 'Professional monitoring interface with active incidents, device status, and real-time timeline of events.' },
              { icon: Zap, title: 'Rapid Response', desc: 'Structured acknowledge → respond → resolve workflow ensures incidents are handled quickly and tracked end-to-end.' },
            ].map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-navy-800/50 bg-navy-900/20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="Technology"
            title="Built on a modern full-stack architecture"
            subtitle="Professional tools chosen for reliability, speed, and hackathon-ready demo capability."
          />
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'React', 'TypeScript', 'Vite', 'Tailwind CSS',
              'Supabase', 'PostgreSQL', 'Row-Level Security', 'REST API',
              'Leaflet Maps', 'TanStack Query', 'React Router', 'Future IoT',
            ].map((tech) => (
              <div
                key={tech}
                className="glass-card flex items-center justify-center py-6 text-sm font-semibold text-navy-200 hover:border-info-500/40 transition-colors"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current vs Future */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-navy-800/50">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            label="Roadmap"
            title="Current prototype vs. future implementation"
            subtitle="We are transparent about what works today and what is planned for the physical device."
          />
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-success-400" />
                <h3 className="text-base font-bold text-white">Current Prototype</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-navy-300">
                {[
                  'React frontend with professional dashboard',
                  'Full-stack backend with database persistence',
                  'Emergency incident management workflow',
                  'Simulated hardware device communication',
                  'Simulated GPS, audio, and video feeds',
                  'Responder dashboard with live incident list',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-6 border-warning-500/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-warning-400" />
                <h3 className="text-base font-bold text-white">Future Implementation</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-navy-300">
                {[
                  'Physical Silent Trigger wearable device',
                  'GPS, cellular (4G/LTE), camera, microphone',
                  'Independent emergency communication (no phone)',
                  'Real emergency service integration',
                  'AI-based voice distress & threat detection',
                  'False alarm detection and context-aware scoring',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-navy-800/50">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-info-500/30 bg-info-500/10 px-3 py-1 mb-6">
            <Lock className="h-3 w-3 text-info-400" />
            <span className="text-xs font-semibold text-info-300 uppercase tracking-wider">Ready for Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Experience the Silent Trigger demo
          </h2>
          <p className="mt-4 text-base text-navy-300 max-w-2xl mx-auto">
            Login with a demo account to explore the full emergency workflow — from silent trigger
            activation to responder acknowledge, respond, and resolve.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/login')}>
              Start Live Demo <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-navy-800/50">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-info-500 to-info-700">
              <Siren className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-navy-200">Silent Trigger</span>
          </div>
          <p className="text-xs text-navy-400">
            Hackathon Prototype — Simulated hardware, real software. All device data is SIMULATED.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-widest text-info-400 mb-2">{label}</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{title}</h2>
      <p className="mt-3 text-base text-navy-300">{subtitle}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Siren; title: string; desc: string }) {
  return (
    <div className="glass-card p-6 hover:border-info-500/30 transition-colors group">
      <div className="mb-4 rounded-lg bg-info-500/10 p-3 w-fit group-hover:bg-info-500/20 transition-colors">
        <Icon className="h-5 w-5 text-info-400" />
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-navy-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function DeviceConcept() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-info-500/10 blur-3xl rounded-full" />
      <svg viewBox="0 0 300 300" className="relative w-72 h-72 sm:w-80 sm:h-80">
        {/* Outer ring */}
        <circle cx="150" cy="150" r="120" fill="none" stroke="#1e3a8a" strokeWidth="1" opacity="0.3" />
        <circle cx="150" cy="150" r="100" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.2" className="animate-pulse" />

        {/* Device body */}
        <rect x="95" y="95" width="110" height="110" rx="20" fill="#16263d" stroke="#3b82f6" strokeWidth="2" />
        <rect x="105" y="105" width="90" height="90" rx="14" fill="#0d1b2a" stroke="#243b53" strokeWidth="1" />

        {/* Screen */}
        <rect x="115" y="115" width="70" height="50" rx="8" fill="#0a1420" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />

        {/* Status dot */}
        <circle cx="150" cy="140" r="6" fill="#22c55e">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Signal bars */}
        <g transform="translate(118, 172)">
          <rect x="0" y="6" width="4" height="4" fill="#3b82f6" rx="1" />
          <rect x="6" y="4" width="4" height="6" fill="#3b82f6" rx="1" />
          <rect x="12" y="2" width="4" height="8" fill="#3b82f6" rx="1" />
          <rect x="18" y="0" width="4" height="10" fill="#3b82f6" rx="1" />
        </g>

        {/* Battery icon */}
        <g transform="translate(170, 170)">
          <rect x="0" y="2" width="14" height="8" rx="1" fill="none" stroke="#22c55e" strokeWidth="1" />
          <rect x="14" y="4" width="2" height="4" rx="0.5" fill="#22c55e" />
          <rect x="2" y="4" width="9" height="4" rx="0.5" fill="#22c55e" />
        </g>

        {/* Trigger button (center bottom) */}
        <circle cx="150" cy="185" r="8" fill="#ef4444" stroke="#dc2626" strokeWidth="2">
          <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Labels */}
        <text x="150" y="245" textAnchor="middle" fill="#486581" fontSize="10" fontFamily="monospace" fontWeight="600">
          ST-001
        </text>
        <text x="150" y="260" textAnchor="middle" fill="#334e68" fontSize="8" fontFamily="monospace">
          PROPOSED HARDWARE
        </text>

        {/* Corner accents */}
        <path d="M 95 115 L 95 95 L 115 95" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />
        <path d="M 205 95 L 205 115 M 205 95 L 185 95" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />
        <path d="M 95 185 L 95 205 L 115 205" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />
        <path d="M 205 205 L 205 185 M 205 205 L 185 205" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />
      </svg>
    </div>
  );
}
