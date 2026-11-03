import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HourlyActivityProps {
  data?: {
    hour: number;
    messages: number;
  }[];
}

const mockData = [
  { hour: 0, messages: 2 },
  { hour: 1, messages: 1 },
  { hour: 2, messages: 8 },
  { hour: 3, messages: 3 },
  { hour: 4, messages: 15 },
  { hour: 5, messages: 7 },
  { hour: 6, messages: 10 },
  { hour: 7, messages: 4 },
  { hour: 8, messages: 5 },
  { hour: 9, messages: 9 },
  { hour: 10, messages: 10 },
  { hour: 11, messages: 11 },
  { hour: 12, messages: 2 },
  { hour: 13, messages: 8 },
  { hour: 14, messages: 11 },
  { hour: 15, messages: 2 },
  { hour: 16, messages: 8 },
  { hour: 17, messages: 3 },
  { hour: 18, messages: 10 },
  { hour: 19, messages: 2 },
  { hour: 20, messages: 8 },
  { hour: 21, messages: 3 },
  { hour: 22, messages: 10 },
  { hour: 23, messages: 2 }
];

const HourlyActivity = ({ data = mockData }: HourlyActivityProps) => {
  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="hour" 
            domain={[0, 23]}
            type="number"
            ticks={[0, 4, 8, 12, 16, 20, 23]}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(value) => `Hour: ${value}:00`}
            formatter={(value) => [value, 'Messages']}
          />
          <Line 
            type="monotone" 
            dataKey="messages" 
            stroke="#C24816" 
            strokeWidth={2}
            dot={{ fill: '#C24816', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HourlyActivity; 