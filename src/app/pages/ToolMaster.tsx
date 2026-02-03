import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, Save, Edit, Search, FileDown } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card";
import { toast } from 'sonner';
import { DatePicker } from '../components/ui/date-picker';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const ToolMaster = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('new');
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [savedTools, setSavedTools] = useState<any[]>([]);

  // Tab switching effect
  useEffect(() => {
    if (location.state?.view === 'saved') {
      setActiveTab('saved');
    } else if (location.state?.view === 'new') {
      setActiveTab('new');
      if (location.state?.mode === 'create') {
        // Reset for new entry
        setEditingToolId(null);
        setQrCode('');
        // Optional: reset toolData defaults here if needed
      } else if (location.state?.mode === 'edit') {
        const qrCodeToLoad = location.state?.qrCode;
        if (qrCodeToLoad) {
          handleFetchToolByQR(qrCodeToLoad);
        } else {
          setEditingToolId(null);
          setQrCode('');
          toast.info("Please Scan or Enter QR Code to Edit Tool");
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await api.get('/system/ip');
        if (res.data.ip && res.data.ip !== 'localhost') {
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
      const response = await api.get('/tools/');
      // Sort by ID descending to show newest first
      const sortedTools = response.data.sort((a: any, b: any) => b.id - a.id);
      setSavedTools(sortedTools);
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
    supplierCode: '',
    testCertificate: '',
    jobCode: '',
    jobDescription: '',
    dateOfSupply: undefined as Date | undefined,
    lastInspectionDate: undefined as Date | undefined,
    inspectionResult: 'usable',
    usabilityPercentage: '',
    validityPeriod: '',
    subcontractorName: '',
    previousSite: '',
    currentSite: '',
    nextSite: '',
    expiryDate: undefined as Date | undefined,
  });

  const [qrCode, setQrCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingToolId, setEditingToolId] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [isToolSaved, setIsToolSaved] = useState(false);

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTools = savedTools.filter(tool => {
    const matchesSearch =
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.qr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.current_site?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || tool.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (field: string, value: string) => {
    setToolData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    setToolData(prev => {
      const updates: any = { [field]: date };

      // Auto-calculate expiry date if dateOfSupply changes
      if (field === 'dateOfSupply' && date) {
        const expiry = new Date(date);
        expiry.setFullYear(date.getFullYear() + 3);
        // Ensure accurate date by handling leap years if necessary (JS Date handles this mostly)
        updates.expiryDate = expiry;
        updates.validityPeriod = '3';
      }

      return { ...prev, ...updates };
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await api.post('/upload/certificate', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setToolData(prev => ({ ...prev, testCertificate: response.data.url }));
        toast.success("Certificate uploaded successfully");
      } catch (error) {
        console.error("Upload failed", error);
        toast.error("Failed to upload certificate");
      }
    }
  };

  // Auto-generate Tool ID / QR Code based on fields
  useEffect(() => {
    if (!editingToolId) { // Only auto-generate for new tools
      const namePart = toolData.description ? toolData.description.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X') : 'XX';

      let datePart = '0000';
      if (toolData.dateOfSupply) {
        const date = new Date(toolData.dateOfSupply);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().substring(2);
        datePart = `${month}${year}`;
      }

      const supplierPart = toolData.purchaserName ? toolData.purchaserName.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X') : 'XX';
      const codePart = toolData.supplierCode ? toolData.supplierCode.padEnd(3, '0').substring(0, 3).toUpperCase() : '000'; // Ensure 3 chars

      const generatedId = `${namePart}${datePart}${supplierPart}${codePart}`;
      setQrCode(generatedId);
    }
  }, [toolData.description, toolData.dateOfSupply, toolData.purchaserName, toolData.supplierCode]);

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    const requiredFields = [
      'description', 'make', 'capacity', 'safeWorkingLoad',
      'purchaserName', 'purchaserContact', 'supplierCode',
      'jobCode', 'jobDescription'
    ];

    requiredFields.forEach(field => {
      if (!toolData[field as keyof typeof toolData]) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    if (!toolData.dateOfSupply) {
      newErrors['dateOfSupply'] = true;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    // Helper to format date as YYYY-MM-DD to avoid timezone shifts
    const formatDateForApi = (date: Date | undefined) => {
      if (!date) return undefined;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    try {
      if (!validateForm()) {
        toast.error("Please fill in all required fields marked with * and highlighted in red.");
        return;
      }

      const payload = {
        ...toolData,
        purchaser_name: toolData.purchaserName,
        purchaser_contact: toolData.purchaserContact,
        supplier_code: toolData.supplierCode,
        test_certificate: toolData.testCertificate,
        date_of_supply: formatDateForApi(toolData.dateOfSupply),
        last_inspection_date: formatDateForApi(toolData.lastInspectionDate),
        inspection_result: toolData.inspectionResult,
        usability_percentage: toolData.usabilityPercentage ? parseFloat(toolData.usabilityPercentage) : null,
        validity_period: toolData.validityPeriod ? parseInt(toolData.validityPeriod) : null,
        subcontractor_name: toolData.subcontractorName,
        previous_site: toolData.previousSite,
        current_site: toolData.currentSite,
        next_site: toolData.nextSite,
        status: toolData.inspectionResult === 'not-usable' ? 'scrap' : 'usable',
        safe_working_load: toolData.safeWorkingLoad,
        qr_code: qrCode, // Use the auto-generated ID
        expiry_date: formatDateForApi(toolData.expiryDate),
        job_code: toolData.jobCode,
        job_description: toolData.jobDescription
      };


      if (editingToolId) {
        await api.patch(`/tools/${editingToolId}`, payload);
        toast.success('Tool updated successfully');
        setIsToolSaved(true);
      } else {
        await api.post('/tools', payload);
        toast.success('Tool saved to database successfully');
        setIsToolSaved(true);
        // If save is successful, set active tab to saved? No, stay to show QR code
        // Keep active tab as 'new' to show the QR code
      }

      fetchTools();
      // Switch to Inventory tab after save? Or stay here?
      // For now, reload data.
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
                body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                img { max-width: 100%; height: auto; }
                .label { margin-top: 20px; font-size: 20px; font-weight: bold; }
              </style>
            </head>
            <body>
              <img src="${pngUrl}" />
              <div class="label">${qrCode}</div>
              <script>
                window.onload = function() { window.print(); setTimeout(() => { window.close(); }, 500); }
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

  const triggerScan = () => {
    fileInputRef.current?.click();
  };

  const handleFetchToolByQR = async (code: string) => {
    try {
      toast.info(`Fetching details for ${code}...`);
      const response = await api.get(`/tools/qr/${code}`);
      const tool = response.data;

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
        inspectionResult: 'usable',
        usabilityPercentage: tool.usability_percentage ? String(tool.usability_percentage) : '',
        validityPeriod: tool.validity_period ? String(tool.validity_period) : '',
        subcontractorName: tool.subcontractor_name,
        previousSite: tool.previous_site,
        currentSite: tool.current_site,
        nextSite: tool.next_site,
        supplierCode: tool.supplier_code || '',
        testCertificate: tool.test_certificate || '',
        expiryDate: tool.expiry_date ? new Date(tool.expiry_date) : undefined,
        jobCode: tool.job_code || '',
        jobDescription: tool.job_description || '',
      });
      setIsToolSaved(true);
      toast.success("Tool details loaded!");
      setActiveTab('new'); // Switch to form view
    } catch (error) {
      console.error(error);
      toast.error("Tool not found in database");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setScanning(true);
    const html5QrCode = new Html5Qrcode("reader-hidden-master");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
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


  const handleEditTool = (tool: any) => {
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
      supplierCode: tool.supplier_code || '',
      testCertificate: tool.test_certificate || '',
      expiryDate: tool.expiry_date ? new Date(tool.expiry_date) : undefined,
      jobCode: tool.job_code || '',
      jobDescription: tool.job_description || '',
    });
    setActiveTab('new'); // Switch to Edit Mode (Form)
    setIsToolSaved(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info("Editing tool: " + tool.qr_code);
  };

  const handleNewTool = () => {
    setQrCode('');
    setIsToolSaved(false);
    setErrors({});
    setToolData(prev => ({
      ...prev,
      description: '',
      make: new Date().getFullYear().toString(),
      capacity: '',
      safeWorkingLoad: '',
      // Reset other fields as needed, or keep previous values? better reset.
      purchaserName: '',
      purchaserContact: '',
      dateOfSupply: undefined,
      lastInspectionDate: undefined,
      inspectionResult: 'usable',
      usabilityPercentage: '',
      validityPeriod: '',
      subcontractorName: '',
      previousSite: '',
      currentSite: '',
      nextSite: '',
      supplierCode: '',
      testCertificate: '',
      expiryDate: undefined,
    }));
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#0F172A]">Tool Master</h1>
          <p className="text-gray-500 mt-1">Manage tool inventory, generate QR codes, and track assets.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="new" onClick={handleNewTool}>New Tool Entry</TabsTrigger>
          <TabsTrigger value="saved">Existing Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tool Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Tool Details {editingToolId ? '(Editing)' : '(New)'}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Tool Name <span className="text-red-600">*</span></Label>
                    <Select value={toolData.description} onValueChange={(value) => handleInputChange('description', value)} required>
                      <SelectTrigger className={errors.description ? 'border-red-500' : ''}>
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
                      <SelectTrigger id="make" className={errors.make ? 'border-red-500' : ''}>
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
                      <SelectTrigger id="capacity" className={errors.capacity ? 'border-red-500' : ''}>
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
                      <SelectTrigger id="swl" className={errors.safeWorkingLoad ? 'border-red-500' : ''}>
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

              {/* Supplier Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchaser">Supplier Name <span className="text-red-600">*</span></Label>
                    <Input
                      id="purchaser"
                      placeholder="Enter supplier name"
                      value={toolData.purchaserName}
                      onChange={(e) => handleInputChange('purchaserName', e.target.value)}
                      className={errors.purchaserName ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Supplier Contact Number <span className="text-red-600">*</span></Label>
                    <Input
                      id="contact"
                      placeholder="Enter contact number"
                      value={toolData.purchaserContact}
                      onChange={(e) => handleInputChange('purchaserContact', e.target.value)}
                      className={errors.purchaserContact ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierCode">Supplier Code ({toolData.supplierCode ? toolData.supplierCode.padEnd(3, '0').substring(0, 3).toUpperCase() : 'XXX'}) <span className="text-red-600">*</span></Label>
                    <Input
                      id="supplierCode"
                      placeholder="e.g. 001"
                      maxLength={3}
                      value={toolData.supplierCode}
                      onChange={(e) => handleInputChange('supplierCode', e.target.value)}
                      className={errors.supplierCode ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testCert">Test Certificate (PDF/Image)</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="testCert"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleCertUpload}
                        className="cursor-pointer"
                      />
                      {toolData.testCertificate && (
                        <a
                          href={`http://localhost:8000${toolData.testCertificate}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Uploaded
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="dateOfSupply">Date of Receipt <span className="text-red-600">*</span></Label>
                    <div className={errors.dateOfSupply ? 'border rounded-md border-red-500' : ''}>
                      <DatePicker
                        date={toolData.dateOfSupply}
                        onDateChange={(date) => handleDateChange('dateOfSupply', date)}
                      />
                    </div>
                  </div>
                  {/* Validity Info */}
                  {toolData.dateOfSupply && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="validityPeriod">Validity Period (Years)</Label>
                        <div className="h-10 px-3 py-2 rounded-md border border-input bg-gray-100 text-sm opacity-80 cursor-not-allowed">
                          {toolData.validityPeriod || 'Automatically calculated'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <div className="h-10 px-3 py-2 rounded-md border border-input bg-gray-100 text-sm opacity-80 cursor-not-allowed">
                          {toolData.expiryDate ? toolData.expiryDate.toLocaleDateString() : 'Auto-calculated'}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="jobCode">Job Code <span className="text-red-600">*</span></Label>
                      <Input
                        id="jobCode"
                        placeholder="Enter Job Code"
                        value={toolData.jobCode}
                        onChange={e => handleInputChange('jobCode', e.target.value)}
                        className={errors.jobCode ? 'border-red-500' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobDescription">Job Description <span className="text-red-600">*</span></Label>
                      <Input
                        id="jobDescription"
                        placeholder="Enter Job Description"
                        value={toolData.jobDescription}
                        onChange={e => handleInputChange('jobDescription', e.target.value)}
                        className={errors.jobDescription ? 'border-red-500' : ''}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inspection Status - Only for Existing Tools (Editing) */}
              {editingToolId && (
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}



              <Button className="w-full bg-[#1E3A8A] h-12 text-lg" onClick={handleSave}>
                <Save className="mr-2 h-5 w-5" />
                {editingToolId ? 'Update Tool Details' : 'Save Tool Details'}
              </Button>
            </div>

            {/* QR Code Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>QR Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isToolSaved && qrCode ? (
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
          </div >
        </TabsContent >

        <TabsContent value="saved" className="space-y-6">
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
                      <TableCell className="font-medium text-[#1E3A8A]">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <span className="cursor-pointer underline decoration-dotted underline-offset-4 decoration-gray-400 hover:text-blue-700 hover:decoration-blue-700 transition-colors">
                              {tool.description}
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-96 p-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold text-[#1E3A8A] flex items-center gap-2">
                                  {tool.description}
                                  <Badge variant="outline" className="text-[10px] h-5">{tool.qr_code}</Badge>
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">{tool.make} • {tool.capacity} • SWL {tool.safe_working_load}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-xs border-t border-b py-3">
                                <div>
                                  <span className="text-gray-500 block">Supplier</span>
                                  <span className="font-medium">{tool.purchaser_name || '-'}</span>
                                  {tool.supplier_code && <span className="block text-gray-400 text-[10px]">Code: {tool.supplier_code}</span>}
                                </div>
                                <div>
                                  <span className="text-gray-500 block">Date of Receipt</span>
                                  <span className="font-medium">{tool.date_of_supply ? new Date(tool.date_of_supply).toLocaleDateString() : '-'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block">Last Inspection</span>
                                  <span className="font-medium">{tool.last_inspection_date ? new Date(tool.last_inspection_date).toLocaleDateString() : '-'}</span>
                                  <span className={`block text-[10px] capitalize ${tool.inspection_result === 'usable' ? 'text-green-600' : 'text-red-500'}`}>
                                    {tool.inspection_result}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block">Valid Until</span>
                                  <span className="font-medium">{tool.expiry_date ? new Date(tool.expiry_date).toLocaleDateString() : '-'}</span>
                                </div>
                              </div>

                              <div className="text-xs space-y-1">
                                <p className="font-semibold text-gray-700">Site Movement History</p>
                                <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-500 text-center">
                                  <div className="bg-gray-50 p-1 rounded">Prev: {tool.previous_site || '-'}</div>
                                  <div className="bg-blue-50 text-blue-700 p-1 rounded font-medium">Curr: {tool.current_site || '-'}</div>
                                  <div className="bg-gray-50 p-1 rounded">Next: {tool.next_site || '-'}</div>
                                </div>
                                {tool.subcontractor_name && (
                                  <div className="mt-1 pt-1 border-t border-dashed">
                                    <span className="text-gray-500">Sub-contractor: </span>
                                    <span className="font-medium">{tool.subcontractor_name}</span>
                                    {tool.subcontractor_code && <span className="text-gray-400"> ({tool.subcontractor_code})</span>}
                                  </div>
                                )}
                              </div>

                              {(tool.remarks || tool.test_certificate) && (
                                <div className="pt-2 border-t text-xs space-y-2">
                                  {tool.remarks && (
                                    <div>
                                      <span className="text-gray-500 font-semibold">Remarks: </span>
                                      <span className="text-gray-700">{tool.remarks}</span>
                                    </div>
                                  )}
                                  {tool.test_certificate && (
                                    <a
                                      href={`${baseUrl}${tool.test_certificate}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center text-blue-600 hover:underline"
                                    >
                                      <FileDown className="w-3 h-3 mr-1" /> View Test Certificate
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
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
                            onClick={() => handleEditTool(tool)}
                          >
                            <Edit className="h-4 w-4 text-gray-500 hover:text-blue-700" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ToolMaster;