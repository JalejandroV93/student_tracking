"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import { User } from "./types";

interface BulkSendCredentialsModalProps {
  users: User[];
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  results?: {
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
  } | null;
}

export function BulkSendCredentialsModal({
  users,
  open,
  onClose,
  onConfirm,
  isPending,
  results,
}: BulkSendCredentialsModalProps) {
  const usersWithPhidias = users.filter((u) => u.id_phidias);
  const usersWithoutPhidias = users.filter((u) => !u.id_phidias);
  const canSend = usersWithPhidias.length > 0;

  // Si hay resultados, mostrar el resumen
  if (results) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Envío Completado
            </DialogTitle>
            <DialogDescription>
              Resumen del envío de credenciales
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Estadísticas */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{results.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600">
                  {results.sent}
                </p>
                <p className="text-xs text-muted-foreground">Enviados</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-2xl font-bold text-red-600">
                  {results.failed}
                </p>
                <p className="text-xs text-muted-foreground">Fallidos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-2xl font-bold text-yellow-600">
                  {results.skipped}
                </p>
                <p className="text-xs text-muted-foreground">Omitidos</p>
              </div>
            </div>

            {/* Detalles por usuario */}
            <ScrollArea className="h-[200px] rounded-lg border p-4">
              <div className="space-y-2">
                {results.results.map((result) => (
                  <div
                    key={result.userId}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="text-sm">{result.username}</span>
                    {result.success ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Enviado
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        {result.error || "Error"}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button onClick={onClose}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Enviar Credenciales ({users.length} usuarios)
          </DialogTitle>
          <DialogDescription>
            Se enviará un mensaje vía Phidias con las credenciales de acceso a
            los usuarios seleccionados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Resumen */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-700">
                    {usersWithPhidias.length} usuarios
                  </p>
                  <p className="text-xs text-green-600">
                    Con ID Phidias (se enviarán)
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-700">
                    {usersWithoutPhidias.length} usuarios
                  </p>
                  <p className="text-xs text-yellow-600">
                    Sin ID Phidias (se omitirán)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de usuarios a enviar */}
          {usersWithPhidias.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Se enviarán credenciales a:</p>
              <ScrollArea className="h-[150px] rounded-lg border p-3">
                <div className="space-y-1">
                  {usersWithPhidias.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-1 text-sm"
                    >
                      <span>{user.fullName}</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">
                        {user.username}
                      </code>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Usuarios sin ID Phidias */}
          {usersWithoutPhidias.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-yellow-600">
                Se omitirán (sin ID Phidias):
              </p>
              <ScrollArea className="h-[100px] rounded-lg border border-yellow-200 p-3 bg-yellow-50/50">
                <div className="space-y-1">
                  {usersWithoutPhidias.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-1 text-sm text-yellow-700"
                    >
                      <span>{user.fullName}</span>
                      <Badge variant="outline" className="text-xs">
                        Sin ID
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Advertencia si no hay usuarios para enviar */}
          {!canSend && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">
                    No se puede enviar
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ninguno de los usuarios seleccionados tiene ID de Phidias
                    configurado.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={!canSend || isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar a {usersWithPhidias.length} usuarios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
