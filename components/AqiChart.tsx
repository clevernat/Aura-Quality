
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AQIData } from '../types';
import { getAqiCategory } from '../constants';

interface AqiChartProps {
  data: AQIData['historical'];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const aqi = payload[0].value;
    const category = getAqiCategory(aqi);
    return (
      <div className="p-2 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
        <p className="label text-white">{`${label}`}</p>
        <p className="intro text-white">
          AQI: <span style={{ color: category.className.replace('bg-', '') }}>{aqi} ({category.name})</span>
        </p>
      </div>
    );
  }

  return null;
};

const AqiChart: React.FC<AqiChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#A0AEC0" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: "14px"}} />
          <Line type="monotone" dataKey="aqi" name="AQI" stroke="#4299E1" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AqiChart;
