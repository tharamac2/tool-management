import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileDown, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '../components/ui/date-picker';

const Reports = () => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [reportType, setReportType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toolInventoryData = [
    { id: 'T001', description: 'Chain Hoist 5T', site: 'Site B', status: 'Usable', lastInspection: '2024-11-20', expiry: '2025-11-20' },
    { id: 'T002', description: 'Wire Rope Sling 10T', site: 'Site E', status: 'Usable', lastInspection: '2024-10-15', expiry: '2025-01-15' },
    { id: 'T003', description: 'Hydraulic Jack 20T', site: 'Site H', status: 'Scrap', lastInspection: '2024-12-01', expiry: '2024-12-01' },
  ];

  const inspectionHistory = [
    { toolId: 'T001', description: 'Chain Hoist 5T', inspector: 'John Doe', date: '2024-11-20', result: 'Pass', usability: '95%' },
    { toolId: 'T034', description: 'Lifting Beam 10T', inspector: 'Jane Smith', date: '2024-12-19', result: 'Conditional', usability: '75%' },
    { toolId: 'T089', description: 'Hydraulic Jack 20T', inspector: 'John Doe', date: '2024-12-18', result: 'Pass', usability: '90%' },
  ];

  const maintenanceRecords = [
    { toolId: 'T023', description: 'Wire Rope 3T', type: 'Repair', date: '2024-11-15', cost: '$250', status: 'Completed' },
    { toolId: 'T045', description: 'Shackle 5T', type: 'Replacement', date: '2024-12-01', cost: '$120', status: 'In Progress' },
    { toolId: 'T067', description: 'Chain Hoist 10T', type: 'Service', date: '2024-12-10', cost: '$180', status: 'Completed' },
  ];

  const siteTransfers = [
    { toolId: 'T012', description: 'Lifting Beam 5T', from: 'Site A', to: 'Site C', date: '2024-12-15', approvedBy: 'Manager A' },
    { toolId: 'T034', description: 'Wire Rope 8T', from: 'Site B', to: 'Site D', date: '2024-12-18', approvedBy: 'Manager B' },
    { toolId: 'T056', description: 'Hydraulic Jack 15T', from: 'Site C', to: 'Site E', date: '2024-12-20', approvedBy: 'Manager C' },
  ];

  const handleExport = (format: string) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
  };

  const handleApplyFilters = () => {
    toast.success('Filters applied successfully');
  };

  const handleClearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setReportType('all');
    setSearchQuery('');
    toast.success('Filters cleared');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Usable':
      case 'Pass':
      case 'Completed':
        return <Badge className="bg-[#16A34A]">{status}</Badge>;
      case 'Conditional':
      case 'In Progress':
        return <Badge className="bg-[#F59E0B]">{status}</Badge>;
      case 'Scrap':
      case 'Fail':
        return <Badge className="bg-[#DC2626]">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0F172A]">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and view comprehensive reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <FileDown className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="inventory">Tool Inventory</SelectItem>
                  <SelectItem value="inspection">Inspection History</SelectItem>
                  <SelectItem value="maintenance">Maintenance Records</SelectItem>
                  <SelectItem value="transfers">Site Transfers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From Date</Label>
              <DatePicker
                date={dateFrom}
                onDateChange={setDateFrom}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <DatePicker
                date={dateTo}
                onDateChange={setDateTo}
              />
            </div>
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tools..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="bg-[#1E3A8A]" onClick={handleApplyFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Tool Inventory</TabsTrigger>
          <TabsTrigger value="inspection">Inspection History</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Records</TabsTrigger>
          <TabsTrigger value="transfers">Site Transfers</TabsTrigger>
        </TabsList>

        {/* Tool Inventory Report */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Tool Inventory Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Inspection</TableHead>
                    <TableHead>Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {toolInventoryData.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell className="font-mono">{tool.id}</TableCell>
                      <TableCell>{tool.description}</TableCell>
                      <TableCell>{tool.site}</TableCell>
                      <TableCell>{getStatusBadge(tool.status)}</TableCell>
                      <TableCell>{new Date(tool.lastInspection).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(tool.expiry).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inspection History Report */}
        <TabsContent value="inspection">
          <Card>
            <CardHeader>
              <CardTitle>Inspection History Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Usability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspectionHistory.map((inspection, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{inspection.toolId}</TableCell>
                      <TableCell>{inspection.description}</TableCell>
                      <TableCell>{inspection.inspector}</TableCell>
                      <TableCell>{new Date(inspection.date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(inspection.result)}</TableCell>
                      <TableCell>{inspection.usability}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Records Report */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Records Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{record.toolId}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">{record.cost}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site Transfers Report */}
        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Site Transfer Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>From Site</TableHead>
                    <TableHead>To Site</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Approved By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {siteTransfers.map((transfer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{transfer.toolId}</TableCell>
                      <TableCell>{transfer.description}</TableCell>
                      <TableCell>{transfer.from}</TableCell>
                      <TableCell>{transfer.to}</TableCell>
                      <TableCell>{new Date(transfer.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transfer.approvedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
