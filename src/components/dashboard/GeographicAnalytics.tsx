import React from 'react';
import { Globe } from '@/components/ui/globe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GeographicData {
  country: string;
  lat: number;
  lng: number;
  leads: number;
  conversions: number;
}

const sampleData: GeographicData[] = [
  { country: 'Israel', lat: 31.5, lng: 34.75, leads: 150, conversions: 23 },
  { country: 'United States', lat: 39.8, lng: -98.5, leads: 89, conversions: 15 },
  { country: 'Germany', lat: 51.2, lng: 10.4, leads: 67, conversions: 12 },
  { country: 'United Kingdom', lat: 55.3, lng: -3.4, leads: 45, conversions: 8 },
  { country: 'France', lat: 46.6, lng: 2.2, leads: 34, conversions: 6 },
  { country: 'Canada', lat: 56.1, lng: -106.3, leads: 28, conversions: 5 },
];

const GeographicAnalytics: React.FC = () => {
  const { t } = useTranslation('dashboard');
  
  const globeData = sampleData.map(item => ({
    lat: item.lat,
    lng: item.lng,
    value: item.leads,
    label: `${item.country}: ${item.leads} leads`
  }));

  const totalLeads = sampleData.reduce((sum, item) => sum + item.leads, 0);
  const totalConversions = sampleData.reduce((sum, item) => sum + item.conversions, 0);
  const conversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : '0';

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          {t('geographic.title', 'Geographic Distribution')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Globe Visualization */}
        <div className="relative h-64 w-full">
          <Globe
            data={globeData}
            globeColor="#A93D10"
            pointColor="#C24816"
            backgroundColor="#f8fafc"
            className="w-full h-full"
          />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totalLeads.toLocaleString()}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              {t('geographic.totalLeads', 'Total Leads')}
            </div>
          </div>

          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {totalConversions}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {t('geographic.conversions', 'Conversions')}
            </div>
          </div>

          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <span className="text-purple-600 text-sm">%</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {conversionRate}%
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              {t('geographic.conversionRate', 'Conversion Rate')}
            </div>
          </div>
        </div>

        {/* Country List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
            {t('geographic.topCountries', 'Top Countries')}
          </h4>
          {sampleData.slice(0, 5).map((country, _index) => (
            <div key={country.country} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {country.country}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                  {country.leads}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {country.conversions} conv.
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicAnalytics; 