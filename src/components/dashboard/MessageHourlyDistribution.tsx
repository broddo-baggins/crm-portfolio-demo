import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MessageHourlyDistributionProps {
  data?: {
    hour: number;
    messages: number;
  }[];
}

const mockData = [
  { hour: 0, messages: 2 },
  { hour: 1, messages: 1 },
  { hour: 2, messages: 0 },
  { hour: 3, messages: 1 },
  { hour: 4, messages: 3 },
  { hour: 5, messages: 5 },
  { hour: 6, messages: 8 },
  { hour: 7, messages: 12 },
  { hour: 8, messages: 18 },
  { hour: 9, messages: 25 },
  { hour: 10, messages: 32 },
  { hour: 11, messages: 28 },
  { hour: 12, messages: 24 },
  { hour: 13, messages: 30 },
  { hour: 14, messages: 35 },
  { hour: 15, messages: 28 },
  { hour: 16, messages: 22 },
  { hour: 17, messages: 18 },
  { hour: 18, messages: 15 },
  { hour: 19, messages: 12 },
  { hour: 20, messages: 8 },
  { hour: 21, messages: 5 },
  { hour: 22, messages: 3 },
  { hour: 23, messages: 2 }
];

const MessageHourlyDistribution = ({ data = mockData }: MessageHourlyDistributionProps) => {
  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            scale="linear"
            ticks={[0, 6, 12, 18, 23]}
            tickFormatter={(value) => `${value}:00`}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(value) => `Hour: ${value}:00`}
            formatter={(value) => [value, 'Messages']}
          />
          <Bar 
            dataKey="messages" 
            fill="#C24816" 
            radius={[2, 2, 0, 0]}
            maxBarSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MessageHourlyDistribution; 