import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, Save, Edit, Search } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '../components/ui/date-picker';
import { Html5Qrcode } from 'html5-qrcode';
import { useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const ToolMaster = () => {
  const [savedTools, setSavedTools] = useState<any[]>([]);
  const [baseUrl, setBaseUrl] = useState(window.location.origin);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await api.get('/system/ip');
        if (res.data.ip && res.data.ip !== 'localhost') {
          // dynamic port
          setBaseUrl(`http://${res.data.ip}:${window.location.port}`);
        }
      } catch (e) {
        console.warn("Could not fetch system IP, defaulting to origin");
      }
    };
    fetchIp();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await api.get('/tools/'); // Ensure trailing slash if required by backend
      setSavedTools(response.data);
    } catch (error) {
      console.error("Failed to fetch tools", error);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const [toolData, setToolData] = useState({
    description: '',
    make: new Date().getFullYear().toString(),
    capacity: '',
    safeWorkingLoad: '',
    purchaserName: '',
    purchaserContact: '',
    dateOfSupply: undefined as Date | undefined,
    lastInspectionDate: undefined as Date | undefined,
    inspectionResult: 'usable',
    usabilityPercentage: '',
    validityPeriod: '',
    subcontractorName: '',
    previousSite: '',
    currentSite: '',
    nextSite: '',
  });


  const [qrCode, setQrCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTools = savedTools.filter(tool => {
    const matchesSearch =
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.qr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.current_site?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || tool.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ... (useState definitions)

  const handleInputChange = (field: string, value: string) => {
    setToolData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    setToolData(prev => ({ ...prev, [field]: date }));
  };

  const generateQRCode = () => {
    const code = `TOOL-${Date.now()}`;
    setQrCode(code);
    handleInputChange('qrCode', code); // Ensure this is saved
    toast.success('QR Code generated successfully');
  };

  const [editingToolId, setEditingToolId] = useState<number | null>(null);

  // ... (existing useState)

  const generateSmartId = (description: string) => {
    // 1. Get first 2 letters, default to 'TL' if missing
    let prefix = 'TL';
    if (description && description.length >= 2) {
      prefix = description.substring(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
    }

    // 2. Generate random alphanumeric (3-5 chars)
    // We'll use 4 chars to make total 6 chars (middle of 5-7 range)
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${prefix}${randomPart}`;
  };

  const handleSave = async () => {
    try {
      let finalQrCode = qrCode;
      if (!finalQrCode) {
        // Generate Smart ID
        finalQrCode = generateSmartId(toolData.description);
        setQrCode(finalQrCode);
        handleInputChange('qrCode', finalQrCode);
        toast.info(`Generated QR Code: ${finalQrCode}`);
      }

      const payload = {
        ...toolData,
        qr_code: finalQrCode, // Use the smart generated code
        safe_working_load: toolData.safeWorkingLoad,
        purchaser_name: toolData.purchaserName,
        purchaser_contact: toolData.purchaserContact,
        date_of_supply: toolData.dateOfSupply,
        last_inspection_date: toolData.lastInspectionDate,
        inspection_result: toolData.inspectionResult,
        usability_percentage: toolData.usabilityPercentage ? parseFloat(toolData.usabilityPercentage) : null,
        validity_period: toolData.validityPeriod ? parseInt(toolData.validityPeriod) : null,
        subcontractor_name: toolData.subcontractorName,
        previous_site: toolData.previousSite,
        current_site: toolData.currentSite,
        next_site: toolData.nextSite,
        status: 'usable'
      };

      if (editingToolId) {
        // Update existing tool
        await api.patch(`/tools/${editingToolId}`, payload);
        toast.success('Tool updated successfully');
      } else {
        // Create new tool
        await api.post('/tools', payload);
        toast.success('Tool saved to database successfully');
      }

      fetchTools();
      if (!editingToolId) {
        // Reset form only if creating new (optional, or keep logic to clear)
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save tool');
    }
  };

  const downloadQR = () => {
    const canvas = document.querySelector('#qr-code-wrapper canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${qrCode || 'qrcode'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('QR Code downloaded successfully');
    } else {
      toast.error('Could not find QR Code to download');
    }
  };

  const printQR = () => {
    const canvas = document.querySelector('#qr-code-wrapper canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const printWindow = window.open('', '', 'width=600,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code</title>
              <style>
                body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  font-family: sans-serif;
                }
                img {
                  max-width: 100%;
                  height: auto;
                }
                .label {
                  margin-top: 20px;
                  font-size: 20px;
                  font-weight: bold;
                }
              </style>
            </head>
            <body>
              <img src="${pngUrl}" />
              <div class="label">${qrCode}</div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => { window.close(); }, 500);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      toast.error('Could not find QR Code to print');
    }
  };

  const [isNewTool, setIsNewTool] = useState(true);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerScan = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setScanning(true);

    const html5QrCode = new Html5Qrcode("reader-hidden-master");

    try {
      const decodedText = await html5QrCode.scanFile(file, true);

      // Extract code if it is a URL
      let code = decodedText;
      if (decodedText.includes('/view-tool/')) {
        const parts = decodedText.split('/view-tool/');
        if (parts.length > 1) {
          code = parts[1];
        }
      }

      handleFetchToolByQR(code);
    } catch (err) {
      console.error("Error scanning file", err);
      toast.error("Could not read QR code from image");
    } finally {
      setScanning(false);
      html5QrCode.clear();
    }
  };

  const handleFetchToolByQR = async (code: string) => {
    try {
      toast.info(`Fetching details for ${code}...`);
      const response = await api.get(`/tools/qr/${code}`);
      const tool = response.data;

      setEditingToolId(tool.id); // Set ID for updates
      setQrCode(tool.qr_code);
      setToolData({
        description: tool.description,
        make: tool.make,
        capacity: tool.capacity,
        safeWorkingLoad: tool.safe_working_load,
        purchaserName: tool.purchaser_name,
        purchaserContact: tool.purchaser_contact,
        dateOfSupply: tool.date_of_supply ? new Date(tool.date_of_supply) : undefined,
        lastInspectionDate: tool.last_inspection_date ? new Date(tool.last_inspection_date) : undefined,
        inspectionResult: 'usable', // Default to usable for new inspection entry
        usabilityPercentage: tool.usability_percentage ? String(tool.usability_percentage) : '',
        validityPeriod: tool.validity_period ? String(tool.validity_period) : '',
        subcontractorName: tool.subcontractor_name,
        previousSite: tool.previous_site,
        currentSite: tool.current_site,
        nextSite: tool.next_site,
      });
      toast.success("Tool details loaded!");
    } catch (error) {
      console.error(error);
      toast.error("Tool not found in database");
    }
  };

  const handleEditTool = (tool: any) => {
    setIsNewTool(false);
    setEditingToolId(tool.id);
    setQrCode(tool.qr_code);
    setToolData({
      description: tool.description,
      make: tool.make,
      capacity: tool.capacity,
      safeWorkingLoad: tool.safe_working_load,
      purchaserName: tool.purchaser_name,
      purchaserContact: tool.purchaser_contact,
      dateOfSupply: tool.date_of_supply ? new Date(tool.date_of_supply) : undefined,
      lastInspectionDate: tool.last_inspection_date ? new Date(tool.last_inspection_date) : undefined,
      inspectionResult: tool.inspection_result || 'usable',
      usabilityPercentage: tool.usability_percentage ? String(tool.usability_percentage) : '',
      validityPeriod: tool.validity_period ? String(tool.validity_period) : '',
      subcontractorName: tool.subcontractor_name,
      previousSite: tool.previous_site,
      currentSite: tool.current_site,
      nextSite: tool.next_site,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info("Editing tool: " + tool.qr_code);
  };

  // ... (existing handleInputChange, etc.)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0F172A]">Tool Master Data Entry</h1>
          <p className="text-gray-500 mt-1">Add and manage tool information</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg border shadow-sm">
          <Label className="text-sm font-medium text-gray-600">Entry Mode:</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant={isNewTool ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsNewTool(true);
                setEditingToolId(null);
                setQrCode('');
                setToolData(prev => ({ ...prev, make: new Date().getFullYear().toString() }));
              }}
              className={isNewTool ? "bg-[#1E3A8A]" : ""}
            >
              New Tool
            </Button>
            <Button
              variant={!isNewTool ? "default" : "outline"}
              size="sm"
              onClick={() => setIsNewTool(false)}
              className={!isNewTool ? "bg-[#1E3A8A]" : ""}
            >
              Existing Tool
            </Button>
          </div>
        </div>
      </div>

      {!isNewTool && (
        <div className="flex justify-end">
          <div id="reader-hidden-master" className="hidden"></div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={triggerScan}
            className="border-dashed border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            disabled={scanning}
          >
            {scanning ? "Scanning..." : "📷 Scan / Upload Existing QR to Autofill"}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tool Details */}
          <Card>
            <CardHeader>
              <CardTitle>Tool Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Tool Name <span className="text-red-600">*</span></Label>
                <Select onValueChange={(value) => handleInputChange('description', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tool Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chain-hoist">Chain Hoist</SelectItem>
                    <SelectItem value="wire-rope">Wire Rope Sling</SelectItem>
                    <SelectItem value="hydraulic-jack">Hydraulic Jack</SelectItem>
                    <SelectItem value="lifting-beam">Lifting Beam</SelectItem>
                    <SelectItem value="shackle">Shackle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="make">Make (Year) <span className="text-red-600">*</span></Label>
                <Select
                  value={toolData.make}
                  onValueChange={(value) => handleInputChange('make', value)}
                >
                  <SelectTrigger id="make">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString()).map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity <span className="text-red-600">*</span></Label>
                <Select
                  value={toolData.capacity}
                  onValueChange={(value) => handleInputChange('capacity', value)}
                >
                  <SelectTrigger id="capacity">
                    <SelectValue placeholder="Select Capacity" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={`${num} ${num === 1 ? 'Tonne' : 'Tonnes'}`}>
                        {num} {num === 1 ? 'Tonne' : 'Tonnes'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="swl">Safe Working Load (SWL) <span className="text-red-600">*</span></Label>
                <Select
                  value={toolData.safeWorkingLoad}
                  onValueChange={(value) => handleInputChange('safeWorkingLoad', value)}
                >
                  <SelectTrigger id="swl">
                    <SelectValue placeholder="Select SWL" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={`${num} ${num === 1 ? 'Tonne' : 'Tonnes'}`}>
                        {num} {num === 1 ? 'Tonne' : 'Tonnes'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Details */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaser">Purchaser Name</Label>
                <Input
                  id="purchaser"
                  placeholder="Enter purchaser name"
                  value={toolData.purchaserName}
                  onChange={(e) => handleInputChange('purchaserName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Purchaser Contact Number</Label>
                <Input
                  id="contact"
                  placeholder="Enter contact number"
                  value={toolData.purchaserContact}
                  onChange={(e) => handleInputChange('purchaserContact', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="dateOfSupply">Date of Supply</Label>
                <DatePicker
                  date={toolData.dateOfSupply}
                  onDateChange={(date) => handleDateChange('dateOfSupply', date)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inspection Status - Only for Existing Tools */}
          {!isNewTool && (
            <Card>
              <CardHeader>
                <CardTitle>Inspection Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastInspection">Date of Last Inspection</Label>
                    <DatePicker
                      date={toolData.lastInspectionDate}
                      onDateChange={(date) => handleDateChange('lastInspectionDate', date)}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Inspection Result</Label>
                  <RadioGroup
                    value={toolData.inspectionResult}
                    onValueChange={(value) => handleInputChange('inspectionResult', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="usable" id="usable" />
                      <Label htmlFor="usable" className="font-normal cursor-pointer">Usable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-usable" id="not-usable" />
                      <Label htmlFor="not-usable" className="font-normal cursor-pointer">Not Usable</Label>
                    </div>
                  </RadioGroup>
                </div>
                {toolData.inspectionResult === 'usable' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="usability">Usability Percentage</Label>
                      <Input
                        id="usability"
                        type="number"
                        placeholder="e.g., 95"
                        value={toolData.usabilityPercentage}
                        onChange={(e) => handleInputChange('usabilityPercentage', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validity">Validity Period (Years)</Label>
                      <Input
                        id="validity"
                        type="number"
                        placeholder="e.g., 1"
                        value={toolData.validityPeriod}
                        onChange={(e) => handleInputChange('validityPeriod', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Site Movement */}
          <Card>
            <CardHeader>
              <CardTitle>Site Movement</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="subcontractor">Subcontractor Name</Label>
                <Input
                  id="subcontractor"
                  placeholder="Enter subcontractor name"
                  value={toolData.subcontractorName}
                  onChange={(e) => handleInputChange('subcontractorName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousSite">Previous Site</Label>
                <Input
                  id="previousSite"
                  placeholder="Enter previous site"
                  value={toolData.previousSite}
                  onChange={(e) => handleInputChange('previousSite', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentSite">Current Site</Label>
                <Input
                  id="currentSite"
                  placeholder="Enter current site"
                  value={toolData.currentSite}
                  onChange={(e) => handleInputChange('currentSite', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextSite">Next Site</Label>
                <Input
                  id="nextSite"
                  placeholder="Enter next site"
                  value={toolData.nextSite}
                  onChange={(e) => handleInputChange('nextSite', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCode ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg" id="qr-code-wrapper">
                    <QRCodeCanvas
                      value={`${baseUrl}/view-tool/${qrCode}`}
                      size={200}
                      level={"H"}
                      includeMargin={true}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Scan to View Details</p>
                    <p className="font-mono font-medium text-xs text-gray-400">{qrCode}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button variant="outline" size="sm" onClick={downloadQR}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={printQR}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                  <p className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded">
                    Note: Ensure your mobile is on the same network and you are accessing this site via IP address for mobile scanning to work.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">QR Code will be generated automatically after saving the tool details.</p>
                  <Button disabled variant="outline">Auto-Generated on Save</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SAVED TOOLS LIST */}
      {/* SAVED TOOLS LIST */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-semibold text-[#0F172A] mb-6">Saved Tools Inventory</h2>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by Name, QR, Make or Site..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="usable">Usable</SelectItem>
                <SelectItem value="scrap">Scrap</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table View */}
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead>Make</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Current Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">QR</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell>{tool.current_site || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${tool.status === 'usable' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {tool.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {/* Hidden Canvas for Download Generation */}
                      <div className="hidden" id={`qr-wrapper-list-${tool.id}`}>
                        <QRCodeCanvas
                          value={`${baseUrl}/view-tool/${tool.qr_code}`}
                          size={200}
                          level={"H"}
                          includeMargin={true}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Download QR"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          const wrapper = document.getElementById(`qr-wrapper-list-${tool.id}`);
                          const canvas = wrapper?.querySelector('canvas');
                          if (canvas) {
                            const pngUrl = canvas.toDataURL('image/png');
                            const downloadLink = document.createElement('a');
                            downloadLink.href = pngUrl;
                            downloadLink.download = `QR-${tool.qr_code}.png`;
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);
                            toast.success(`Downloaded QR: ${tool.qr_code}`);
                          } else {
                            toast.error('Could not generate QR');
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            // Quick view QR logic (using existing download logic structure or just showing toast)
                            // Ideally, show the QR in a modal or just trigger the edit view which has the QR
                            handleEditTool(tool);
                          }}
                          title="View/Edit"
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No tools found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 px-6 flex justify-end gap-3 z-10">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Tool
        </Button>
      </div>
    </div>
  );
};

export default ToolMaster;