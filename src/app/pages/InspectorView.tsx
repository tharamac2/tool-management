import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Badge } from '../components/ui/badge';
import { QrCode, Upload, Calendar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { mockTools, mockInspections } from '../types/tool';
import { toast } from 'sonner';
import { DatePicker } from '../components/ui/date-picker';

const InspectorView = () => {
  const [scannedTool, setScannedTool] = useState<any>(null);
  const [inspectionData, setInspectionData] = useState({
    result: 'pass',
    usabilityPercentage: '',
    remarks: '',
    inspectionDate: new Date(),
  });

  const simulateScan = () => {
    setScannedTool(mockTools[0]);
  };

  const handleSubmit = () => {
    toast.success('Inspection saved successfully');
    setScannedTool(null);
    setInspectionData({ result: 'pass', usabilityPercentage: '', remarks: '', inspectionDate: new Date() });
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-[#16A34A]" />;
      case 'conditional':
        return <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-[#DC2626]" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#0F172A]">Inspection Workflow</h1>
        <p className="text-gray-500 mt-1">Scan tool and complete inspection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Inspection Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Tool QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-48 h-48 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-400" />
                </div>
                <Button onClick={simulateScan} className="bg-[#1E3A8A]">
                  <QrCode className="w-4 h-4 mr-2" />
                  Simulate Scan
                </Button>
              </div>
            </CardContent>
          </Card>

          {scannedTool && (
            <>
              {/* Tool Summary */}
              <Card className="border-2 border-[#1E3A8A]">
                <CardHeader className="bg-[#1E3A8A] text-white">
                  <CardTitle>Tool Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Tool ID</p>
                      <p className="font-mono font-medium">{scannedTool.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium">{scannedTool.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Make</p>
                      <p className="font-medium">{scannedTool.make}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">SWL</p>
                      <p className="font-medium">{scannedTool.safeWorkingLoad}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inspection Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Inspection Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Inspection Date <span className="text-red-600">*</span></Label>
                    <DatePicker
                      date={inspectionData.inspectionDate}
                      onDateChange={(date) => setInspectionData({...inspectionData, inspectionDate: date || new Date()})}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Inspection Result</Label>
                    <RadioGroup 
                      value={inspectionData.result}
                      onValueChange={(value) => setInspectionData({...inspectionData, result: value})}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pass" id="pass" />
                        <Label htmlFor="pass" className="font-normal cursor-pointer flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                          Pass
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="conditional" id="conditional" />
                        <Label htmlFor="conditional" className="font-normal cursor-pointer flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                          Conditional
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fail" id="fail" />
                        <Label htmlFor="fail" className="font-normal cursor-pointer flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-[#DC2626]" />
                          Fail
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {(inspectionData.result === 'pass' || inspectionData.result === 'conditional') && (
                    <div className="space-y-2">
                      <Label htmlFor="usability">Usability Percentage <span className="text-red-600">*</span></Label>
                      <Input
                        id="usability"
                        type="number"
                        placeholder="e.g., 95"
                        value={inspectionData.usabilityPercentage}
                        onChange={(e) => setInspectionData({...inspectionData, usabilityPercentage: e.target.value})}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks <span className="text-red-600">*</span></Label>
                    <Textarea
                      id="remarks"
                      placeholder="Enter inspection notes and observations..."
                      rows={4}
                      value={inspectionData.remarks}
                      onChange={(e) => setInspectionData({...inspectionData, remarks: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Photo Upload</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-[#16A34A] hover:bg-[#16A34A]/90"
                    onClick={handleSubmit}
                  >
                    Save Inspection
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Inspection History */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Inspection History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInspections.map((inspection) => (
                  <div key={inspection.id} className="border-l-4 border-[#1E3A8A] pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      {getResultIcon(inspection.result)}
                      <span className="font-medium capitalize">{inspection.result}</span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(inspection.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs">{inspection.remarks}</p>
                      <p className="text-xs font-medium">Inspector: {inspection.inspector}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InspectorView;