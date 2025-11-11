"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Download, AlertCircle, CheckCircle2, Key, Copy, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const csvSchema = z.object({
  file: z.instanceof(File).optional(),
});

type CSVFormData = z.infer<typeof csvSchema>;

type ImportResult = {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  createdUsers: Array<{
    username: string;
    fullName: string;
    role: string;
    temporaryPassword?: string;
  }>;
  temporaryPasswords?: Array<{
    username: string;
    password: string;
  }>;
};

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkImportModal({ open, onClose, onSuccess }: BulkImportModalProps) {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [, setShowPreview] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CSVFormData>({
    resolver: zodResolver(csvSchema),
  });

  // Mutation para importar CSV
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/v1/users/bulk-import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al procesar el archivo");
      }

      return response.json() as Promise<ImportResult>;
    },
    onSuccess: (result) => {
      setImportResult(result);
      if (result.success) {
        toast.success(`Importación completada: ${result.successCount} usuarios creados`);
        onSuccess();
      } else {
        toast.error(`Importación parcial: ${result.errorCount} errores encontrados`);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const onSubmit = (data: CSVFormData) => {
    if (!data.file) {
      toast.error("Por favor selecciona un archivo CSV");
      return;
    }
    importMutation.mutate(data.file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("file", file);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `username,fullName,email,role,password,id_phidias,url_photo
jdoe,Juan Pérez,juan@example.com,USER,MiContraseña123,,
msmith,María García,maria@example.com,TEACHER,,12345,https://example.com/foto.jpg
psych1,Pedro Psicólogo,pedro@example.com,PSYCHOLOGY,ContraseñaSegura456,,`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'plantilla_usuarios.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetModal = () => {
    setImportResult(null);
    setShowPreview(false);
    setVisiblePasswords(new Set());
    form.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePasswordVisibility = (username: string) => {
    const newVisiblePasswords = new Set(visiblePasswords);
    if (newVisiblePasswords.has(username)) {
      newVisiblePasswords.delete(username);
    } else {
      newVisiblePasswords.add(username);
    }
    setVisiblePasswords(newVisiblePasswords);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copiado al portapapeles");
    }).catch(() => {
      toast.error("Error al copiar");
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Mostrar resultados de importación
  if (importResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Resultado de Importación
            </DialogTitle>
            <DialogDescription>
              Resumen del proceso de importación de usuarios
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {importResult.totalRows}
                  </div>
                  <p className="text-sm text-gray-600">Total de filas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {importResult.successCount}
                  </div>
                  <p className="text-sm text-gray-600">Exitosos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {importResult.errorCount}
                  </div>
                  <p className="text-sm text-gray-600">Errores</p>
                </CardContent>
              </Card>
            </div>

            {/* Usuarios creados */}
            {importResult.createdUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usuarios Creados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {importResult.createdUsers.map((user, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{user.fullName}</span>
                            <span className="text-gray-500 ml-2">({user.username})</span>
                          </div>
                          <Badge variant="secondary">{user.role}</Badge>
                        </div>
                        
                        {/* Mostrar contraseña temporal si existe */}
                        {user.temporaryPassword && (
                          <div className="bg-amber-50 border border-amber-200 rounded p-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-amber-600" />
                                <span className="text-sm font-medium text-amber-800">
                                  Contraseña temporal:
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => togglePasswordVisibility(user.username)}
                                  className="h-6 w-6 p-0"
                                >
                                  {visiblePasswords.has(user.username) ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(user.temporaryPassword!)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-1">
                              <code className="text-sm bg-white px-2 py-1 rounded border">
                                {visiblePasswords.has(user.username) 
                                  ? user.temporaryPassword 
                                  : "••••••••••••"
                                }
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Advertencia sobre contraseñas temporales */}
                  {importResult.createdUsers.some(u => u.temporaryPassword) && (
                    <Alert className="mt-4 border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        <strong>Importante:</strong> Las contraseñas temporales mostradas arriba se generaron automáticamente. 
                        Asegúrate de compartirlas con los usuarios correspondientes y solicita que las cambien en su primer acceso.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Errores */}
            {importResult.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Errores Encontrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <span className="font-medium">Fila {error.row}:</span> {error.message}
                          {error.field && <span className="text-gray-600"> (Campo: {error.field})</span>}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importación Masiva de Usuarios</DialogTitle>
          <DialogDescription>
            Carga un archivo CSV para crear múltiples usuarios a la vez
          </DialogDescription>
        </DialogHeader>

        {/* Información y ejemplo de formato */}
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Columnas requeridas:</strong> username, fullName, email, role
                </p>
                <p>
                  <strong>Columnas opcionales:</strong> password, id_phidias, url_photo
                </p>
                <p>
                  <strong>Roles válidos:</strong> PSYCHOLOGY, TEACHER, USER, STUDENT
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> El sistema detecta automáticamente headers con diferentes formatos (fullName/fullname, etc.) y caracteres especiales.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-amber-200 bg-amber-50">
            <Key className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="space-y-2">
                <p><strong>Sobre las contraseñas:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Si no proporcionas una contraseña, se generará automáticamente una segura</li>
                  <li>Las contraseñas deben tener al menos 8 caracteres</li>
                  <li>Las contraseñas generadas automáticamente se mostrarán al final del proceso</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Restricciones importantes:</strong> No es posible crear usuarios con roles ADMIN o COORDINATOR a través de importación masiva por razones de seguridad.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              ¿Necesitas una plantilla? Descarga el archivo de ejemplo:
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar Plantilla
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>Archivo CSV</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={importMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={importMutation.isPending || !form.watch("file")}
                >
                  {importMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Usuarios
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}