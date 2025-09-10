"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { KeyIcon } from "lucide-react";
import { useSession } from "@/hooks/auth-client";

// Esquema de validación
const userSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  fullName: z
    .string()
    .min(3, "El nombre completo debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido").nullable().optional(),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional(),
  role: z.nativeEnum(Role),
  areaPermissions: z.array(
    z.object({
      areaId: z.number(),
      canView: z.boolean(),
    })
  ),
});

type UserFormData = z.infer<typeof userSchema>;

type AreaData = {
  id: number;
  name: string;
  code: string;
};

type User = {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: Role;
  areaPermissions: Array<{
    id: number;
    areaId: number;
    canView: boolean;
    area: {
      id: number;
      name: string;
      code: string;
    };
  }>;
};

interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserModal({ user, onClose, onSuccess }: UserModalProps) {
  const isEdit = !!user;
  const { session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Obtener áreas
  const { data: areas, isLoading: areasLoading } = useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const response = await fetch("/api/v1/areas");
      if (!response.ok) throw new Error("Error al cargar áreas");
      return response.json() as Promise<AreaData[]>;
    },
  });

  // Crear o actualizar usuario
  const userMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const url = isEdit ? `/api/v1/users/${data.id}` : "/api/v1/users";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al procesar la solicitud");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(
        isEdit
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente"
      );
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Mutation para resetear contraseña (solo admin)
  const resetPasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      if (!user) return;

      const response = await fetch(`/api/v1/users/${user.id}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al resetear la contraseña");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Contraseña restablecida correctamente");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Preparar valores iniciales para el formulario
  const getDefaultValues = (): Partial<UserFormData> => {
    if (isEdit && user) {
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        areaPermissions:
          user.areaPermissions?.map((perm) => ({
            areaId: perm.area.id,
            canView: perm.canView,
          })) || [],
      };
    }

    return {
      role: "USER" as Role,
      areaPermissions: [],
    };
  };

  // Configurar formulario
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: getDefaultValues(),
  });

  // Actualizar permisos de área cuando se cargan las áreas
  useEffect(() => {
    if (areas && areas.length > 0) {
      // Si es edición, los permisos ya están configurados
      if (!isEdit) {
        // Para nuevos usuarios, inicializar todos los permisos en false
        const initialPermissions = areas.map((area) => ({
          areaId: area.id,
          canView: false,
        }));

        form.setValue("areaPermissions", initialPermissions);
      }
    }
  }, [areas, form, isEdit]);

  const onSubmit = (data: UserFormData) => {
    userMutation.mutate(data);
  };

  // Mostrar u ocultar campos según el rol
  const showAreaPermissions = (role: Role) => {
    return role !== "ADMIN" && role !== "USER" && role !== "STUDENT";
  };

  const currentRole = form.watch("role");

  // Función para manejar el reseteo de contraseña
  const handleResetPassword = () => {
    if (!user) return;

    // Generar una contraseña aleatoria de 10 caracteres
    const randomPassword = Math.random().toString(36).slice(-10);

    resetPasswordMutation.mutate(randomPassword);

    // Mostrar la contraseña generada
    toast.info(`Nueva contraseña: ${randomPassword}`, {
      duration: 10000, // Mostrar por 10 segundos
      description:
        "Copie esta contraseña y compártala con el usuario de forma segura.",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Usuario" : "Crear Usuario"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos y permisos del usuario"
              : "Completa el formulario para crear un nuevo usuario"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Botón para resetear contraseña (solo para admin) */}
            {isEdit && isAdmin && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResetPassword}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyIcon className="mr-2 h-4 w-4" />
                )}
                Restablecer contraseña
              </Button>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Nombre de usuario */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nombre completo */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contraseña */}
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Rol */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="PRESCHOOL_COORDINATOR">
                          Coordinador Preescolar
                        </SelectItem>
                        <SelectItem value="ELEMENTARY_COORDINATOR">
                          Coordinador Primaria
                        </SelectItem>
                        <SelectItem value="MIDDLE_SCHOOL_COORDINATOR">
                          Coordinador Secundaria
                        </SelectItem>
                        <SelectItem value="HIGH_SCHOOL_COORDINATOR">
                          Coordinador Bachillerato
                        </SelectItem>
                        <SelectItem value="GROUP_DIRECTOR">
                          Director de Grupo
                        </SelectItem>
                        <SelectItem value="PSYCHOLOGY">Psicología</SelectItem>
                        <SelectItem value="USER">Usuario</SelectItem>
                        <SelectItem value="STUDENT">Estudiante</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Permisos por Área - solo visible para ciertos roles */}
            {showAreaPermissions(currentRole) && areas && areas.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium mb-4">
                    Permisos por Área
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {areas.map((area, index) => (
                      <div
                        key={area.id}
                        className="flex items-center space-x-2"
                      >
                        <FormField
                          control={form.control}
                          name={`areaPermissions.${index}.canView`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    // Asegurarse de que el areaId esté configurado
                                    form.setValue(
                                      `areaPermissions.${index}.areaId`,
                                      area.id
                                    );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer">
                                  {area.name}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={userMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={userMutation.isPending || areasLoading}
              >
                {userMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
