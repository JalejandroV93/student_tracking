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
import { Loader2, Send, AlertTriangle, CheckCircle2 } from "lucide-react";
import { User } from "./types";

interface SendCredentialsModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function SendCredentialsModal({
  user,
  open,
  onClose,
  onConfirm,
  isPending,
}: SendCredentialsModalProps) {
  const hasPhidiasId = Boolean(user.id_phidias);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Credenciales
          </DialogTitle>
          <DialogDescription>
            Se enviará un mensaje vía Phidias con las credenciales de acceso a
            la plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info del usuario */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Usuario:</span>
              <span className="font-medium">{user.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Nombre de usuario:
              </span>
              <code className="bg-muted px-2 py-1 rounded text-sm">
                {user.username}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ID Phidias:</span>
              {hasPhidiasId ? (
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                  {user.id_phidias}
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  No configurado
                </Badge>
              )}
            </div>
          </div>

          {/* Advertencia si no tiene id_phidias */}
          {!hasPhidiasId && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">
                    No se puede enviar el mensaje
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    El usuario no tiene un ID de Phidias configurado. Edita el
                    usuario para agregar su ID antes de enviar credenciales.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview del mensaje */}
          {hasPhidiasId && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Vista previa del mensaje:</p>
              <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                <p>
                  <strong>Asunto:</strong> Credenciales de acceso - SGC
                </p>
                <hr className="my-2" />
                <p>
                  Hola <strong>{user.fullName}</strong>,
                </p>
                <p className="mt-2">
                  Se te ha creado una cuenta en la plataforma de seguimiento
                  estudiantil.
                </p>
                <div className="mt-3 p-3 bg-background rounded border">
                  <p>
                    <strong>URL:</strong>{" "}
                    <span className="text-blue-600">
                      https://tracking.liceotallersanmiguel.edu.co/
                    </span>
                  </p>
                  <p>
                    <strong>Usuario:</strong> {user.username}
                  </p>
                  <p>
                    <strong>Contraseña:</strong> {user.username}
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
          <Button onClick={onConfirm} disabled={!hasPhidiasId || isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Credenciales
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
