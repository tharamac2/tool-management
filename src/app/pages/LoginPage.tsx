import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { User } from '../App';
import { QrCode } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Mock authentication
    let user: User;
    
    switch (username.toLowerCase()) {
      case 'admin':
        user = { id: '1', name: 'Admin User', role: 'admin' };
        break;
      case 'store':
        user = { id: '2', name: 'Store Manager', role: 'store' };
        break;
      case 'inspector':
        user = { id: '3', name: 'Inspector Smith', role: 'inspector' };
        break;
      case 'management':
        user = { id: '4', name: 'Manager Johnson', role: 'management' };
        break;
      case 'worker':
        user = { id: '5', name: 'Worker Jones', role: 'worker' };
        break;
      default:
        user = { id: '1', name: 'Admin User', role: 'admin' };
    }
    
    onLogin(user);
  };

  const handleWorkerAccess = () => {
    onLogin({ id: '5', name: 'Worker', role: 'worker' });
  };

  return (
    <div className="min-h-screen bg-[#AEC3FF] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-[#1E3A8A] rounded-full flex items-center justify-center">
            <QrCode className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-3xl">Tool Management System</CardTitle>
          <CardDescription>QR Code-Based Inspection & Tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username / Employee ID <span className="text-red-600">*</span></Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-red-600">*</span></Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                required
              />
            </div>
            <Button 
              className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
              onClick={handleLogin}
            >
              Login
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-2"
            onClick={handleWorkerAccess}
          >
            <QrCode className="mr-2 h-4 w-4" />
            Scan QR without login (Worker)
          </Button>

          <div className="text-xs text-center text-gray-500 space-y-1">
            <p>Demo Users: admin, store, inspector, management, worker</p>
            <p className="text-gray-400">Password: any</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;