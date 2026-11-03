import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Target,
  Save,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Edit3,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  performanceTargetsService,
  PerformanceTargets,
  DEFAULT_TARGETS,
} from "@/services/performanceTargetsService";
import { toast } from "sonner";

interface EditablePerformanceTargetsProps {
  projectId?: string;
  clientId?: string;
  className?: string;
}

const EditablePerformanceTargets: React.FC<EditablePerformanceTargetsProps> = ({
  projectId,
  clientId,
  className,
}) => {
  const { t } = useTranslation("dashboard");
  const { textStart, flexRowReverse } = useLang();

  const [targets, setTargets] = useState<PerformanceTargets>(DEFAULT_TARGETS);
  const [editingTargets, setEditingTargets] =
    useState<PerformanceTargets>(DEFAULT_TARGETS);
  const [currentPerformance, setCurrentPerformance] = useState<
    Partial<PerformanceTargets>
  >({});
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPerformanceData();
  }, [projectId, clientId]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);

      // Suppress console noise for performance targets
      const originalWarn = console.warn;
      const originalError = console.error;

      console.warn = (...args) => {
        const message = args.join(" ");
        if (
          !message.includes("Performance targets") &&
          !message.includes("user_performance_targets") &&
          !message.includes("PGRST116")
        ) {
          originalWarn.apply(console, args);
        }
      };

      console.error = (...args) => {
        const message = args.join(" ");
        if (
          !message.includes("Error loading performance data") &&
          !message.includes("user_performance_targets")
        ) {
          originalError.apply(console, args);
        }
      };

      const data =
        await performanceTargetsService.calculatePerformanceVsTargets(
          projectId,
          clientId,
        );

      // Restore console methods
      console.warn = originalWarn;
      console.error = originalError;

      setTargets(data.targets);
      setEditingTargets(data.targets);
      setCurrentPerformance(data.current);
      setPercentages(data.percentages);
    } catch (error) {
      // Use defaults if API fails (e.g., table doesn't exist)
      setTargets(DEFAULT_TARGETS);
      setEditingTargets(DEFAULT_TARGETS);
      setCurrentPerformance({});
      setPercentages({});

      // Only show error toast if it's not a table missing error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        !errorMessage.includes("user_performance_targets") &&
        !errorMessage.includes("PGRST116") &&
        !errorMessage.includes("PGRST301") &&
        !errorMessage.includes("42P01")
      ) {
        toast.error("Failed to load performance targets");
      }
      // Silently use defaults for missing table errors
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const savedTargets = await performanceTargetsService.saveUserTargets(
        editingTargets,
        projectId,
        clientId,
      );
      setTargets(savedTargets);
      setIsEditing(false);
      toast.success("Performance targets saved successfully!", {
        description: "Your BANT/HEAT goals have been updated",
      });

      // Recalculate performance vs targets
      await loadPerformanceData();
    } catch (error) {
      console.error("Error saving targets:", error);
      toast.error("Failed to save performance targets");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingTargets(targets);
    setIsEditing(false);
  };

  const handleTargetChange = (key: keyof PerformanceTargets, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditingTargets((prev) => ({
      ...prev,
      [key]: numValue,
    }));
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-600";
    if (percentage >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 100)
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (percentage >= 80)
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const renderTargetInput = (category: any, targetConfig: any) => {
    const key = targetConfig.key as keyof PerformanceTargets;
    const currentValue = editingTargets[key] as number;
    const actualValue = currentPerformance[key] as number;
    const percentage = percentages[key] || 0;

    return (
      <div key={key} className="space-y-3 p-4 border rounded-lg">
        <div
          className={cn("flex items-center justify-between", flexRowReverse())}
        >
          <div className={textStart()}>
            <Label htmlFor={key} className="text-sm font-medium">
              {targetConfig.label}
            </Label>
            <p className="text-xs text-muted-foreground">
              Current: {actualValue?.toFixed(1) || 0} {targetConfig.suffix}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getPerformanceBadge(percentage)}
            <span
              className={cn(
                "text-sm font-medium",
                getPerformanceColor(percentage),
              )}
            >
              {percentage}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input
              id={key}
              type="number"
              value={currentValue || 0}
              onChange={(e) => handleTargetChange(key, e.target.value)}
              className="h-8 text-sm"
              min="0"
              step={targetConfig.suffix === "%" ? "0.1" : "1"}
            />
          ) : (
            <div className="px-3 py-1 bg-muted rounded text-sm font-medium">
              {currentValue || 0} {targetConfig.suffix}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>Progress</span>
            <span className={getPerformanceColor(percentage)}>
              {actualValue?.toFixed(1) || 0} / {currentValue || 0}
            </span>
          </div>
          <Progress value={Math.min(percentage, 100)} className="h-2" />
        </div>
      </div>
    );
  };

  const targetCategories = performanceTargetsService.getTargetCategories();

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)} dir="ltr">
      <CardHeader>
        {/* Wraps on phones: in one row "Edit Targets" ended past the screen edge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <CardTitle className="text-xl font-semibold">
                {t("performanceTargets.title", "Performance Targets")}
              </CardTitle>
              <CardDescription className="text-sm">
                {t(
                  "performanceTargets.description",
                  "Set and track your BANT/HEAT lead management goals",
                )}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPerformanceData}
              disabled={loading}
              aria-label="Refresh performance targets"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>

            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save
                    className={cn("h-4 w-4 mr-2", saving && "animate-pulse")}
                  />
                  {saving
                    ? t("common:buttons.saving", "Saving...")
                    : t("common:buttons.save", "Save")}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                variant="outline"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Targets
              </Button>
            )}
          </div>
        </div>

        {isEditing && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Adjust your performance targets based on your business goals.
              These targets will be used to calculate your performance
              percentages.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Metrics</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="bant_heat">BANT & HEAT</TabsTrigger>
          </TabsList>

          {Object.entries(targetCategories).map(([categoryKey, category]) => (
            <TabsContent key={categoryKey} value={categoryKey} className="mt-6">
              <div className="space-y-4">
                <div
                  className={cn(
                    "flex items-center gap-2 mb-4",
                    flexRowReverse(),
                  )}
                >
                  <h3 className="text-lg font-semibold">{category.title}</h3>
                  {isEditing ? (
                    <Unlock className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {category.targets.map((targetConfig) =>
                    renderTargetInput(category, targetConfig),
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EditablePerformanceTargets;
