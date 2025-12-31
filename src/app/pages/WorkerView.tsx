import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { QrCode, CheckCircle, XCircle } from 'lucide-react';
import { mockTools } from '../types/tool';

const WorkerView = () => {
  const [scannedTool, setScannedTool] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      // Randomly select a tool for demo
      const randomTool = mockTools[Math.floor(Math.random() * mockTools.length)];
      setScannedTool(randomTool);
      setScanning(false);
    }, 1500);
  };

  const resetScan = () => {
    setScannedTool(null);
  };

  const isSafe = scannedTool?.status === 'usable';

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {!scannedTool ? (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center space-y-8">
                <h1 className="text-4xl font-semibold text-[#0F172A] text-center">
                  Tool Safety Check
                </h1>
                <div className={`w-64 h-64 border-4 border-dashed rounded-lg flex items-center justify-center ${
                  scanning ? 'border-[#1E3A8A] animate-pulse' : 'border-gray-300'
                }`}>
                  {scanning ? (
                    <div className="text-center">
                      <div className="w-20 h-20 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-xl text-gray-600">Scanning...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <QrCode className="w-32 h-32 text-gray-400 mx-auto mb-4" />
                      <p className="text-xl text-gray-600">Scan Tool QR Code</p>
                    </div>
                  )}
                </div>
                <Button 
                  size="lg" 
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-lg px-12 py-6"
                  onClick={simulateScan}
                  disabled={scanning}
                >
                  <QrCode className="w-6 h-6 mr-3" />
                  {scanning ? 'Scanning...' : 'Start Scan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div 
            className={`rounded-2xl p-12 text-center space-y-8 ${
              isSafe ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
            }`}
          >
            {isSafe ? (
              <CheckCircle className="w-32 h-32 text-white mx-auto animate-bounce" />
            ) : (
              <XCircle className="w-32 h-32 text-white mx-auto animate-pulse" />
            )}
            
            <div className="text-white space-y-4">
              <h1 className="text-5xl font-bold">
                {isSafe ? 'SAFE TO USE' : 'DO NOT USE'}
              </h1>
              <p className="text-2xl opacity-90">
                {isSafe ? 'Tool is in good condition' : 'Tool is not safe for operation'}
              </p>
            </div>

            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6 text-white">
                <div className="text-left">
                  <p className="text-sm opacity-75 mb-1">Tool Name</p>
                  <p className="text-2xl font-semibold">{scannedTool.description}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm opacity-75 mb-1">Tool ID</p>
                  <p className="text-2xl font-mono font-semibold">{scannedTool.id}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm opacity-75 mb-1">Make</p>
                  <p className="text-2xl font-semibold">{scannedTool.make}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm opacity-75 mb-1">Capacity</p>
                  <p className="text-2xl font-semibold">{scannedTool.capacity}</p>
                </div>
              </div>

              <div className="border-t border-white border-opacity-30 pt-6">
                <div className="text-left text-white">
                  <p className="text-sm opacity-75 mb-2">Safe Working Load</p>
                  <p className="text-4xl font-bold">{scannedTool.safeWorkingLoad}</p>
                </div>
              </div>

              {scannedTool.status === 'usable' && scannedTool.usabilityPercentage && (
                <div className="border-t border-white border-opacity-30 pt-6">
                  <div className="text-left text-white">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-lg">Condition</p>
                      <p className="text-2xl font-bold">{scannedTool.usabilityPercentage}%</p>
                    </div>
                    <div className="w-full bg-white bg-opacity-30 rounded-full h-4">
                      <div
                        className="h-4 rounded-full bg-white transition-all"
                        style={{ width: `${scannedTool.usabilityPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {scannedTool.status !== 'usable' && (
                <div className="border-t border-white border-opacity-30 pt-6">
                  <div className="text-white text-center">
                    <p className="text-xl font-medium mb-2">Status: {scannedTool.status.toUpperCase()}</p>
                    <p className="text-lg opacity-90">Contact supervisor immediately</p>
                  </div>
                </div>
              )}
            </div>

            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-12 py-6"
              onClick={resetScan}
            >
              Scan Another Tool
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerView;
