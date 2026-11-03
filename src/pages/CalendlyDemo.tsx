import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Key, 
  User, 
  Link, 
  CheckCircle, 
  RefreshCw,
  ExternalLink,
  Clock,
  Users,
  Settings
} from 'lucide-react';
import { CalendlyPATSetup } from '@/components/CalendlyPATSetup';
import { calendlyService } from '@/services/calendlyService';
import { toast } from 'sonner';

interface CalendlyUserData {
  name: string;
  email: string;
  uri: string;
  scheduling_url: string;
  avatar_url?: string;
  timezone?: string;
  created_at?: string;
}

interface CalendlyEvent {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  location?: {
    type: string;
    location?: string;
    join_url?: string;
  };
  invitees_counter: {
    total: number;
    active: number;
  };
}

export default function CalendlyDemo() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<CalendlyUserData | null>(null);
  const [events, setEvents] = useState<CalendlyEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      const connectionStatus = await calendlyService.getConnectionStatus();
      
      if (connectionStatus.connected && connectionStatus.user) {
        setIsConnected(true);
        setUserData(connectionStatus.user);
        await fetchEvents();
      } else {
        setIsConnected(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Failed to check connection:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!isConnected) return;
    
    try {
      setEventsLoading(true);
      const fetchedEvents = await calendlyService.getScheduledEventsWithPAT({
        count: 10,
        status: 'active',
        sort: 'start_time:asc'
      });
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleConnectionSuccess = (user: CalendlyUserData) => {
    setIsConnected(true);
    setUserData(user);
    fetchEvents();
    toast.success('Calendly connected successfully!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Checking Calendly connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Calendly Integration Demo
          </h1>
          <p className="text-gray-600">
            Showcase your Calendly data with Personal Access Token - No OAuth approval needed! INIT
          </p>
        </div>

        {!isConnected ? (
          <div className="space-y-6">
            {/* Benefits Alert */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>No Google/OAuth approval required!</strong> Connect instantly with your Calendly Personal Access Token.
                Takes only 2 minutes vs weeks of waiting for OAuth approval.
              </AlertDescription>
            </Alert>

            {/* Setup Component */}
            <CalendlyPATSetup onSuccess={handleConnectionSuccess} />

            {/* Quick Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-green-600" />
                  Why PAT is Better Than OAuth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-green-700">Personal Access Token</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Setup time: 2 minutes</li>
                      <li>• No developer account needed</li>
                      <li>• Works immediately</li>
                      <li>• No approval process</li>
                      <li>• Perfect for demos & showcases</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-700">OAuth Method</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Setup time: 30+ minutes</li>
                      <li>• Requires developer account</li>
                      <li>• Google approval: weeks</li>
                      <li>• Complex token refresh</li>
                      <li>• Overkill for simple integration</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Connected Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Key className="h-3 w-3 mr-1" />
                    Personal Access Token
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Connection method: Direct API access
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* User Data Showcase */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Your Calendly Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Name:</span>
                          <span>{userData.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Email:</span>
                          <span>{userData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Scheduling URL:</span>
                          <a 
                            href={userData.scheduling_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {userData.scheduling_url.replace('https://', '')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Calendly URI:</span>
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {userData.uri.split('/').pop()}
                          </span>
                        </div>
                        {userData.timezone && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Timezone:</span>
                            <span>{userData.timezone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Events Showcase */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Your Upcoming Events
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchEvents}
                    disabled={eventsLoading}
                  >
                    {eventsLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming events found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Schedule a meeting to see events here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{event.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDate(event.start_time)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.invitees_counter.active}/{event.invitees_counter.total} attendees
                              </div>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Link className="h-4 w-4" />
                                {event.location.type}: {event.location.location || 'Online meeting'}
                              </div>
                            )}
                          </div>
                          <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Demo Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-orange-600" />
                  Live Demo Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => window.open(userData?.scheduling_url, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Open Scheduling Page
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={fetchEvents}
                    disabled={eventsLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Events
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={checkConnection}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 