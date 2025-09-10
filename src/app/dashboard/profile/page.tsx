"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSession } from "@/hooks/auth-client";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Esquema de validación para información personal
const profileSchema = z.object({
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  fullName: z
    .string()
    .min(3, "El nombre completo debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido").nullable().optional(),
});

// Esquema de validación para cambio de contraseña
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "La confirmación de contraseña es requerida"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { session, update } = useSession();
  const user = session?.user;
  const [activeTab, setActiveTab] = useState("profile");

  // Formulario de perfil
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });

  // Formulario de contraseña
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Mutación para actualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!user) return;

      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          username: data.username,
          fullName: data.fullName,
          email: data.email,
          role: user.role,
          areaPermissions: [], // Mantener permisos actuales
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar perfil");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Perfil actualizado correctamente");
      // Actualizar la sesión con los nuevos datos
      update({
        ...session,
        user: {
          ...session?.user,
          username: data.username,
          fullName: data.fullName,
          email: data.email,
        },
      });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Mutación para cambiar contraseña
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await fetch("/api/v1/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al cambiar contraseña");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Contraseña actualizada correctamente");
      passwordForm.reset();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Manejadores de envío
  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  // Obtener el nombre del rol para mostrar
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "PRESCHOOL_COORDINATOR":
        return "Coordinador Preescolar";
      case "ELEMENTARY_COORDINATOR":
        return "Coordinador Primaria";
      case "MIDDLE_SCHOOL_COORDINATOR":
        return "Coordinador Secundaria";
      case "HIGH_SCHOOL_COORDINATOR":
        return "Coordinador Bachillerato";
      case "PSYCHOLOGY":
        return "Psicología";
      case "TEACHER":
        return "Director de Grupo";
      case "USER":
        return "Usuario";
      case "STUDENT":
        return "Estudiante";
      default:
        return role;
    }
  };

  if (!user) {
    return (
      <ContentLayout title="Mi Perfil">
        <Card>
          <CardHeader>
            <CardTitle>Cargando perfil...</CardTitle>
          </CardHeader>
        </Card>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Mi Perfil">
      <div className="space-y-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>{user.fullName}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  @{user.username}
                  <Badge>{getRoleDisplayName(user.role)}</Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger className="flex-1" value="profile">
              Información Personal
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="password">
              Cambiar Contraseña
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información de perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Nombre de usuario */}
                      <FormField
                        control={profileForm.control}
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
                        control={profileForm.control}
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
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Actualizar Perfil
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Actualiza tu contraseña de acceso al sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-6"
                  >
                    {/* Contraseña actual */}
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña actual</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Nueva contraseña */}
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nueva contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirmar contraseña */}
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Cambiar Contraseña
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
}
