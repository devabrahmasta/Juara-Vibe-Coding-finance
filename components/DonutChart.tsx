'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ExpenseBreakdown } from '@/lib/types';
import { formatIDR } from '@/lib/format';

export default function DonutChart({ breakdown }: { breakdown: ExpenseBreakdown }) {
  const data = [
    { name: 'Tempat Tinggal', value: breakdown.housing.value, color: '#de7356' },
    { name: 'Makanan', value: breakdown.food.value, color: '#f59e0b' },
    { name: 'Transportasi', value: breakdown.transport.value, color: '#8b5cf6' },
    { name: 'Utilitas', value: breakdown.utilities.value, color: '#06b6d4' },
    { name: 'Lainnya', value: breakdown.dependents.value + breakdown.lifestyle.value + breakdown.debt.value, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mt-4">
      <div className="w-full md:w-1/2 h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(val: unknown) => formatIDR(val as number)}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm text-on-surface-variant font-medium">Total</span>
          <span className="text-lg font-bold text-on-surface">{(total / 1000000).toFixed(1)} JT</span>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 space-y-3 mt-4 md:mt-0">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-on-surface">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-on-surface">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
