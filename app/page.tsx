import Link from 'next/link'
import { ArrowRight, Building2, Users, TrendingUp, Globe, Shield, Zap } from 'lucide-react'

const STATS = [
  { value: '180k+', label: 'Establishments' },
  { value: '6',     label: 'Countries' },
  { value: '50k+',  label: 'Decision-makers' },
  { value: '12',    label: 'Timing signals' },
]

const FEATURES = [
  {
    icon: Globe,
    title: 'Pan-European coverage',
    description: 'France, UK, Germany, Spain, Italy, Benelux — all major care settings from EHPAD to longevity clinics.',
  },
  {
    icon: Zap,
    title: 'Timing signals',
    description: 'Know when to reach out: new director, financial stress, active tender, building permit, M&A activity.',
  },
  {
    icon: Users,
    title: 'Verified contacts',
    description: 'Reach the right person — medical directors, CEOs, procurement heads — with verified emails and LinkedIn.',
  },
  {
    icon: TrendingUp,
    title: 'Market intelligence',
    description: 'Group ownership maps, M&A flow, demographic trends, and density heatmaps by region.',
  },
  {
    icon: Building2,
    title: 'Group mapping',
    description: 'Understand consolidation: who owns what, PE-backed vs independent, portfolio sizes.',
  },
  {
    icon: Shield,
    title: 'GDPR compliant',
    description: 'All data processed in compliance with European regulations. Opt-out management built in.',
  },
]

const PERSONAS = [
  {
    tag: 'Suppliers',
    title: 'Sell faster into healthcare',
    description: 'Find facilities that match your ideal customer profile, identify the right buyer, and reach out at the perfect moment.',
    cta: 'Find leads',
  },
  {
    tag: 'Investors',
    title: 'Source deals before they hit the market',
    description: 'Screen hundreds of independent operators, spot financial stress early, and track ownership structures across Europe.',
    cta: 'Explore portfolio targets',
  },
  {
    tag: 'Health groups',
    title: 'Map your acquisition landscape',
    description: 'Identify independent operators in your target regions, benchmark competitors, and track new openings.',
    cta: 'Start mapping',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Now covering France, UK & Germany
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Healthcare data intelligence<br />
          <span className="text-primary">across Europe</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Find leads, filter by timing signals, and reach the right decision-makers
          across 180,000+ healthcare establishments.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/search" className="btn-primary px-6 py-3 text-base">
            Explore the database <ArrowRight size={18} />
          </Link>
          <Link href="/pricing" className="btn-secondary px-6 py-3 text-base">
            View pricing
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="font-serif text-4xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Personas */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-center mb-12">Built for three types of buyers</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {PERSONAS.map(p => (
            <div key={p.tag} className="card p-6 hover:shadow-md transition-shadow">
              <span className="badge bg-primary-50 text-primary mb-4">{p.tag}</span>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{p.title}</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">{p.description}</p>
              <Link href="/search" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
                {p.cta} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">Everything you need to move fast</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <f.icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl font-bold mb-4">Start with 10 free leads</h2>
          <p className="text-gray-500 mb-8">No credit card required. Upgrade when you need contacts and exports.</p>
          <Link href="/search" className="btn-primary px-8 py-4 text-base">
            Get started for free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif font-bold text-xl text-gray-900">HealthMap</span>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/market" className="hover:text-gray-900">Market data</Link>
            <a href="#" className="hover:text-gray-900">Privacy policy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
