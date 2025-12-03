"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Role } from "@/prismacl/client";
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
import { Loader2, KeyIcon, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
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
  groupCode: z.string().optional(), // Código del grupo para directores de grupo
  id_phidias: z.string().optional(),
  url_photo: z.string().url("URL inválida").optional().or(z.literal("")),
  areaPermissions: z.array(
    z.object({
      areaId: z.number(),
      canView: z.boolean(),
    })
  ),
  sendCredentials: z.boolean().optional(), // Opción para enviar credenciales al crear
});

type UserFormData = z.infer<typeof userSchema>;

type AreaData = {
  id: number;
  name: string;
  code: string;
};

type GroupData = {
  value: string;
  label: string;
};

type User = {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: Role;
  groupCode?: string | null; // Código del grupo para directores de grupo
  id_phidias?: string | null;
  url_photo?: string | null;
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

  // Obtener grupos disponibles
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await fetch("/api/v1/groups");
      if (!response.ok) throw new Error("Error al cargar grupos");
      return response.json() as Promise<GroupData[]>;
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

      const result = await response.json();
      return { ...result, sendCredentials: data.sendCredentials };
    },
    onSuccess: async (data) => {
      toast.success(
        isEdit
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente"
      );

      // Si se marcó enviar credenciales y es un nuevo usuario
      if (!isEdit && data.sendCredentials && data.id) {
        try {
          await sendCredentialsMutation.mutateAsync(data.id);
        } catch {
          // El error ya se maneja en el onError de sendCredentialsMutation
        }
      }

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

  // Mutation para enviar credenciales vía Phidias
  const sendCredentialsMutation = useMutation({
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
    onSuccess: () => {
      toast.success("Credenciales enviadas correctamente vía Phidias");
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
        groupCode: user.groupCode || "",
        id_phidias: user.id_phidias || "",
        url_photo: user.url_photo || "",
        areaPermissions:
          user.areaPermissions?.map((perm) => ({
            areaId: perm.area.id,
            canView: perm.canView,
          })) || [],
      };
    }

    return {
      role: "USER" as Role,
      groupCode: "",
      id_phidias: "",
      url_photo: "",
      areaPermissions: [],
      sendCredentials: false,
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
    return (
      role !== "ADMIN" &&
      role !== "USER" &&
      role !== "STUDENT" &&
      role !== "TEACHER"
    );
  };

  const showGroupCode = (role: Role) => {
    return role === "TEACHER";
  };

  const currentRole = form.watch("role");
  const currentIdPhidias = form.watch("id_phidias");

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

  // Función para enviar credenciales a usuario existente
  const handleSendCredentials = () => {
    if (!user) return;
    sendCredentialsMutation.mutate(user.id);
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
            {/* Botones para admin en modo edición */}
            {isEdit && isAdmin && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
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
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSendCredentials}
                  disabled={
                    sendCredentialsMutation.isPending || !user?.id_phidias
                  }
                  title={
                    !user?.id_phidias
                      ? "El usuario no tiene ID de Phidias"
                      : "Enviar credenciales vía Phidias"
                  }
                >
                  {sendCredentialsMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Enviar Credenciales
                </Button>
              </div>
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

              {/* ID Phidias */}
              <FormField
                control={form.control}
                name="id_phidias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Phidias</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* URL Foto */}
              <FormField
                control={form.control}
                name="url_photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Foto</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://ejemplo.com/foto.jpg"
                      />
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
                        <SelectItem value="PSYCHOLOGY">Psicología</SelectItem>
                        <SelectItem value="TEACHER">
                          Director de Grupo
                        </SelectItem>
                        <SelectItem value="USER">Usuario</SelectItem>
                        <SelectItem value="STUDENT">Estudiante</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Código de Grupo - solo visible para directores de grupo */}
            {showGroupCode(currentRole) && (
              <FormField
                control={form.control}
                name="groupCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código del Grupo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                      disabled={groupsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un grupo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups?.map((group) => (
                          <SelectItem key={group.value} value={group.value}>
                            {group.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            {/* Checkbox para enviar credenciales al crear usuario */}
            {!isEdit && (
              <FormField
                control={form.control}
                name="sendCredentials"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!currentIdPhidias}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel
                        className={
                          !currentIdPhidias ? "text-muted-foreground" : ""
                        }
                      >
                        Enviar credenciales vía Phidias
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {currentIdPhidias
                          ? "Se enviará un mensaje al usuario con sus datos de acceso"
                          : "Ingresa un ID de Phidias para habilitar esta opción"}
                      </p>
                    </div>
                  </FormItem>
                )}
              />
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
                disabled={
                  userMutation.isPending || areasLoading || groupsLoading
                }
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
