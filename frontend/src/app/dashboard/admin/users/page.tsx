'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Mail,
  Phone,
  Building,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import apiClient from '@/services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'head_architect' | 'architect' | 'user';
  company?: string;
  licenseNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'architect' as User['role'],
    company: '',
    licenseNumber: '',
    isActive: true,
    isVerified: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, filterRole]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        company: user.company || '',
        licenseNumber: user.licenseNumber || '',
        isActive: user.isActive,
        isVerified: user.isVerified,
      });
    } else {
      setEditingUser(null);
      setUserForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'architect',
        company: '',
        licenseNumber: '',
        isActive: true,
        isVerified: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // Update user role
        await apiClient.updateUserRole(editingUser.id, userForm.role);

        // Toggle status if changed
        if (editingUser.isActive !== userForm.isActive) {
          await apiClient.toggleUserStatus(editingUser.id);
        }

        toast({
          title: 'User Updated',
          description: `${userForm.firstName} ${userForm.lastName} has been updated successfully.`,
        });
      } else {
        // Note: User creation is done through registration endpoint
        toast({
          title: 'Info',
          description: 'New users must register through the registration page.',
          variant: 'default',
        });
      }
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      try {
        // Toggle user status to inactive (soft delete)
        if (user.isActive) {
          await apiClient.toggleUserStatus(user.id);
          toast({
            title: 'User Deactivated',
            description: `${user.firstName} ${user.lastName} has been deactivated.`,
          });
          fetchUsers();
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to deactivate user',
          variant: 'destructive',
        });
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'head_architect':
        return 'bg-purple-100 text-purple-800';
      case 'architect':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'head_architect':
        return 'Head Architect';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    verified: users.filter((u) => u.isVerified).length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-slate-600 mt-2">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Verified</p>
                <p className="text-2xl font-bold text-purple-600">{stats.verified}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Admins</p>
                <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="head_architect">Head Architect</SelectItem>
                <SelectItem value="architect">Architect</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-slate-600">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-slate-600">No users found</div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {user.firstName} {user.lastName}
                      </h3>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      {user.isActive ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600 border-gray-600">
                          Inactive
                        </Badge>
                      )}
                      {user.isVerified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                      {user.company && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {user.company}
                        </div>
                      )}
                    </div>
                    {user.licenseNumber && (
                      <div className="mt-1 text-xs text-slate-500">
                        License: {user.licenseNumber}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information and permissions' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={userForm.firstName}
                  onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={userForm.lastName}
                  onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={userForm.role}
                onValueChange={(value: User['role']) => setUserForm({ ...userForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="head_architect">Head Architect</SelectItem>
                  <SelectItem value="architect">Architect</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={userForm.company}
                onChange={(e) => setUserForm({ ...userForm, company: e.target.value })}
                placeholder="ABC Architects"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={userForm.licenseNumber}
                onChange={(e) => setUserForm({ ...userForm, licenseNumber: e.target.value })}
                placeholder="ARCH-12345"
              />
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={userForm.isActive}
                  onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active Account
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={userForm.isVerified}
                  onChange={(e) => setUserForm({ ...userForm, isVerified: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isVerified" className="cursor-pointer">
                  Verified License
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
