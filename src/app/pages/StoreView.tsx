import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { QrCode, Calendar, MapPin, Save, RefreshCw, Wrench } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';

const StoreView = () => {
  const [scannedTool, setScannedTool] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Site Movement State
  const [movementData, setMovementData] = useState({
    subcontractorName: '',
    subcontractorCode: '',
    previousSite: '',
    currentSite: '',
    nextSite: '',
    remarks: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'usable': return 'bg-[#16A34A] text-white';
      case 'scrap': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const triggerScan = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setScanning(true);
    const html5QrCode = new Html5Qrcode("reader-hidden-store");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      let code = decodedText;
      if (decodedText.includes('/view-tool/')) {
        const parts = decodedText.split('/view-tool/');
        if (parts.length > 1) {
          code = parts[1];
        }
      }
      fetchToolDetails(code);
    } catch (err) {
      console.error("Error scanning file", err);
      toast.error("Could not read QR code from image");
    } finally {
      setScanning(false);
      html5QrCode.clear();
    }
  };

  const fetchToolDetails = async (code: string) => {
    try {
      toast.info(`Fetching tool: ${code}`);
      const res = await api.get(`/tools/qr/${code}`);
      setScannedTool(res.data);
      // Initialize movement data from fetched tool
      setMovementData({
        subcontractorName: res.data.subcontractor_name || '',
        subcontractorCode: res.data.subcontractor_code || '',
        previousSite: res.data.previous_site || '',
        currentSite: res.data.current_site || '',
        nextSite: res.data.next_site || '',
        remarks: res.data.remarks || ''
      });
      toast.success("Tool details loaded");
    } catch (error) {
      console.error(error);
      toast.error("Tool not found");
    }
  };

  const handleUpdateMovement = async () => {
    if (!scannedTool) return;
    try {
      const payload = {
        subcontractor_name: movementData.subcontractorName,
        subcontractor_code: movementData.subcontractorCode,
        previous_site: movementData.previousSite,
        current_site: movementData.currentSite,
        next_site: movementData.nextSite,
        remarks: movementData.remarks
      };

      await api.patch(`/tools/${scannedTool.id}`, payload);
      toast.success("Site movement updated successfully");

      // Refresh data
      const res = await api.get(`/tools/${scannedTool.id}`);
      setScannedTool(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update site movement");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold text-[#0F172A]">Store In-Charge View</h1>
        <p className="text-gray-500 mt-1">Scan QR code to view tool info and update site movement</p>
      </div>

      {/* QR Scanner Section */}
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center space-y-6">
            <div id="reader-hidden-store" className="hidden"></div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className={`w-48 h-48 border-4 border-dashed rounded-lg flex items-center justify-center ${scanning ? 'border-[#1E3A8A] animate-pulse' : 'border-gray-300'}`}>
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>

            <Button
              size="lg"
              className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 gap-2"
              onClick={triggerScan}
              disabled={scanning}
            >
              <QrCode className="w-5 h-5" />
              {scanning ? 'Scanning...' : 'Scan / Upload QR'}
            </Button>

            {/* Dev Helper: Manual ID input for testing if no camera */}
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Enter QR manually"
                className="w-40 h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchToolDetails(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tool Summary Card */}
      {scannedTool && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-2 border-[#1E3A8A] overflow-hidden">
            <CardHeader className={`${getStatusColor(scannedTool.status)} text-white py-4`}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  {scannedTool.description}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                    {scannedTool.qr_code}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Make</p>
                  <p className="font-semibold text-gray-900">{scannedTool.make}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Capacity</p>
                  <p className="font-semibold text-gray-900">{scannedTool.capacity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">SWL</p>
                  <p className="font-semibold text-[#1E3A8A]">{scannedTool.safe_working_load}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Expiry</p>
                  <p className="font-semibold text-gray-900">{scannedTool.expiry_date ? new Date(scannedTool.expiry_date).toLocaleDateString() : '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Supplier Name</p>
                  <p className="font-semibold text-gray-900">{scannedTool.purchaser_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Supplier Code</p>
                  <p className="font-semibold text-gray-900">{scannedTool.supplier_code || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Date of Receipt</p>
                  <p className="font-semibold text-gray-900">{scannedTool.date_of_supply ? new Date(scannedTool.date_of_supply).toLocaleDateString() : '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Job Code</p>
                  <p className="font-semibold text-gray-900">{scannedTool.job_code || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Job Description</p>
                  <p className="font-semibold text-gray-900">{scannedTool.job_description || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Site Movement Card */}
          <Card>
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-[#1E3A8A]" />
                Site Movement Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="subcontractor">Subcontractor Name</Label>
                  <Input
                    id="subcontractor"
                    placeholder="Enter subcontractor name"
                    value={movementData.subcontractorName}
                    onChange={(e) => setMovementData({ ...movementData, subcontractorName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcontractorCode">Sub-contractor Code</Label>
                  <Input
                    id="subcontractorCode"
                    placeholder="Enter code"
                    value={movementData.subcontractorCode}
                    onChange={(e) => setMovementData({ ...movementData, subcontractorCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentSite">Current Site</Label>
                  <Input
                    id="currentSite"
                    placeholder="Enter current site"
                    value={movementData.currentSite}
                    onChange={(e) => setMovementData({ ...movementData, currentSite: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextSite">Next Site</Label>
                  <Input
                    id="nextSite"
                    placeholder="Enter next site"
                    value={movementData.nextSite}
                    onChange={(e) => setMovementData({ ...movementData, nextSite: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    placeholder="Enter process remarks"
                    value={movementData.remarks}
                    onChange={(e) => setMovementData({ ...movementData, remarks: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousSite" className="text-gray-400">Previous Site (Read Only)</Label>
                  <Input
                    id="previousSite"
                    value={movementData.previousSite}
                    disabled
                    className="bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={handleUpdateMovement} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                  <Save className="w-4 h-4 mr-2" />
                  Update Movement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StoreView;
