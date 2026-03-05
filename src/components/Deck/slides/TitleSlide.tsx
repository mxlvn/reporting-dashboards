import { ClientConfig } from '../../../types'

interface Props {
  client: ClientConfig
}

export default function TitleSlide({ client }: Props) {
  return (
    <div className="slide bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      {/* Grid decoration */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 flex flex-col h-full p-16">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-auto">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-indigo-400 rounded-full" />
            <span className="text-indigo-200 text-sm font-medium tracking-widest uppercase">Performance Report</span>
          </div>
          <span className="text-indigo-300 text-sm">{client.industry}</span>
        </div>

        {/* Main content */}
        <div className="my-12">
          <p className="text-indigo-300 text-xl font-medium mb-4 tracking-wide">{client.reportingMonth}</p>
          <h1 className="text-7xl font-black tracking-tight leading-none mb-6">
            {client.name}
          </h1>
          <h2 className="text-3xl font-light text-indigo-200 mb-8">
            Paid Media Monthly Report
          </h2>
          <div className="w-24 h-1 bg-indigo-400 rounded-full" />
        </div>

        {/* Platform badges */}
        <div className="flex items-center gap-3 mb-8">
          {['Google Ads', 'Meta Ads', 'LinkedIn', 'X Ads', 'TikTok', 'GA4'].map((p) => (
            <span
              key={p}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-medium text-white backdrop-blur-sm"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <p className="text-indigo-300 text-sm">
            Reporting Period: <span className="text-white font-medium">{client.reportingPeriod}</span>
          </p>
          <p className="text-indigo-300 text-sm">Confidential</p>
        </div>
      </div>
    </div>
  )
}
