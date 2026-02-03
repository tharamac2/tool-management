import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User } from '../App';
import { QrCode, Shield, Store, HardHat, UserCog, ArrowLeft, Camera, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [username, setUsername] = useState(''); // Will bet set based on role selection
  const [password, setPassword] = useState('');
  const [adminAction, setAdminAction] = useState('new'); // Default to create new
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedQr, setScannedQr] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleSelect = (role: string) => {
    if (role === 'worker') {
      handleWorkerAccess();
    } else {
      setSelectedRole(role);
      setUsername(role); // Auto-fill username based on role for simplicity in this flow
      setPassword(''); // Clear password
    }
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setUsername('');
    setPassword('');
    setScannedQr(null);
  };

  const handleNavigation = (role: string, extraState = {}) => {
    switch (role) {
      case 'admin':
        if (adminAction === 'new') {
          navigate('/tool-master', { state: { view: 'new', mode: 'create', ...extraState } });
        } else if (adminAction === 'edit') {
          navigate('/tool-master', { state: { view: 'new', mode: 'edit', ...extraState } });
        } else {
          navigate('/tool-master', { state: { view: 'saved', ...extraState } });
        }
        break;
      case 'inspector':
        navigate('/inspector');
        break;
      case 'store':
        navigate('/store-view');
        break;
      case 'management':
        navigate('/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setScanning(true);
    const html5QrCode = new Html5Qrcode("reader-hidden-login");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      let code = decodedText;
      if (decodedText.includes('/view-tool/')) {
        code = decodedText.split('/view-tool/')[1];
      }
      setScannedQr(code);
      toast.success("QR Code Scanned! Enter Password to proceed.");
    } catch (err) {
      console.error("Error scanning file", err);
      toast.error("Could not read QR code");
    } finally {
      setScanning(false);
      html5QrCode.clear();
    }
  };

  const handleLogin = async () => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/users/token', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { access_token, role } = response.data;
      localStorage.setItem('token', access_token);

      const user: User = {
        id: username,
        name: username,
        role: role as User['role']
      };

      onLogin(user);
      toast.success('Login successful');
      handleNavigation(role, scannedQr ? { qrCode: scannedQr } : {});
    } catch (error) {
      toast.error('Invalid credentials');
      console.error('Login failed', error);
    }
  };

  const handleWorkerAccess = () => {
    const workerUser: User = {
      id: 'worker-guest',
      name: 'Guest Worker',
      role: 'worker'
    };
    onLogin(workerUser);
    toast.success('Entered as Guest Worker');
    navigate('/worker');
  };

  const roleCards = [
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage tools & generate QRs',
      icon: UserCog,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'store',
      title: 'Store',
      description: 'Update site locations',
      icon: Store,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      id: 'inspector',
      title: 'Inspection', // Display Name
      roleValue: 'inspector', // Actual role value
      description: 'Verify condition & safety',
      icon: Shield,
      color: 'bg-green-50 text-green-600'
    },
    { // Added Management Role to cards
      id: 'management',
      title: 'Management',
      description: 'View Dashboard & Reports',
      icon: UserCog, // Using UserCog for now, or maybe a Chart icon if available
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'worker',
      title: 'Worker',
      description: 'Check status & compatibility',
      icon: HardHat,
      color: 'bg-orange-50 text-orange-600',
      noLogin: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4 font-sans">
      <div className="w-full max-w-5xl h-screen md:h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">

        {/* Left Panel - Branding */}
        <div className="w-full md:w-2/5 bg-[#2563EB] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500 opacity-20"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-700 opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">QR Tool MS</h1>
            </div>

            <h2 className="text-3xl font-bold leading-tight mb-4">
              Industrial Tool Tracking Platform
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Centralized digital platform for tracking industrial tools efficiently using QR codes. Secure, fast, and role-based.
            </p>
          </div>

          <div className="relative z-10 mt-8 md:mt-0">
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto">

          {!selectedRole ? (
            // Role Selection View
            <div className="h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
                <p className="text-gray-500">Select your portal to continue.</p>
              </div>

              <div className="space-y-3">
                {roleCards.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="w-full flex items-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 group text-left bg-white shadow-sm hover:shadow-md"
                  >
                    <div className={`w-12 h-12 rounded-full ${role.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                      <role.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{role.title}</h3>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                    {role.noLogin && (
                      <span className="ml-auto text-xs text-gray-400 font-medium px-2 py-1 bg-gray-100 rounded">No Login</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Login Form View
            <div className="h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300">
              <Button
                variant="ghost"
                onClick={handleBackToRoles}
                className="self-start mb-6 -ml-4 text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roles
              </Button>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{selectedRole === 'inspector' ? 'Inspection' : selectedRole} Portal</h2>
                <p className="text-gray-500">Please authenticate to continue.</p>
              </div>

              <div className="space-y-6">

                {selectedRole === 'admin' && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Label className="text-gray-700 font-medium">Session Action</Label>
                    <RadioGroup value={adminAction} onValueChange={setAdminAction} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="l-new" />
                        <Label htmlFor="l-new" className="cursor-pointer">Create New Tool</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="edit" id="l-edit" />
                        <Label htmlFor="l-edit" className="cursor-pointer">Edit Existing Tool</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="saved" id="l-saved" />
                        <Label htmlFor="l-saved" className="cursor-pointer">Inventory View</Label>
                      </div>
                    </RadioGroup>

                    {adminAction === 'edit' && (
                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`w-full ${scannedQr ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-white'}`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {scannedQr ? 'QR Scanned (Ready)' : 'Scan QR for Direct Edit'}
                        </Button>
                        <div id="reader-hidden-login" className="hidden"></div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="h-11 pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Req: 1 Uppercase, 1 Lowercase, 1 Special Char, 1 Number
                  </p>
                </div>

                <Button
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] h-11 text-base font-medium"
                  onClick={handleLogin}
                >
                  Login to Portal
                </Button>


              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;