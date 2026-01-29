import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { QrCode, Calendar, MapPin, Wrench } from 'lucide-react';
import { mockTools } from '../types/tool';

const StoreView = () => {
  const [scannedTool, setScannedTool] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScannedTool(mockTools[0]);
      setScanning(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'usable':
        return 'bg-[#16A34A] text-white';
      case 'scrap':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'usable':
        return 'Usable';
      case 'scrap':
        return 'Scrap';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#0F172A]">Store In-Charge View</h1>
        <p className="text-gray-500 mt-1">Scan QR code to view tool information</p>
      </div>

      {/* QR Scanner Section */}
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center space-y-6">
            <div className={`w-64 h-64 border-4 border-dashed rounded-lg flex items-center justify-center ${scanning ? 'border-[#1E3A8A] animate-pulse' : 'border-gray-300'
              }`}>
              {scanning ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Scanning...</p>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Point camera at QR code</p>
                </div>
              )}
            </div>
            <Button
              size="lg"
              className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
              onClick={simulateScan}
              disabled={scanning}
            >
              <QrCode className="w-5 h-5 mr-2" />
              {scanning ? 'Scanning...' : 'Simulate QR Scan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tool Summary Card */}
      {scannedTool && (
        <Card className="border-2 border-[#1E3A8A]">
          <CardHeader className={`${getStatusColor(scannedTool.status)} text-white`}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{scannedTool.description}</CardTitle>
              <Badge className="bg-white text-[#1E3A8A] hover:bg-white">
                {getStatusText(scannedTool.status).toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Tool ID</p>
                  <p className="font-mono font-medium">{scannedTool.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Make</p>
                  <p className="font-medium">{scannedTool.make}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium">{scannedTool.capacity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Safe Working Load</p>
                  <p className="text-2xl font-semibold text-[#1E3A8A]">{scannedTool.safeWorkingLoad}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Purchase Date</p>
                    <p className="font-medium">{new Date(scannedTool.dateOfSupply).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Last Inspection</p>
                    <p className="font-medium">{new Date(scannedTool.lastInspectionDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="font-medium">{new Date(scannedTool.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Current Site</p>
                    <p className="font-medium">{scannedTool.currentSite}</p>
                  </div>
                </div>
              </div>
            </div>

            {scannedTool.usabilityPercentage && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Usability</span>
                  <span className="font-semibold text-lg">{scannedTool.usabilityPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${scannedTool.usabilityPercentage}%`,
                      backgroundColor: scannedTool.usabilityPercentage >= 80 ? '#16A34A' : scannedTool.usabilityPercentage >= 50 ? '#F59E0B' : '#DC2626'
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StoreView;
