import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar usuario");
      return userId;
    },
    onSuccess: () => {
      toast.success("Usuario eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useUnlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/v1/users/${userId}/unlock`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Error al desbloquear usuario");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Usuario desbloqueado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useSendCredentials() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/v1/users/${userId}/send-credentials`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al enviar credenciales");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Credenciales enviadas correctamente");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export interface BulkSendResult {
  success: boolean;
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  results: Array<{
    userId: string;
    username: string;
    success: boolean;
    error?: string;
  }>;
}

export function useBulkSendCredentials() {
  return useMutation({
    mutationFn: async (userIds: string[]): Promise<BulkSendResult> => {
      const response = await fetch("/api/v1/users/send-credentials/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al enviar credenciales");
      }
      return data;
    },
    onSuccess: (data) => {
      if (data.sent > 0 && data.failed === 0) {
        toast.success(`Credenciales enviadas a ${data.sent} usuarios`);
      } else if (data.sent > 0 && data.failed > 0) {
        toast.warning(
          `Enviadas: ${data.sent}, Fallidas: ${data.failed}, Omitidas: ${data.skipped}`
        );
      } else {
        toast.error("No se pudieron enviar las credenciales");
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
