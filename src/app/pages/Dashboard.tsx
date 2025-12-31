import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileDown,
  TrendingUp
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const kpiData = [
    { title: 'Total Tools', value: 248, icon: <Package className="w-6 h-6" />, color: 'bg-blue-500' },
    { title: 'Usable Tools', value: 195, icon: <CheckCircle className="w-6 h-6" />, color: 'bg-green-500' },
    { title: 'Near Expiry', value: 23, icon: <Clock className="w-6 h-6" />, color: 'bg-amber-500' },
    { title: 'Scrap Tools', value: 30, icon: <AlertTriangle className="w-6 h-6" />, color: 'bg-red-500' },
  ];

  const statusData = [
    { name: 'Usable', value: 195, color: '#16A34A' },
    { name: 'Under Repair', value: 23, color: '#F59E0B' },
    { name: 'Scrap', value: 30, color: '#DC2626' },
  ];

  const siteData = [
    { site: 'Site A', tools: 45 },
    { site: 'Site B', tools: 62 },
    { site: 'Site C', tools: 38 },
    { site: 'Site D', tools: 51 },
    { site: 'Site E', tools: 52 },
  ];

  const expiringTools = [
    { id: 'T045', description: 'Chain Hoist 3T', expiryDate: '2025-01-15', site: 'Site B' },
    { id: 'T092', description: 'Wire Rope 5T', expiryDate: '2025-01-20', site: 'Site A' },
    { id: 'T127', description: 'Shackle 8T', expiryDate: '2025-01-25', site: 'Site D' },
  ];

  const recentInspections = [
    { id: 'T001', description: 'Chain Hoist 5T', date: '2024-12-20', result: 'Pass' },
    { id: 'T034', description: 'Lifting Beam 10T', date: '2024-12-19', result: 'Conditional' },
    { id: 'T089', description: 'Hydraulic Jack 20T', date: '2024-12-18', result: 'Pass' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0F172A]">Management Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of tool inventory and inspection status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{kpi.title}</p>
                  <p className="text-3xl font-semibold mt-2">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>+5.2% from last month</span>
                  </div>
                </div>
                <div className={`${kpi.color} text-white p-3 rounded-lg`}>
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tool Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Site Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Site-wise Tool Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={siteData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="site" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tools" fill="#1E3A8A" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Tools Near Expiry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiringTools.map((tool) => (
                <div key={tool.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{tool.description}</p>
                    <p className="text-sm text-gray-500">ID: {tool.id} • {tool.site}</p>
                  </div>
                  <Badge className="bg-[#F59E0B] text-white">
                    {new Date(tool.expiryDate).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Inspections */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Inspected Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInspections.map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{inspection.description}</p>
                    <p className="text-sm text-gray-500">ID: {inspection.id} • {new Date(inspection.date).toLocaleDateString()}</p>
                  </div>
                  <Badge className={
                    inspection.result === 'Pass' ? 'bg-[#16A34A]' : 'bg-[#F59E0B]'
                  }>
                    {inspection.result}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
