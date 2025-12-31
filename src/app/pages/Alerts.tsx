import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  AlertTriangle, 
  Clock, 
  Wrench, 
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

const Alerts = () => {
  const criticalAlerts = [
    {
      id: 1,
      type: 'expired',
      severity: 'critical',
      title: 'Tool Expired - Immediate Action Required',
      tool: 'Wire Rope Sling 8T',
      toolId: 'T067',
      site: 'Site D',
      message: 'This tool has expired and must be removed from service immediately',
      date: '2024-12-27',
      time: '10:30 AM',
    },
    {
      id: 2,
      type: 'inspection-overdue',
      severity: 'critical',
      title: 'Inspection Overdue',
      tool: 'Hydraulic Jack 15T',
      toolId: 'T089',
      site: 'Site B',
      message: 'Inspection is 15 days overdue. Tool should not be used until inspected',
      date: '2024-12-27',
      time: '09:15 AM',
    },
  ];

  const warningAlerts = [
    {
      id: 3,
      type: 'expiring-soon',
      severity: 'warning',
      title: 'Tool Expiring Soon',
      tool: 'Chain Hoist 5T',
      toolId: 'T001',
      site: 'Site B',
      message: 'Tool certification expires in 10 days. Schedule inspection immediately',
      date: '2024-12-27',
      time: '08:45 AM',
    },
    {
      id: 4,
      type: 'low-usability',
      severity: 'warning',
      title: 'Low Usability Percentage',
      tool: 'Wire Rope 3T',
      toolId: 'T023',
      site: 'Site E',
      message: 'Usability dropped to 65%. Consider replacement soon',
      date: '2024-12-26',
      time: '03:20 PM',
    },
    {
      id: 5,
      type: 'maintenance-due',
      severity: 'warning',
      title: 'Maintenance Due',
      tool: 'Lifting Beam 10T',
      toolId: 'T034',
      site: 'Site A',
      message: 'Scheduled maintenance is due within 5 days',
      date: '2024-12-26',
      time: '11:00 AM',
    },
  ];

  const infoAlerts = [
    {
      id: 6,
      type: 'new-tool',
      severity: 'info',
      title: 'New Tool Added',
      tool: 'Shackle 12T',
      toolId: 'T156',
      site: 'Site C',
      message: 'New tool has been added to the inventory',
      date: '2024-12-26',
      time: '02:30 PM',
    },
    {
      id: 7,
      type: 'transfer',
      severity: 'info',
      title: 'Tool Transfer Completed',
      tool: 'Chain Hoist 8T',
      toolId: 'T045',
      site: 'Site F',
      message: 'Tool successfully transferred from Site C to Site F',
      date: '2024-12-25',
      time: '04:15 PM',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-[#DC2626] bg-red-50';
      case 'warning':
        return 'border-l-[#F59E0B] bg-amber-50';
      case 'info':
        return 'border-l-[#1E3A8A] bg-blue-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-[#DC2626]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-[#1E3A8A]" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-[#DC2626]">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-[#F59E0B]">Warning</Badge>;
      case 'info':
        return <Badge className="bg-[#1E3A8A]">Info</Badge>;
      default:
        return <Badge variant="secondary">Notice</Badge>;
    }
  };

  const handleMarkAsRead = (id: number) => {
    toast.success('Alert marked as read');
  };

  const handleResolve = (id: number) => {
    toast.success('Alert resolved');
  };

  const handleMarkAllAsRead = () => {
    toast.success('All alerts marked as read');
  };

  const handleViewDetails = (id: number) => {
    toast.info('Opening alert details...');
  };

  const AlertCard = ({ alert }: { alert: any }) => (
    <Card className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {getSeverityIcon(alert.severity)}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[#0F172A]">{alert.title}</h3>
                  {getSeverityBadge(alert.severity)}
                </div>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Wrench className="w-4 h-4" />
                <span className="font-mono">{alert.toolId}</span>
                <span>-</span>
                <span>{alert.tool}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{alert.site}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{alert.time}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleMarkAsRead(alert.id)}
              >
                Mark as Read
              </Button>
              <Button 
                size="sm" 
                className="bg-[#1E3A8A]"
                onClick={() => handleResolve(alert.id)}
              >
                Resolve
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleViewDetails(alert.id)}>
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0F172A]">Alerts & Notifications</h1>
          <p className="text-gray-500 mt-1">Monitor critical events and warnings</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllAsRead}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-[#DC2626]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Critical Alerts</p>
                <p className="text-3xl font-semibold mt-2">{criticalAlerts.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-[#DC2626]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F59E0B]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Warnings</p>
                <p className="text-3xl font-semibold mt-2">{warningAlerts.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#1E3A8A]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Info Alerts</p>
                <p className="text-3xl font-semibold mt-2">{infoAlerts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#1E3A8A]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Tabs */}
      <Tabs defaultValue="critical" className="space-y-4">
        <TabsList>
          <TabsTrigger value="critical" className="data-[state=active]:bg-[#DC2626] data-[state=active]:text-white">
            Critical ({criticalAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="warning" className="data-[state=active]:bg-[#F59E0B] data-[state=active]:text-white">
            Warnings ({warningAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="info" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
            Info ({infoAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="critical" className="space-y-4">
          {criticalAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </TabsContent>

        <TabsContent value="warning" className="space-y-4">
          {warningAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          {infoAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Alerts;
