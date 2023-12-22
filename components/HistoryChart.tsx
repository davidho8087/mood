'use client'
import { EntryAnalysis } from '@prisma/client'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const STROKE_COLOR = '#8884d8'
const STROKE_WIDTH = 2

type Payload = {
  payload: EntryAnalysis
}

type CustomToolTipProps = {
  payload: Payload[]
  active: boolean
  label: Date
}

const CustomTooltip = ({ payload, label, active }: CustomToolTipProps) => {
  console.log('label', label)
  console.log('payload', payload)
  console.log('active', active)
  const dateLabel = new Date(label).toLocaleString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })

  if (active) {
    const analysis = payload[0].payload
    return (
      <div className="custom-tooltip relative rounded-lg border border-black/10 bg-white/5 p-8 shadow-md backdrop-blur-md">
        <div
          className="absolute left-2 top-2 h-2 w-2 rounded-full"
          style={{ background: analysis.color }}
        ></div>
        <p className="label text-sm text-black/30">{dateLabel}</p>
        <p className="intro text-xl uppercase">{analysis.mood}</p>
      </div>
    )
  }

  return null
}

const HistoryChart = ({ data }: { data: EntryAnalysis[] }) => {
  const payloadForCustomTooltip = data.map((entryAnalysis) => ({
    payload: entryAnalysis,
  }))
  const label = new Date()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart width={300} height={100} data={data}>
        <Line
          type="monotone"
          dataKey="sentimentScore"
          stroke={STROKE_COLOR}
          strokeWidth={STROKE_WIDTH}
          activeDot={{ r: 8 }}
        />

        <XAxis dataKey="updatedAt" />
        <Tooltip
          content={
            <CustomTooltip
              payload={payloadForCustomTooltip}
              label={label}
              active={true}
            />
          }
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
export default HistoryChart
