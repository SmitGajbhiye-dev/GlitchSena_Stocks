import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Position } from '../types';

interface PortfolioChartsProps {
  positions: Position[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const PortfolioCharts: React.FC<PortfolioChartsProps> = ({ positions }) => {
  const allocationData = positions.map(p => ({
    name: p.symbol,
    value: p.currentPrice * p.quantity
  }));

  const riskData = positions.map(p => ({
    name: p.symbol,
    risk: p.riskScore,
    type: p.type
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-80 shadow-lg">
        <h4 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">Capital Allocation (INR)</h4>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={allocationData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {allocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(value: number) => `₹${value.toLocaleString('en-IN', {minimumFractionDigits: 2})}`}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-80 shadow-lg">
        <h4 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">Risk Exposure (0-100)</h4>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={riskData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" width={50} tick={{fontSize: 12}} />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
            />
            <Bar dataKey="risk" name="Risk Score" radius={[0, 4, 4, 0]}>
              {riskData.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={entry.risk > 70 ? '#ef4444' : entry.risk > 40 ? '#f59e0b' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioCharts;