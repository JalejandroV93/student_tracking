"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useStudentManagement, CreateStudentData, UpdateStudentData } from "@/hooks/useStudentManagement";
import { useSchoolYears } from "@/hooks/useSchoolYears";
import { StudentForm } from "./StudentForm";
import { DeleteStudentDialog } from "./DeleteStudentDialog";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  code: string;
  grado: string;
  level: string;
  photo_url?: string;
}

interface StudentFilters {
  search: string;
  grado: string;
  nivel: string; // Cambio de seccion a nivel
  schoolYearId: string;
}

export function StudentCRUDTab() {
  const [filters, setFilters] = useState<StudentFilters>({
    search: "",
    grado: "all",
    nivel: "all", // Cambio de seccion a nivel
    schoolYearId: "active"
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  
  const pageSize = 10;
  
  const {
    students,
    totalStudents,
    loading,
    loadStudents,
    createStudent,
    updateStudent,
    deleteStudent
  } = useStudentManagement();
  
  const { schoolYears } = useSchoolYears();

  // Cargar estudiantes cuando cambien los filtros o página
  useEffect(() => {
    loadStudents({
      page: currentPage,
      limit: pageSize,
      ...filters
    });
  }, [currentPage, filters, loadStudents]);

  // Obtener todas las opciones únicas de grado y nivel académico
  const [gradoOptions, setGradoOptions] = useState<string[]>([]);
  const [nivelOptions, setNivelOptions] = useState<string[]>([]);

  useEffect(() => {
    // Ordenar grados de Kínder 5 a Doce
    setGradoOptions([
      "Kínder 5", 
      "Primero", 
      "Segundo", 
      "Tercero", 
      "Cuarto", 
      "Quinto",
      "Sexto", 
      "Séptimo", 
      "Octavo", 
      "Noveno", 
      "Décimo", 
      "Once",
      "Doce"
    ]);
    // Opciones de nivel académico en lugar de secciones literales
    setNivelOptions(["Preschool", "Elementary", "Middle School", "High School"]);
  }, []);

  const handleFilterChange = useCallback((key: keyof StudentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handleCreateStudent = useCallback(async (studentData: CreateStudentData) => {
    try {
      await createStudent(studentData);
      setShowForm(false);
      toast.success("Estudiante creado exitosamente");
      loadStudents({
        page: currentPage,
        limit: pageSize,
        ...filters
      });
    } catch (error) {
      console.error("Error creating student:", error);
      toast.error("Error al crear estudiante");
    }
  }, [createStudent, loadStudents, currentPage, filters]);

  const handleEditStudent = useCallback((student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  }, []);

  const handleUpdateStudent = useCallback(async (studentData: UpdateStudentData) => {
    if (!editingStudent) return;
    
    try {
      await updateStudent(editingStudent.id, studentData);
      setShowForm(false);
      setEditingStudent(null);
      toast.success("Estudiante actualizado exitosamente");
      loadStudents({
        page: currentPage,
        limit: pageSize,
        ...filters
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Error al actualizar estudiante");
    }
  }, [editingStudent, updateStudent, loadStudents, currentPage, filters]);

  const handleDeleteStudent = useCallback(async (student: Student) => {
    try {
      await deleteStudent(student.id);
      setDeletingStudent(null);
      toast.success("Estudiante eliminado exitosamente");
      loadStudents({
        page: currentPage,
        limit: pageSize,
        ...filters
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Error al eliminar estudiante");
    }
  }, [deleteStudent, loadStudents, currentPage, filters]);

  const handleSaveStudent = useCallback(async (data: CreateStudentData | UpdateStudentData) => {
    if (editingStudent) {
      return handleUpdateStudent(data as UpdateStudentData);
    } else {
      return handleCreateStudent(data as CreateStudentData);
    }
  }, [editingStudent, handleUpdateStudent, handleCreateStudent]);

  const totalPages = Math.ceil(totalStudents / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gestión de Estudiantes</h3>
          <p className="text-muted-foreground">
            Administra los estudiantes del sistema con filtros y paginación
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Estudiante
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Nombre o código..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Año académico */}
            <div className="space-y-2">
              <Label>Año Académico</Label>
              <Select
                value={filters.schoolYearId}
                onValueChange={(value) => handleFilterChange("schoolYearId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Año Activo</SelectItem>
                  {schoolYears.map((year) => (
                    <SelectItem key={year.id} value={year.id.toString()}>
                      {year.name} {year.isActive && "(Activo)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grado */}
            <div className="space-y-2">
              <Label>Grado</Label>
              <Select
                value={filters.grado}
                onValueChange={(value) => handleFilterChange("grado", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los grados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grados</SelectItem>
                  {gradoOptions.map((grado) => (
                    <SelectItem key={grado} value={grado}>
                      {grado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nivel Académico */}
            <div className="space-y-2">
              <Label>Nivel Académico</Label>
              <Select
                value={filters.nivel}
                onValueChange={(value) => handleFilterChange("nivel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los niveles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  {nivelOptions.map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de estudiantes */}
      <Card>
        <CardHeader>
          <CardTitle>
            Estudiantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando estudiantes...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron estudiantes con los filtros seleccionados
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">{student.code}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.grado}</TableCell>
                      <TableCell>{student.level}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingStudent(student)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} ({totalStudents} estudiantes)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Formulario de estudiante */}
      {showForm && (
        <StudentForm
          student={editingStudent}
          onSave={handleSaveStudent}
          onCancel={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
          schoolYears={schoolYears}
        />
      )}

      {/* Diálogo de confirmación de eliminación */}
      {deletingStudent && (
        <DeleteStudentDialog
          student={deletingStudent}
          onConfirm={() => handleDeleteStudent(deletingStudent)}
          onCancel={() => setDeletingStudent(null)}
        />
      )}
    </div>
  );
}