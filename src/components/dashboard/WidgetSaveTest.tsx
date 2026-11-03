import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from '@/context/DashboardContext';
import { toast } from "sonner";

const WidgetSaveTest: React.FC = () => {
  const { widgets, updateWidget } = useDashboard();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testWidgetSave = async () => {
    try {
      addTestResult('Starting widget save test...');
      
      // Find the first widget to test with
      const testWidget = widgets[0];
      if (!testWidget) {
        addTestResult('No widgets found to test with');
        return;
      }

      addTestResult(`Found test widget: ${testWidget.id}`);

      // Create updated widget with new settings
      const updatedWidget = {
        ...testWidget,
        settings: {
          ...testWidget.settings,
          refreshInterval: Math.floor(Math.random() * 100) + 10, // Random interval
          customTitle: `Test Widget ${Date.now()}`,
          showLegend: !testWidget.settings.showLegend
        }
      };

      addTestResult('Created updated widget config');
      addTestResult(`New refresh interval: ${updatedWidget.settings.refreshInterval}`);
      addTestResult(`New title: ${updatedWidget.settings.customTitle}`);

      // Update the widget
      addTestResult(`About to call updateWidget with: ${JSON.stringify(updatedWidget.settings, null, 2)}`);
      updateWidget(updatedWidget);
      addTestResult('Called updateWidget function');

      // Wait a moment and check if the widget was updated
      setTimeout(() => {
        const updatedWidgetInState = widgets.find(w => w.id === testWidget.id);
        if (updatedWidgetInState) {
          addTestResult(`Current widget in state: ${JSON.stringify(updatedWidgetInState.settings, null, 2)}`);
          
          const settingsMatch = updatedWidgetInState.settings.refreshInterval === updatedWidget.settings.refreshInterval;
          const titleMatch = updatedWidgetInState.settings.customTitle === updatedWidget.settings.customTitle;
          const widgetTitleMatch = updatedWidgetInState.title === updatedWidget.settings.customTitle;
          
          addTestResult(`Settings match: ${settingsMatch} (${updatedWidgetInState.settings.refreshInterval} vs ${updatedWidget.settings.refreshInterval})`);
          addTestResult(`Custom title match: ${titleMatch} (${updatedWidgetInState.settings.customTitle} vs ${updatedWidget.settings.customTitle})`);
          addTestResult(`Widget title match: ${widgetTitleMatch} (${updatedWidgetInState.title} vs ${updatedWidget.settings.customTitle})`);
          
          if (settingsMatch && (titleMatch || widgetTitleMatch)) {
            addTestResult('Widget settings updated successfully in state');
            toast.success('Widget save test passed!');
          } else {
            addTestResult('Widget settings not properly updated in state');
            addTestResult(`Expected interval: ${updatedWidget.settings.refreshInterval}, Got: ${updatedWidgetInState.settings.refreshInterval}`);
            addTestResult(`Expected custom title: ${updatedWidget.settings.customTitle}, Got: ${updatedWidgetInState.settings.customTitle}`);
            addTestResult(`Expected widget title: ${updatedWidget.settings.customTitle}, Got: ${updatedWidgetInState.title}`);
            toast.error('Widget save test failed!');
          }
        } else {
          addTestResult('Widget not found in state after update');
          toast.error('Widget save test failed!');
        }

        // Check localStorage
        const savedLayout = localStorage.getItem('dashboard-layout');
        if (savedLayout) {
          try {
            const parsedLayout = JSON.parse(savedLayout);
            const savedWidget = parsedLayout.widgets?.find((w: { id: string }) => w.id === testWidget.id);
            if (savedWidget && savedWidget.settings.refreshInterval === updatedWidget.settings.refreshInterval) {
              addTestResult('Widget settings saved to localStorage');
            } else {
              addTestResult('Widget settings not properly saved to localStorage');
            }
          } catch (error) {
            console.error('Error parsing saved layout:', error);
            addTestResult('Error parsing saved layout from localStorage');
          }
        } else {
          addTestResult('No saved layout found in localStorage');
        }
      }, 2000); // Increased timeout to allow for state updates

    } catch (error) {
      console.error('Error during widget save test:', error);
      addTestResult(`Error during test: ${error}`);
      toast.error('Widget save test failed with error!');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Widget Save Function Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testWidgetSave} variant="default">
            Run Save Test
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
          <h4 className="font-medium mb-2">Test Results:</h4>
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">No test results yet. Click "Run Save Test" to start.</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>What this test does:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Finds the first widget in the dashboard</li>
            <li>Updates its settings (refresh interval, title, legend toggle)</li>
            <li>Calls the updateWidget function</li>
            <li>Verifies the widget state was updated correctly</li>
            <li>Checks if the changes were saved to localStorage</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WidgetSaveTest; 