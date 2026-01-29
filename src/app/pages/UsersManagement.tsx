import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { UserPlus, Edit, Trash2, Search, Mail, Phone, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  site: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

import { useEffect } from 'react';
import api from '../services/api';

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        const fetchedUsers = response.data.map((u: any) => ({
          id: u.id.toString(),
          name: u.full_name || u.username,
          email: u.email,
          phone: u.phone || 'N/A', // Backend might not have this yet
          role: u.role,
          site: u.site || 'N/A',
          status: u.status,
          lastLogin: new Date().toISOString() // Placeholder
        }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users", error);
        toast.error("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    site: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  const handleAddUser = async () => {
    try {
      const missingFields = [];
      if (!newUser.name) missingFields.push("Name");
      if (!newUser.email) missingFields.push("Email");
      if (!newUser.password) missingFields.push("Password");
      if (!newUser.role) missingFields.push("Role");

      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(', ')}`);
        return;
      }
      // ...
      // ...
      <div className="space-y-2">
        <Label htmlFor="add-role">Role <span className="text-red-600">*</span></Label>
        <Select value={newUser.role} onValueChange={(val) => handleInputChange('role', val)} required>
          <SelectTrigger id="add-role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="inspector">Inspector</SelectItem>
            <SelectItem value="store">Store Manager</SelectItem>
            <SelectItem value="worker">Worker</SelectItem>
          </SelectContent>
        </Select>
      </div>

      const payload = {
        username: newUser.email, // Using email as username
        email: newUser.email,
        full_name: newUser.name,
        password: newUser.password,
        role: newUser.role,
        site: newUser.site,
        phone: newUser.phone,
        status: 'active'
      };

      const res = await api.post('/users/', payload);

      // Add the new user to the local list immediately (optimistic update or re-fetch)
      const createdUser: User = {
        id: res.data.id.toString(),
        name: res.data.full_name || res.data.username,
        email: res.data.email,
        phone: newUser.phone, // Backend might not return this if not in UserRead
        role: res.data.role,
        site: res.data.site || 'N/A',
        status: res.data.status as 'active' | 'inactive',
        lastLogin: new Date().toISOString()
      };

      setUsers(prev => [...prev, createdUser]);

      toast.success('User added successfully');
      setIsAddUserOpen(false);

      // Reset form
      setNewUser({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: '',
        site: ''
      });

    } catch (error: any) {
      console.error("Failed to add user", error);
      if (error.response && error.response.data && error.response.data.detail) {
        toast.error(`Error: ${error.response.data.detail}`);
      } else {
        toast.error("Failed to add user");
      }
    }
  };

  /* Edit User State */
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    site: '',
    phone: '',
    password: '' // Optional for edit
  });

  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      site: user.site,
      phone: user.phone,
      password: ''
    });
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      if (!editingUserId) return;

      const payload: any = {
        full_name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
        site: editFormData.site,
        phone: editFormData.phone
      };

      if (editFormData.password) {
        payload.password = editFormData.password;
      }

      await api.patch(`/users/${editingUserId}`, payload);

      setUsers(users.map(u =>
        u.id === editingUserId
          ? { ...u, ...editFormData, name: editFormData.name } // partial update local state
          : u
      ));

      toast.success('User updated successfully');
      setIsEditUserOpen(false);
    } catch (error: any) {
      console.error("Failed to update user", error);
      if (error.response && error.response.data && error.response.data.detail) {
        toast.error(`Error: ${error.response.data.detail}`);
      } else {
        toast.error("Failed to update user");
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error("Failed to delete user", error);
      toast.error("Failed to delete user");
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
    toast.success('User status updated');
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Badge className="bg-purple-600">Admin</Badge>;
      case 'inspector':
        return <Badge className="bg-blue-600">Inspector</Badge>;
      case 'store manager':
        return <Badge className="bg-green-600">Store Manager</Badge>;
      case 'worker':
        return <Badge className="bg-gray-600">Worker</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0F172A]">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system users and permissions</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1E3A8A]">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Name <span className="text-red-600">*</span></Label>
                <Input
                  id="add-name"
                  placeholder="Enter user name"
                  value={newUser.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email">Email <span className="text-red-600">*</span></Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder="user@company.com"
                  value={newUser.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone Number</Label>
                <Input
                  id="add-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={newUser.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-password">Password <span className="text-red-600">*</span></Label>
                <div className="relative">
                  <Input
                    id="add-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={newUser.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-role">Role <span className="text-red-600">*</span></Label>
                <Select onValueChange={(val) => handleInputChange('role', val)} required>
                  <SelectTrigger id="add-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="inspector">Inspector</SelectItem>
                    <SelectItem value="store">Store Manager</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-site">Site</Label>
                <Input
                  id="add-site"
                  placeholder="Enter site location"
                  value={newUser.site}
                  onChange={(e) => handleInputChange('site', e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-[#1E3A8A]" onClick={handleAddUser}>
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(val) => setEditFormData({ ...editFormData, role: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="inspector">Inspector</SelectItem>
                    <SelectItem value="store">Store Manager</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Site</Label>
                <Input
                  value={editFormData.site}
                  onChange={(e) => setEditFormData({ ...editFormData, site: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>New Password (Optional)</Label>
                <Input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
              <Button className="bg-[#1E3A8A]" onClick={handleUpdateUser}>Update User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-semibold mt-2">{users.length}</p>
              </div>
              <Shield className="w-8 h-8 text-[#1E3A8A]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-3xl font-semibold mt-2">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-[#16A34A]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono">{index + 1}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{user.site}</TableCell>
                  <TableCell>
                    <Switch
                      checked={user.status === 'active'}
                      onCheckedChange={() => toggleUserStatus(user.id)}
                    />
                  </TableCell>
                  <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditClick(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;