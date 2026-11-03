import {
  XCircle,
  TrendingUp,
  TrendingDown,
  TrendingDown as DataIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ConversationsAbandonedProps {
  data?: {
    total: number;
    trend: number;
    timeRange: string;
    abandonmentRate: number;
    stageBreakdown?: {
      stage: string;
      count: number;
      percentage: number;
      color: string;
    }[];
  };
}

const mockData = {
  total: 156,
  trend: -8.2,
  timeRange: "This Week",
  abandonmentRate: 48.1,
  stageBreakdown: [
    { stage: "Initial", count: 67, percentage: 43, color: "#A5332D" },
    { stage: "Middle", count: 52, percentage: 33, color: "#F97316" },
    { stage: "Final", count: 37, percentage: 24, color: "#D69A2E" },
  ],
};

const ConversationsAbandoned = ({
  data = mockData,
}: ConversationsAbandonedProps) => {
  const isPositive = data.trend >= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Conversations Abandoned
          </p>
          <h2 className="text-3xl font-bold">{data.total.toLocaleString()}</h2>
        </div>
        <XCircle className="h-8 w-8 text-red-500" />
      </div>

      <div className="flex items-center space-x-2">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <span
          className={`text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}
        >
          {Math.abs(data.trend)}% {isPositive ? "increase" : "decrease"}
        </span>
        <span className="text-sm text-muted-foreground">
          vs {data.timeRange}
        </span>
      </div>

      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
        <DataIcon className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">
          {data.abandonmentRate}% abandonment rate
        </span>
      </div>

      {data.stageBreakdown && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Abandonment by Stage:
          </p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.stageBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={50}
                  dataKey="count"
                >
                  {data.stageBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Abandoned"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1">
            {data.stageBreakdown.map((stage) => (
              <div key={stage.stage} className="flex justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-muted-foreground">{stage.stage}:</span>
                </div>
                <span className="font-medium">
                  {stage.count} ({stage.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsAbandoned;
