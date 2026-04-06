import { Check } from 'lucide-react'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: '€0',
    period: 'forever',
    description: 'Explore the database with no commitment.',
    features: [
      '10 establishment profiles / month',
      'Basic filters (country, type)',
      'No contact details',
      'No export',
    ],
    cta: 'Get started',
    href: '/search',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '€299',
    period: 'per month',
    description: 'Full access for individual sales reps and analysts.',
    features: [
      'Unlimited establishment profiles',
      'All filters + timing signals',
      '50 contact unlocks / month',
      'CSV export',
      'Saved searches + alerts',
      'HubSpot sync',
    ],
    cta: 'Start free trial',
    href: '/search',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams with advanced data and API needs.',
    features: [
      'Everything in Pro',
      'Unlimited contact unlocks',
      'API access',
      'Custom signal alerts',
      'Team seats',
      'Dedicated support',
    ],
    cta: 'Contact us',
    href: 'mailto:hello@healthmap.io',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h1>
          <p className="text-gray-500">Start free. Upgrade when you need contacts and exports.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div key={p.name} className={`card p-6 flex flex-col ${p.highlight ? 'ring-2 ring-primary' : ''}`}>
              {p.highlight && (
                <div className="badge bg-primary text-white text-xs mb-4 self-start">Most popular</div>
              )}
              <h2 className="font-semibold text-xl text-gray-900">{p.name}</h2>
              <div className="mt-2 mb-1">
                <span className="text-4xl font-bold text-gray-900">{p.price}</span>
                {p.period && <span className="text-gray-500 text-sm ml-1">{p.period}</span>}
              </div>
              <p className="text-sm text-gray-500 mb-6">{p.description}</p>
              <ul className="space-y-2 mb-8 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={15} className="text-health flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={p.highlight ? 'btn-primary justify-center' : 'btn-secondary justify-center'}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
