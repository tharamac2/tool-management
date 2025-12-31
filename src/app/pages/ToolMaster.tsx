import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Save } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '../components/ui/date-picker';

const ToolMaster = () => {
  const [toolData, setToolData] = useState({
    description: '',
    make: '',
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

  const handleInputChange = (field: string, value: string) => {
    setToolData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    setToolData(prev => ({ ...prev, [field]: date }));
  };

  const generateQRCode = () => {
    const code = `TOOL-${Date.now()}`;
    setQrCode(code);
    toast.success('QR Code generated successfully');
  };

  const handleSave = () => {
    toast.success('Tool data saved successfully');
  };

  const downloadQR = () => {
    toast.success('QR Code downloaded');
  };

  const printQR = () => {
    toast.success('Printing QR Code...');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0F172A]">Tool Master Data Entry</h1>
          <p className="text-gray-500 mt-1">Add and manage tool information</p>
        </div>
      </div>

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
                <Label htmlFor="description">Tool Description <span className="text-red-600">*</span></Label>
                <Select onValueChange={(value) => handleInputChange('description', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tool type" />
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
                <Label htmlFor="make">Make <span className="text-red-600">*</span></Label>
                <Input
                  id="make"
                  placeholder="Enter make"
                  value={toolData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity <span className="text-red-600">*</span></Label>
                <Input
                  id="capacity"
                  placeholder="e.g., 5 Tonnes"
                  value={toolData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="swl">Safe Working Load (SWL) <span className="text-red-600">*</span></Label>
                <Input
                  id="swl"
                  placeholder="e.g., 5000 kg"
                  value={toolData.safeWorkingLoad}
                  onChange={(e) => handleInputChange('safeWorkingLoad', e.target.value)}
                  required
                />
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

          {/* Inspection Status */}
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
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <QRCodeSVG value={qrCode} size={200} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Tool ID</p>
                    <p className="font-mono font-medium">{qrCode}</p>
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
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No QR code generated</p>
                  <Button onClick={generateQRCode}>Generate QR Code</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 px-6 flex justify-end gap-3">
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