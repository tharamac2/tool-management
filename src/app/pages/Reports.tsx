import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Download, Search, X } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports() {
    const [tools, setTools] = useState<any[]>([]);
    const [globalSearch, setGlobalSearch] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchTools = async () => {
            try {
                const response = await api.get('/tools/');
                const sortedTools = response.data.sort((a: any, b: any) => b.id - a.id);
                setTools(sortedTools);
            } catch (error) {
                console.error("Failed to fetch tools report", error);
            }
        };
        fetchTools();
    }, []);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setGlobalSearch("");
        setFilters({});
    };

    const filteredTools = tools.filter(tool => {
        // 1. Global Search
        const searchStr = globalSearch.toLowerCase();
        const globalMatch = !globalSearch || [
            tool.description, tool.qr_code, tool.make, tool.capacity, tool.safe_working_load,
            tool.purchaser_name, tool.subcontractor_name, tool.current_site, tool.status,
            tool.inspection_result
        ].some(val => val?.toString().toLowerCase().includes(searchStr));

        if (!globalMatch) return false;

        // 2. Column Filters
        return Object.entries(filters).every(([key, filterVal]) => {
            if (!filterVal || filterVal === 'all') return true;
            const toolVal = tool[key]?.toString().toLowerCase() || "";
            return toolVal.includes(filterVal.toLowerCase());
        });
    });

    const downloadCSV = () => {
        if (filteredTools.length === 0) return;

        const headers = [
            "S.No", "Tool ID", "Tool Name", "QR Code", "Make (Year)", "Capacity", "SWL",
            "Purchaser Name", "Purchaser Contact", "Supplier Code", "Date of Supply",
            "Last Inspection", "Inspection Result", "Usability %", "Validity (Yrs)", "Expiry Date",
            "Subcontractor", "Subcontractor Code", "Previous Site", "Current Site", "Next Site", "Status", "Remarks", "Test Certificate"
        ];

        const csvRows = [
            headers.join(','),
            ...filteredTools.map((tool, index) => [
                index + 1,
                tool.id || '',
                `"${tool.description?.replace(/"/g, '""') || ''}"`,
                `"${tool.qr_code || ''}"`,
                `"${tool.make || ''}"`,
                `"${tool.capacity || ''}"`,
                `"${tool.safe_working_load || ''}"`,
                `"${tool.purchaser_name || ''}"`,
                `"${tool.purchaser_contact || ''}"`,
                `"${tool.supplier_code || ''}"`,
                tool.date_of_supply ? new Date(tool.date_of_supply).toLocaleDateString() : '',
                tool.last_inspection_date ? new Date(tool.last_inspection_date).toLocaleDateString() : '',
                tool.inspection_result || '',
                tool.usability_percentage || '',
                tool.validity_period || '',
                tool.expiry_date ? new Date(tool.expiry_date).toLocaleDateString() : '',
                `"${tool.subcontractor_name || ''}"`,
                `"${tool.subcontractor_code || ''}"`,
                `"${tool.previous_site || ''}"`,
                `"${tool.current_site || ''}"`,
                `"${tool.next_site || ''}"`,
                tool.status || '',
                `"${tool.remarks || ''}"`,
                tool.test_certificate ? `"http://localhost:8000${tool.test_certificate}"` : ''
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tools_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadPDF = () => {
        if (filteredTools.length === 0) return;

        const doc = new jsPDF('landscape');

        doc.setFontSize(18);
        doc.text("Tool Inventory Report", 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = [
            "S.No", "Tool Name", "QR Code", "Make", "Capacity", "SWL", "Purchaser",
            "Supply Date", "Last Insp.", "Result", "Subcon", "Site", "Status"
        ];

        const tableRows = filteredTools.map((tool, index) => [
            index + 1,
            tool.description,
            tool.qr_code,
            tool.make,
            tool.capacity,
            tool.safe_working_load,
            tool.purchaser_name,
            tool.date_of_supply ? new Date(tool.date_of_supply).toLocaleDateString() : '-',
            tool.last_inspection_date ? new Date(tool.last_inspection_date).toLocaleDateString() : '-',
            tool.inspection_result,
            tool.subcontractor_name,
            tool.current_site,
            tool.status
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [30, 58, 138] }, // #1E3A8A
        });

        doc.save(`tools_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="max-w-[95vw] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-[#0F172A]">Tool Inventory Report</h1>
                    <p className="text-gray-500 mt-1">Comprehensive list of all tools and their details.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={clearFilters} title="Clear all filters">
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                    </Button>
                    <Button onClick={downloadPDF} variant="outline" className="border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button onClick={downloadCSV} className="bg-[#1E3A8A]">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Global Search..."
                        className="pl-9 bg-white"
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Detailed Inventory ({filteredTools.length} tools)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table className="min-w-max">
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="min-w-[150px]">Tool Name</TableHead>
                                    <TableHead className="min-w-[100px]">QR Code</TableHead>
                                    <TableHead className="min-w-[100px]">Make</TableHead>
                                    <TableHead className="min-w-[100px]">Capacity</TableHead>
                                    <TableHead className="min-w-[100px]">SWL</TableHead>
                                    <TableHead className="min-w-[150px]">Purchaser</TableHead>
                                    <TableHead className="min-w-[100px]">Supply Date</TableHead>
                                    <TableHead className="min-w-[100px]">Last Insp.</TableHead>
                                    <TableHead className="min-w-[100px]">Result</TableHead>
                                    <TableHead className="min-w-[150px]">Subcontractor</TableHead>
                                    <TableHead className="min-w-[150px]">Current Site</TableHead>
                                    <TableHead className="min-w-[100px]">Status</TableHead>
                                    <TableHead className="min-w-[100px]">Certificate</TableHead>
                                </TableRow>
                                {/* Column Filters Row */}
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableCell className="p-2"><Input className="h-8 text-xs bg-white" placeholder="Filter Name" value={filters.description || ''} onChange={e => handleFilterChange('description', e.target.value)} /></TableCell>
                                    <TableCell className="p-2"><Input className="h-8 text-xs bg-white" placeholder="Filter QR" value={filters.qr_code || ''} onChange={e => handleFilterChange('qr_code', e.target.value)} /></TableCell>
                                    <TableCell className="p-2"><Input className="h-8 text-xs bg-white" placeholder="Filter Make" value={filters.make || ''} onChange={e => handleFilterChange('make', e.target.value)} /></TableCell>
                                    <TableCell className="p-2"><Input className="h-8 text-xs bg-white" placeholder="Filter Cap" value={filters.capacity || ''} onChange={e => handleFilterChange('capacity', e.target.value)} /></TableCell>
                                    <TableCell className="p-2"><Input className="h-8 text-xs bg-white" placeholder="Filter SWL" value={filters.safe_working_load || ''} onChange={e => handleFilterChange('safe_working_load', e.target.value)} /></TableCell>
                                    <TableCell className="p-2"><Input className="h-8 text-xs bg-white" placeholder="Filter Purchaser" value={filters.purchaser_name || ''} onChange={e => handleFilterChange('purchaser_name', e.target.value)} /></TableCell>
                                    <TableCell className="p-2"><Input className="h-8 text-xs bg-white" placeholder="Filter Supply Date" value={filters.date_of_supply || ''} onChange={e => handleFilterChange('date_of_supply', e.target.value)} /></TableCell>
                                    <TableCell className="p-2"><Input className="h-8 text-xs bg-white" placeholder="Filter Insp Date" value={filters.last_inspection_date || ''} onChange={e => handleFilterChange('last_inspection_date', e.target.value)} /></TableCell>
                                    <TableCell className="p-2">
                                        <Select value={filters.inspection_result || 'all'} onValueChange={val => handleFilterChange('inspection_result', val)}>
                                            <SelectTrigger className="h-8 text-xs bg-white"><SelectValue placeholder="All" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="usable">Usable</SelectItem>
                                                <SelectItem value="not-usable">Non Usable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="p-2"><Input className="h-8 text-xs bg-white" placeholder="Filter Subcon" value={filters.subcontractor_name || ''} onChange={e => handleFilterChange('subcontractor_name', e.target.value)} /></TableCell>
                                    <TableCell className="p-2"><Input className="h-8 text-xs bg-white" placeholder="Filter Site" value={filters.current_site || ''} onChange={e => handleFilterChange('current_site', e.target.value)} /></TableCell>
                                    <TableCell className="p-2">
                                        <Select value={filters.status || 'all'} onValueChange={val => handleFilterChange('status', val)}>
                                            <SelectTrigger className="h-8 text-xs bg-white"><SelectValue placeholder="All" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="usable">Usable</SelectItem>
                                                <SelectItem value="scrap">Scrap</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="p-2"></TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTools.length > 0 ? (
                                    filteredTools.map((tool) => (
                                        <TableRow key={tool.id} className="hover:bg-gray-50/50">
                                            <TableCell className="font-medium text-[#1E3A8A]">{tool.description}</TableCell>
                                            <TableCell className="font-mono text-xs">{tool.qr_code}</TableCell>
                                            <TableCell>{tool.make}</TableCell>
                                            <TableCell>{tool.capacity}</TableCell>
                                            <TableCell>{tool.safe_working_load}</TableCell>
                                            <TableCell>{tool.purchaser_name || '-'}</TableCell>
                                            <TableCell>{tool.date_of_supply ? new Date(tool.date_of_supply).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>{tool.last_inspection_date ? new Date(tool.last_inspection_date).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell className="capitalize">{tool.inspection_result || '-'}</TableCell>
                                            <TableCell>{tool.subcontractor_name || '-'}</TableCell>
                                            <TableCell>{tool.current_site || '-'}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${tool.status === 'usable' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {tool.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {tool.test_certificate ? (
                                                    <a
                                                        href={`http://localhost:8000${tool.test_certificate}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                    >
                                                        <Download className="w-3 h-3 mr-1" />
                                                        Download
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={12} className="h-24 text-center">
                                            No tools found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
