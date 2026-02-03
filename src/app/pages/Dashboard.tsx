import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileDown, FileText, RefreshCw, Activity, ShieldCheck, AlertTriangle, Hammer, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { toast } from 'sonner';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        usable: 0,
        scrap: 0,
        expiringSoon: 0,
        overdue: 0
    });
    const [allTools, setAllTools] = useState<any[]>([]);
    const [siteData, setSiteData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tools/');
            const tools = response.data;
            setAllTools(tools);

            // Calculate Stats
            const total = tools.length;
            const usable = tools.filter((t: any) => t.status === 'usable').length;
            const scrap = tools.filter((t: any) => t.status === 'scrap').length;

            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);

            const expiringSoon = tools.filter((t: any) => {
                if (!t.expiry_date) return false;
                const exp = new Date(t.expiry_date);
                return exp > today && exp <= thirtyDaysFromNow;
            }).length;

            const overdue = tools.filter((t: any) => {
                if (!t.last_inspection_date) return true; // Never inspected? Maybe not overdue but needs inspection. 
                // Logic: if next_inspection < today. Next inspection is usually assumed based on last + interval.
                // Assuming 6 months or 1 year? Let's use expiry date for now as "Overdue" if passed.
                if (t.expiry_date) {
                    return new Date(t.expiry_date) < today;
                }
                return false;
            }).length;

            setStats({
                total,
                usable,
                scrap,
                expiringSoon,
                overdue
            });

            // Prepare Chart Data
            // Status Distribution
            setStatusData([
                { name: 'Usable', value: usable, color: '#10B981' },
                { name: 'Scrap', value: scrap, color: '#EF4444' },
            ]);

            // Site Distribution
            const siteCounts: Record<string, number> = {};
            tools.forEach((t: any) => {
                const site = t.current_site || 'Unknown';
                siteCounts[site] = (siteCounts[site] || 0) + 1;
            });
            const siteChartData = Object.keys(siteCounts).map(site => ({
                name: site,
                count: siteCounts[site]
            }));
            setSiteData(siteChartData);

        } catch (error) {
            console.error("Dashboard fetch failed", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleExportExcel = () => {
        try {
            const inventoryData = allTools.map((tool, index) => ({
                "S.No": index + 1,
                "Tool ID": tool.id,
                "Tool Name": tool.description,
                "QR Code": tool.qr_code,
                "Make": tool.make,
                "Capacity": tool.capacity,
                "SWL": tool.safe_working_load,
                "Purchaser Name": tool.purchaser_name,
                "Purchaser Contact": tool.purchaser_contact,
                "Supplier Code": tool.supplier_code,
                "Date of Supply": tool.date_of_supply ? new Date(tool.date_of_supply).toLocaleDateString() : '',
                "Last Inspection": tool.last_inspection_date ? new Date(tool.last_inspection_date).toLocaleDateString() : '',
                "Inspection Result": tool.inspection_result,
                "Usability %": tool.usability_percentage,
                "Validity (Yrs)": tool.validity_period,
                "Expiry Date": tool.expiry_date ? new Date(tool.expiry_date).toLocaleDateString() : '',
                "Subcontractor": tool.subcontractor_name,
                "Previous Site": tool.previous_site,
                "Current Site": tool.current_site,
                "Next Site": tool.next_site,
                "Job Code": tool.job_code,
                "Job Description": tool.job_description,
                "Status": tool.status,
                "Remarks": tool.inspection_remarks || ''
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(inventoryData);

            // Auto-width columns
            const wscols = Object.keys(inventoryData[0] || {}).map(() => ({ wch: 20 }));
            ws['!cols'] = wscols;

            XLSX.utils.book_append_sheet(wb, ws, "Inventory");
            XLSX.writeFile(wb, `Tool_Inventory_Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Inventory exported successfully!");
        } catch (e) {
            console.error(e);
            toast.error("Export failed");
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Tool Inventory Dashboard Summary", 14, 15);

        // Add Stats
        doc.setFontSize(10);
        doc.text(`Total Tools: ${stats.total}`, 14, 25);
        doc.text(`Usable: ${stats.usable}`, 14, 30);
        doc.text(`Scrap: ${stats.scrap}`, 14, 35);

        autoTable(doc, {
            startY: 40,
            head: [['S.No', 'Tool Name', 'QR Code', 'Location', 'Status', 'Expiry']],
            body: allTools.slice(0, 100).map((t, i) => [ // Limit to 100 for summary PDF
                i + 1,
                t.description,
                t.qr_code,
                t.current_site,
                t.status,
                t.expiry_date ? new Date(t.expiry_date).toLocaleDateString() : '-'
            ]),
        });

        doc.save(`Dashboard_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("PDF generated!");
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Dashboard</h1>
                    <p className="text-gray-500">Overview of tool inventory and status</p>
                </div>
                <div className="flex gap-2">

                    <Button variant="outline" onClick={handleExportPDF}>
                        <FileText className="w-4 h-4 mr-2 text-red-600" /> PDF
                    </Button>
                    <Button variant="outline" onClick={handleExportExcel}>
                        <FileDown className="w-4 h-4 mr-2 text-green-600" /> Excel
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Tools</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <Hammer className="w-6 h-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-green-500">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Usable Tools</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.usable}</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-red-500">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Scrap / Unusable</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.scrap}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-amber-500">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Expiring (30 Days)</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-full">
                            <Calendar className="w-6 h-6 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Tools by Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Tools Distribution by Site</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={siteData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3B82F6">
                                    {siteData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
};

export default Dashboard;
