import { Calendar, Send, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MeetingsVsMessagesProps {
  title?: string;
  data?: {
    conversionRate?: number;
    trend?: number;
    timeRange?: string;
    totalMeetings?: number;
    totalMessages?: number;
    chartData?: {
      period: string;
      meetings: number;
      messages: number;
      rate: number;
    }[];
  };
}

const getWidgetData = (title?: string) => {
  switch (title) {
    case 'Meetings Set':
      return {
        total: 0,
        trend: -5,
        timeRange: 'last week',
        label: 'Meetings Set',
        icon: Calendar
      };
    default:
      return {
        conversionRate: 3.2,
        trend: 12.8,
        timeRange: 'This Week',
        totalMeetings: 89,
        totalMessages: 2847,
        chartData: [
          { period: 'Mon', meetings: 12, messages: 456, rate: 2.6 },
          { period: 'Tue', meetings: 15, messages: 523, rate: 2.9 },
          { period: 'Wed', meetings: 18, messages: 467, rate: 3.9 },
          { period: 'Thu', meetings: 22, messages: 612, rate: 3.6 },
          { period: 'Fri', meetings: 14, messages: 389, rate: 3.6 },
          { period: 'Sat', meetings: 5, messages: 234, rate: 2.1 },
          { period: 'Sun', meetings: 3, messages: 166, rate: 1.8 }
        ]
      };
  }
};

const MeetingsVsMessages = ({ title, data }: MeetingsVsMessagesProps) => {
  const widgetData = getWidgetData(title);

  if (title === 'Meetings Set') {
    const isPositive = widgetData.trend >= 0;
    const IconComponent = widgetData.icon;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{widgetData.label}</p>
            <h2 className="text-3xl font-bold">{data?.totalMeetings || widgetData.total}</h2>
          </div>
          <IconComponent className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div className="flex items-center space-x-2">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(data?.trend || widgetData.trend)}% from {data?.timeRange || widgetData.timeRange}
          </span>
        </div>
      </div>
    );
  }

  // Original meetings vs messages functionality
  const displayData = data || widgetData;
  const isPositive = displayData.trend >= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Meetings vs Messages</p>
          <h2 className="text-3xl font-bold">{displayData.conversionRate?.toFixed(1)}%</h2>
        </div>
        <div className="flex space-x-2">
          <Calendar className="h-6 w-6 text-green-500" />
          <Send className="h-6 w-6 text-blue-500" />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {Math.abs(displayData.trend)}% {isPositive ? 'increase' : 'decrease'}
        </span>
        <span className="text-sm text-muted-foreground">vs {displayData.timeRange}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="font-bold text-green-700">{displayData.totalMeetings}</div>
          <div className="text-green-600">Meetings</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="font-bold text-blue-700">{displayData.totalMessages?.toLocaleString()}</div>
          <div className="text-blue-600">Messages</div>
        </div>
      </div>

      {displayData.chartData && (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'rate' ? `${value}%` : value,
                  name === 'rate' ? 'Conversion Rate' : name === 'meetings' ? 'Meetings' : 'Messages'
                ]}
              />
              <Bar dataKey="rate" fill="#367E50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MeetingsVsMessages; 