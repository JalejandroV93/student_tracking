"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // Assuming sonner is available

interface AreaPermissionData {
  areaId: number;
  areaCode: string;
  areaName: string;
  canView: boolean;
  areaPermissionId: number | null;
}

interface ManageUserAreaPermissionsProps {
  userId: string;
  userName?: string; // Optional: for display purposes
}

const ManageUserAreaPermissions: React.FC<ManageUserAreaPermissionsProps> = ({
  userId,
  userName,
}) => {
  const [permissions, setPermissions] = useState<AreaPermissionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/users/${userId}/area-permissions`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch area permissions"
        );
      }
      const data: AreaPermissionData[] = await response.json();
      setPermissions(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error(`Error fetching permissions: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchPermissions();
    }
  }, [userId, fetchPermissions]);

  const handlePermissionChange = async (
    areaId: number,
    newCanView: boolean
  ) => {
    const originalPermissions = [...permissions];
    // Optimistic update
    setPermissions((prevPermissions) =>
      prevPermissions.map((p) =>
        p.areaId === areaId ? { ...p, canView: newCanView } : p
      )
    );

    try {
      const response = await fetch(
        `/api/v1/users/${userId}/area-permissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            areaId: areaId,
            canView: newCanView,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Rollback optimistic update
        setPermissions(originalPermissions);
        toast.error(
          `Failed to update permission for area ${areaId}: ${errorData.error || "Unknown error"}`
        );
        throw new Error(
          errorData.error || "Failed to update area permission"
        );
      }

      const updatedPermissionFromServer = await response.json();
      // Update with server response (especially for areaPermissionId if it was null)
      setPermissions((prevPermissions) =>
        prevPermissions.map((p) =>
          p.areaId === areaId ? { 
            ...p, 
            canView: updatedPermissionFromServer.canView, 
            areaPermissionId: updatedPermissionFromServer.id // Assuming 'id' is the AreaPermission record ID from server
          } : p
        )
      );
      toast.success(
        `Permission for area ${
          permissions.find((p) => p.areaId === areaId)?.areaName || areaId
        } updated.`
      );
    } catch (err) {
      // Rollback if not already rolled back
      setPermissions(originalPermissions);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(`Error updating permission: ${errorMessage}`);
    }
  };

  if (!userId) return null; // Or some placeholder if no user is selected

  if (loading) return <p>Loading permissions...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Manage Area Permissions {userName ? `for ${userName}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {permissions.length === 0 ? (
          <p>No areas found or user has no specific permissions yet.</p>
        ) : (
          <div className="space-y-4">
            {permissions.map((permission) => (
              <div
                key={permission.areaId}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <Label htmlFor={`switch-${permission.areaId}`} className="flex flex-col">
                  <span className="font-semibold">{permission.areaName}</span>
                  <span className="text-xs text-gray-500">{permission.areaCode}</span>
                </Label>
                <Switch
                  id={`switch-${permission.areaId}`}
                  checked={permission.canView}
                  onCheckedChange={(newCheckedState) =>
                    handlePermissionChange(permission.areaId, newCheckedState)
                  }
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageUserAreaPermissions;
