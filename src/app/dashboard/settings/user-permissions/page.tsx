"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Role } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ManageUserAreaPermissions from "@/components/settings/user-permissions/ManageUserAreaPermissions";

// Define a simple User type for this page
interface UserForPermissionPage {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  // Add other relevant fields if your API returns them
}

const UserPermissionsPage = () => {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserForPermissionPage[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserForPermissionPage | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      // Assuming an endpoint /api/v1/users exists to fetch all users
      const response = await fetch("/api/v1/users");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }
      const data: UserForPermissionPage[] = await response.json();
      setUsers(data);
    } catch (error: any) {
      toast.error(`Failed to fetch users: ${error.message}`);
      setUsers([]); // Set to empty array on error
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && currentUser?.role === Role.ADMIN) {
      fetchUsers();
    }
  }, [currentUser, authLoading, fetchUsers]);

  // Admin Protection
  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        toast.error("Access Denied: Please log in.");
        router.push("/login"); // Or your login page
      } else if (currentUser.role !== Role.ADMIN) {
        toast.error("Access Denied: You must be an Admin to view this page.");
        router.push("/dashboard"); // Redirect to a safe page
      }
    }
  }, [currentUser, authLoading, router]);

  const handleSelectUser = (user: UserForPermissionPage) => {
    setSelectedUser(user);
  };
  
  const handleClearSelection = () => {
    setSelectedUser(null);
  };


  if (authLoading || (!currentUser && !authLoading)) {
    return <p>Loading user data...</p>;
  }

  if (currentUser && currentUser.role !== Role.ADMIN) {
    return <p>Access Denied. You must be an Admin to manage user permissions.</p>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>Select a user to manage their area permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found or failed to load users.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow 
                      key={user.id} 
                      onClick={() => handleSelectUser(user)}
                      className={`cursor-pointer ${selectedUser?.id === user.id ? 'bg-muted/50' : ''}`}
                    >
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={selectedUser?.id === user.id ? "default" : "outline"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click if button is clicked
                            handleSelectUser(user);
                          }}
                        >
                          {selectedUser?.id === user.id ? "Selected" : "Manage Permissions"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <ManageUserAreaPermissions 
            key={selectedUser.id} // Ensure component re-mounts or re-fetches when userId changes
            userId={selectedUser.id} 
            userName={selectedUser.fullName || selectedUser.username} 
        />
      )}
      {selectedUser && (
         <div className="mt-4 text-center">
            <Button variant="outline" onClick={handleClearSelection}>Clear Selection</Button>
        </div>
      )}
    </div>
  );
};

export default UserPermissionsPage;
