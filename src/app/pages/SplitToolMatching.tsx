import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { QrCode, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const SplitToolMatching = () => {
  const [step, setStep] = useState(1);
  const [partA, setPartA] = useState('');
  const [partB, setPartB] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<'match' | 'mismatch' | null>(null);

  const simulateScanPartA = () => {
    setScanning(true);
    setTimeout(() => {
      setPartA('SET-A-001');
      setScanning(false);
      setStep(2);
    }, 1500);
  };

  const simulateScanPartB = () => {
    setScanning(true);
    setTimeout(() => {
      // Randomly match or mismatch for demo
      const isMatch = Math.random() > 0.3;
      setPartB(isMatch ? 'SET-A-002' : 'SET-B-002');
      setScanning(false);
      setResult(isMatch ? 'match' : 'mismatch');
    }, 1500);
  };

  const reset = () => {
    setStep(1);
    setPartA('');
    setPartB('');
    setResult(null);
  };

  if (result) {
    const isMatch = result === 'match';
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div 
          className={`max-w-2xl w-full rounded-2xl p-12 text-center space-y-8 ${
            isMatch ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
          }`}
        >
          {isMatch ? (
            <CheckCircle className="w-32 h-32 text-white mx-auto animate-bounce" />
          ) : (
            <XCircle className="w-32 h-32 text-white mx-auto animate-pulse" />
          )}
          
          <div className="text-white space-y-4">
            <h1 className="text-5xl font-bold">
              {isMatch ? 'CORRECT COMBINATION' : 'WRONG COMBINATION'}
            </h1>
            <p className="text-2xl opacity-90">
              {isMatch ? 'Safe to use - Parts matched successfully' : 'Do not use - Parts do not match'}
            </p>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6 text-white text-left">
              <div>
                <p className="text-sm opacity-75 mb-1">Part A ID</p>
                <p className="text-2xl font-mono font-semibold">{partA}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">Part B ID</p>
                <p className="text-2xl font-mono font-semibold">{partB}</p>
              </div>
            </div>

            {!isMatch && (
              <div className="border-t border-white border-opacity-30 pt-6">
                <div className="text-white text-center space-y-2">
                  <p className="text-xl font-medium">Mismatch Reason</p>
                  <p className="text-lg opacity-90">Parts belong to different tool sets</p>
                  <p className="text-base opacity-75">Part A: Tool Set A | Part B: Tool Set B</p>
                </div>
              </div>
            )}

            {isMatch && (
              <div className="border-t border-white border-opacity-30 pt-6">
                <div className="text-white text-center space-y-2">
                  <p className="text-xl font-medium">Tool Set ID</p>
                  <p className="text-3xl font-bold font-mono">SET-A</p>
                  <p className="text-lg opacity-90">Wire Rope Sling Set - 10T</p>
                </div>
              </div>
            )}
          </div>

          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-12 py-6"
            onClick={reset}
          >
            Check Another Set
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-[#0F172A] mb-2">Split Tool Matching</h1>
          <p className="text-lg text-gray-500">Verify that tool parts belong together</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Part A */}
          <Card className={step >= 1 ? 'border-2 border-[#1E3A8A]' : 'opacity-50'}>
            <CardContent className="py-12">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-24 h-24 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  A
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Part A</h2>
                  {partA && (
                    <p className="font-mono text-lg text-[#16A34A] font-semibold">{partA}</p>
                  )}
                </div>
                {step === 1 && (
                  <div className={`w-48 h-48 border-4 border-dashed rounded-lg flex items-center justify-center ${
                    scanning ? 'border-[#1E3A8A] animate-pulse' : 'border-gray-300'
                  }`}>
                    {scanning ? (
                      <div className="w-16 h-16 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <QrCode className="w-20 h-20 text-gray-400" />
                    )}
                  </div>
                )}
                {step === 1 && (
                  <Button
                    className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                    onClick={simulateScanPartA}
                    disabled={scanning}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {scanning ? 'Scanning...' : 'Scan Part A'}
                  </Button>
                )}
                {step >= 2 && (
                  <div className="flex items-center gap-2 text-[#16A34A]">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-medium">Scanned</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Arrow */}
          <div className="hidden md:flex justify-center">
            <ArrowRight className={`w-12 h-12 ${step >= 2 ? 'text-[#1E3A8A]' : 'text-gray-300'}`} />
          </div>

          {/* Part B */}
          <Card className={step >= 2 ? 'border-2 border-[#1E3A8A]' : 'opacity-50'}>
            <CardContent className="py-12">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-24 h-24 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  B
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Part B</h2>
                  {partB && (
                    <p className="font-mono text-lg text-[#16A34A] font-semibold">{partB}</p>
                  )}
                </div>
                {step === 2 && (
                  <div className={`w-48 h-48 border-4 border-dashed rounded-lg flex items-center justify-center ${
                    scanning ? 'border-[#1E3A8A] animate-pulse' : 'border-gray-300'
                  }`}>
                    {scanning ? (
                      <div className="w-16 h-16 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <QrCode className="w-20 h-20 text-gray-400" />
                    )}
                  </div>
                )}
                {step === 2 && (
                  <Button
                    className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                    onClick={simulateScanPartB}
                    disabled={scanning}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {scanning ? 'Scanning...' : 'Scan Part B'}
                  </Button>
                )}
                {step < 2 && (
                  <p className="text-gray-400 text-center">Scan Part A first</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {step >= 1 && !result && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitToolMatching;
