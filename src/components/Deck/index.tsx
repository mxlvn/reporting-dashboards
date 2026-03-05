import { useState } from 'react'
import { ReportData, Platform } from '../../types'
import { ChevronLeft, ChevronRight, Printer, Maximize2, Minimize2 } from 'lucide-react'
import TitleSlide from './slides/TitleSlide'
import ExecutiveSummary from './slides/ExecutiveSummary'
import SpendTrendSlide from './slides/SpendTrendSlide'
import PlatformDeepDive from './slides/PlatformDeepDive'
import GA4Slide from './slides/GA4Slide'
import RecommendationsSlide from './slides/RecommendationsSlide'
import { PLATFORM_META } from '../../utils/formatters'
import clsx from 'clsx'

interface Props {
  data: ReportData
}

const PLATFORMS: Platform[] = ['google_ads', 'meta_ads', 'linkedin_ads', 'x_ads', 'tiktok_ads']

export default function Deck({ data }: Props) {
  const { client, platforms, ga4, campaigns } = data
  const [slide, setSlide] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  // Build slide list
  const slides = [
    { label: 'Cover',           component: <TitleSlide client={client} /> },
    { label: 'Exec Summary',    component: <ExecutiveSummary data={data} /> },
    { label: 'Trends',          component: <SpendTrendSlide data={data} /> },
    ...PLATFORMS.map((p) => {
      const metrics = platforms.find((pm) => pm.platform === p)!
      return {
        label: PLATFORM_META[p].label,
        component: <PlatformDeepDive platform={p} metrics={metrics} campaigns={campaigns} reportingPeriod={client.reportingPeriod} />,
      }
    }),
    { label: 'GA4',             component: <GA4Slide ga4={ga4} reportingPeriod={client.reportingPeriod} /> },
    { label: 'Recommendations', component: <RecommendationsSlide client={client} platforms={platforms} /> },
  ]

  const total = slides.length
  const prev = () => setSlide((s) => Math.max(0, s - 1))
  const next = () => setSlide((s) => Math.min(total - 1, s + 1))

  return (
    <div className={clsx('flex flex-col', fullscreen && 'fixed inset-0 z-50 bg-black')}>
      {/* Deck controls */}
      <div className={clsx('no-print flex items-center justify-between px-4 py-2 bg-gray-900 text-white', fullscreen ? '' : 'rounded-t-xl')}>
        <div className="flex items-center gap-2">
          <button onClick={prev} disabled={slide === 0} className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 transition">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-gray-200 px-2">
            {slide + 1} / {total} — {slides[slide].label}
          </span>
          <button onClick={next} disabled={slide === total - 1} className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 transition">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Slide dots */}
        <div className="flex items-center gap-1">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              title={s.label}
              className={clsx(
                'rounded-full transition-all',
                i === slide ? 'w-6 h-2 bg-indigo-400' : 'w-2 h-2 bg-gray-600 hover:bg-gray-400',
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
          >
            <Printer size={13} />
            Export PDF
          </button>
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="p-1.5 rounded hover:bg-gray-700 transition"
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Slide nav tabs */}
      <div className="no-print flex items-center gap-0 bg-gray-800 overflow-x-auto scrollbar-hide px-2">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={clsx(
              'px-3 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2',
              i === slide
                ? 'text-indigo-400 border-indigo-400 bg-gray-700'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-700',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Slide viewport */}
      <div className={clsx(
        'flex-1 overflow-auto bg-gray-700 p-4 flex items-start justify-center',
        fullscreen && 'items-center',
      )}>
        {/* Print: show all slides */}
        <div className="hidden print:block space-y-0">
          {slides.map((s, i) => (
            <div key={i}>{s.component}</div>
          ))}
        </div>

        {/* Interactive: show single slide */}
        <div
          className="print:hidden shadow-2xl rounded overflow-hidden"
          style={{ width: 1280, transform: fullscreen ? 'scale(0.75)' : 'scale(0.65)', transformOrigin: 'top center' }}
        >
          {slides[slide].component}
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="no-print bg-gray-900 px-4 py-1 text-center">
        <p className="text-xs text-gray-500">Use ← → arrows or click slide tabs to navigate · Click "Export PDF" to generate the monthly deck</p>
      </div>
    </div>
  )
}
