import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
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
import { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    usable: 0,
    scrap: 0,
    nearExpiry: 0
  });

  const [recentInspections, setRecentInspections] = useState<any[]>([]);
  const [siteData, setSiteData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const toolsResponse = await api.get('/tools/');
        const tools = toolsResponse.data;

        let total = tools.length;
        let usable = 0;
        let scrap = 0;
        const siteCount: Record<string, number> = {};

        tools.forEach((tool: any) => {
          if (tool.status === 'usable') {
            usable++;
          } else {
            scrap++;
          }

          const site = tool.current_site || 'Unassigned';
          siteCount[site] = (siteCount[site] || 0) + 1;
        });

        setStats({
          total,
          usable,
          scrap,
          nearExpiry: 0
        });

        const newSiteData = Object.keys(siteCount).map(site => ({
          site,
          tools: siteCount[site]
        }));
        setSiteData(newSiteData);

        const inspectionsResponse = await api.get('/inspections/');
        const inspectionsData = inspectionsResponse.data.map((insp: any) => ({
          id: insp.tool?.qr_code || insp.tool_id,
          description: insp.tool?.description || 'Unknown Tool',
          date: insp.date,
          result: insp.result
        }));

        setRecentInspections(inspectionsData);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, []);

  const kpiData = [
    { title: 'Total Tools', value: stats.total, icon: <Package className="w-6 h-6" />, color: 'bg-blue-500' },
    { title: 'Usable Tools', value: stats.usable, icon: <CheckCircle className="w-6 h-6" />, color: 'bg-green-500' },
    { title: 'Near Expiry', value: stats.nearExpiry, icon: <Clock className="w-6 h-6" />, color: 'bg-amber-500' },
    { title: 'Scrap Tools', value: stats.scrap, icon: <AlertTriangle className="w-6 h-6" />, color: 'bg-red-500' },
  ];

  const statusData = [
    { name: 'Usable', value: stats.usable, color: '#16A34A' },
    { name: 'Scrap', value: stats.scrap, color: '#DC2626' },
  ];

  const expiringTools = [
    { id: 'T045', description: 'Chain Hoist 3T', expiryDate: '2025-01-15', site: 'Site B' },
  ];

  const handleExportPDF = () => {
    try {
      console.log("Starting PDF Export...");
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text('Tool Management Dashboard Report', 14, 22);

      // Date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      // KPIs
      doc.setFontSize(14);
      doc.text('Key Performance Indicators', 14, 45);

      const kpiRows = [
        ['Total Tools', stats.total],
        ['Usable Tools', stats.usable],
        ['Scrap/Repair', stats.scrap],
        ['Near Expiry', stats.nearExpiry]
      ];

      autoTable(doc, {
        startY: 50,
        head: [['Metric', 'Value']],
        body: kpiRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138] } // #1E3A8A
      });

      // Recent Inspections
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.text('Recent Inspections', 14, finalY + 15);

      const inspectionRows = recentInspections.map(insp => [
        insp.description,
        insp.id,
        new Date(insp.date).toLocaleDateString(),
        insp.result.toUpperCase()
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Tool', 'ID/QR', 'Date', 'Result']],
        body: inspectionRows,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] }
      });

      // Site Distribution
      const finalY2 = (doc as any).lastAutoTable.finalY || 150;
      doc.text('Site Distribution Summary', 14, finalY2 + 15);

      const siteRows = siteData.map(s => [s.site, s.tools]);
      autoTable(doc, {
        startY: finalY2 + 20,
        head: [['Site', 'Tool Count']],
        body: siteRows,
        theme: 'grid'
      });

      doc.save('dashboard-report.pdf');
      toast.success("PDF Report generated successfully");
    } catch (error) {
      console.error("PDF Export failed:", error);
      toast.error("Failed to generate PDF. Check console for details.");
    }
  };

  const handleExportExcel = () => {
    try {
      console.log("Starting Excel Export...");
      // Worksheet 1: Summary Steps
      const summaryData = [
        { Metric: 'Total Tools', Value: stats.total },
        { Metric: 'Usable Tools', Value: stats.usable },
        { Metric: 'Scrap Tools', Value: stats.scrap }
      ];

      // Worksheet 2: Recent Inspections
      const inspectionData = recentInspections.map(insp => ({
        Tool: insp.description,
        ID: insp.id,
        Date: new Date(insp.date).toLocaleDateString(),
        Result: insp.result
      }));

      // Worksheet 3: Site Distribution
      const siteDistData = siteData.map(s => ({
        Site: s.site,
        Count: s.tools
      }));

      const wb = XLSX.utils.book_new();

      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      const wsInspections = XLSX.utils.json_to_sheet(inspectionData);
      XLSX.utils.book_append_sheet(wb, wsInspections, "Inspections");

      const wsSites = XLSX.utils.json_to_sheet(siteDistData);
      XLSX.utils.book_append_sheet(wb, wsSites, "Site Distribution");

      XLSX.writeFile(wb, "dashboard-export.xlsx");
      toast.success("Excel Export generated successfully");
    } catch (error) {
      console.error("Excel Export failed:", error);
      toast.error("Failed to generate Excel file.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0F172A]">Management Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of tool inventory and inspection status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileDown className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>
      {/* ... rest of component ... */}

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
              {recentInspections.map((inspection, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{inspection.description}</p>
                    <p className="text-sm text-gray-500 font-mono">ID: {inspection.id}</p>
                    <p className="text-xs text-gray-400">{new Date(inspection.date).toLocaleDateString()}</p>
                  </div>
                  <Badge className={
                    inspection.result === 'pass' ? 'bg-[#16A34A] capitalize' : 'bg-[#DC2626] capitalize'
                  }>
                    {inspection.result}
                  </Badge>
                </div>
              ))}
              {recentInspections.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent inspections</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
