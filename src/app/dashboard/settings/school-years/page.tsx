"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { useSchoolYearSettings } from "@/hooks/use-school-year-settings";
import { SchoolYearForm } from "@/components/settings/school-years/SchoolYearForm";
import { SchoolYearEditForm } from "@/components/settings/school-years/SchoolYearEditForm";
import { CreateSchoolYearRequest, SchoolYear, UpdateSchoolYearRequest } from "@/types/school-year";
import { toast } from "sonner";

export default function SchoolYearsSettingsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSchoolYear, setEditingSchoolYear] = useState<SchoolYear | null>(null);
  const { 
    settings, 
    loading, 
    error, 
    activateSchoolYear, 
    createSchoolYear, 
    updateSchoolYear,
    deleteSchoolYear 
  } = useSchoolYearSettings();

  const handleActivateYear = async (schoolYear: SchoolYear) => {
    const success = await activateSchoolYear(schoolYear.id);
    if (success) {
      toast.success(`Año escolar "${schoolYear.name}" activado exitosamente`);
    }
  };

  const handleCreateSchoolYear = async (formData: CreateSchoolYearRequest) => {
    const success = await createSchoolYear(formData);
    if (success) {
      setShowCreateForm(false);
      toast.success("Año escolar creado exitosamente");
    }
    return success;
  };

  const handleUpdateSchoolYear = async (id: number, formData: UpdateSchoolYearRequest) => {
    const success = await updateSchoolYear(id, formData);
    if (success) {
      setEditingSchoolYear(null);
      toast.success("Año escolar actualizado exitosamente");
    }
    return success;
  };

  const handleDeleteSchoolYear = async (schoolYear: SchoolYear) => {
    if (schoolYear.isActive) {
      toast.error("No se puede eliminar el año escolar activo");
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar el año escolar "${schoolYear.name}"? Esta acción no se puede deshacer.`)) {
      const success = await deleteSchoolYear(schoolYear.id);
      if (success) {
        toast.success("Año escolar eliminado exitosamente");
      }
    }
  };

  if (loading) {
    return (
      <ContentLayout title="Configuración de Años Escolares">
        <div className="space-y-6">
          <div className="animate-pulse">
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-96"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title="Configuración de Años Escolares">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Configuración de Años Escolares">
      <div className="space-y-6">
        {/* Header con botón de crear */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Años Escolares</h1>
            <p className="text-gray-600">
              Configura y gestiona los años escolares y sus trimestres
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={showCreateForm || editingSchoolYear !== null}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Año Escolar
          </Button>
        </div>

        {/* Formulario de creación */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Año Escolar</CardTitle>
              <CardDescription>
                Define un nuevo año escolar con sus trimestres correspondientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchoolYearForm
                onSubmit={handleCreateSchoolYear}
                onCancel={() => setShowCreateForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Formulario de edición */}
        {editingSchoolYear && (
          <Card>
            <CardHeader>
              <CardTitle>Editar Año Escolar</CardTitle>
              <CardDescription>
                Modifica la información del año escolar seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchoolYearEditForm
                schoolYear={editingSchoolYear}
                onSubmit={handleUpdateSchoolYear}
                onCancel={() => setEditingSchoolYear(null)}
              />
            </CardContent>
          </Card>
        )}

        {/* Año escolar activo */}
        {settings.activeSchoolYear && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-800 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Año Escolar Activo
                  </CardTitle>
                  <CardDescription>
                    Este es el año escolar que se está utilizando actualmente
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Activo
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {settings.activeSchoolYear.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(
                      settings.activeSchoolYear.startDate
                    ).toLocaleDateString("es-ES")}{" "}
                    -{" "}
                    {new Date(
                      settings.activeSchoolYear.endDate
                    ).toLocaleDateString("es-ES")}
                  </p>
                  {settings.activeSchoolYear.description && (
                    <p className="text-sm text-gray-500 mt-2">
                      {settings.activeSchoolYear.description}
                    </p>
                  )}
                </div>

                {/* Trimestres */}
                <div>
                  <h4 className="font-medium mb-2">Trimestres:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {settings.activeSchoolYear.trimestres?.map((trimestre) => (
                      <Card key={trimestre.id} className="bg-white">
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <h5 className="font-semibold">{trimestre.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(trimestre.startDate).toLocaleDateString(
                                "es-ES",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}{" "}
                              -{" "}
                              {new Date(trimestre.endDate).toLocaleDateString(
                                "es-ES",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de todos los años escolares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Todos los Años Escolares
            </CardTitle>
            <CardDescription>
              Gestiona todos los años escolares configurados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settings.allSchoolYears.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No hay años escolares configurados
                </p>
                <p className="text-sm text-gray-400">
                  Crea tu primer año escolar para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {settings.allSchoolYears.map((schoolYear) => (
                  <Card
                    key={schoolYear.id}
                    className={`
                    ${
                      schoolYear.isActive
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200"
                    }
                  `}
                  >
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {schoolYear.name}
                            </h3>
                            {schoolYear.isActive ? (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800"
                              >
                                Activo
                              </Badge>
                            ) : (
                              <Badge variant="outline">Inactivo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(schoolYear.startDate).toLocaleDateString(
                              "es-ES"
                            )}{" "}
                            -{" "}
                            {new Date(schoolYear.endDate).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                          {schoolYear.description && (
                            <p className="text-sm text-gray-500 mb-3">
                              {schoolYear.description}
                            </p>
                          )}

                          {/* Trimestres en línea */}
                          <div className="flex gap-2 flex-wrap">
                            {schoolYear.trimestres?.map((trimestre) => (
                              <Badge
                                key={trimestre.id}
                                variant="outline"
                                className="text-xs"
                              >
                                {trimestre.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="ml-4 flex gap-2">
                          {!schoolYear.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivateYear(schoolYear)}
                              disabled={editingSchoolYear !== null}
                            >
                              Activar
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSchoolYear(schoolYear)}
                            disabled={showCreateForm || editingSchoolYear !== null}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          {!schoolYear.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSchoolYear(schoolYear)}
                              disabled={showCreateForm || editingSchoolYear !== null}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
