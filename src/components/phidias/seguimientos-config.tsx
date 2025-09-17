'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Check,
  X 
} from 'lucide-react';
import { toast } from 'sonner';

interface SeguimientoConfig {
  id: number;
  phidias_id: number;
  name: string;
  description: string | null;
  tipo_falta: string;
  nivel_academico: string;
  isActive: boolean;
  schoolYear: {
    id: number;
    name: string;
    isActive: boolean;
  };
}

interface SchoolYear {
  id: number;
  name: string;
  isActive: boolean;
}

export function SeguimientosConfig() {
  const [seguimientos, setSeguimientos] = useState<SeguimientoConfig[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeguimientoConfig | null>(null);
  const [formData, setFormData] = useState({
    phidias_id: '',
    name: '',
    description: '',
    tipo_falta: '',
    nivel_academico: '',
    school_year_id: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar seguimientos y años académicos en paralelo
      const [seguimientosResponse, schoolYearsResponse] = await Promise.all([
        fetch('/api/v1/phidias/seguimientos'),
        fetch('/api/v1/school-years')
      ]);

      if (seguimientosResponse.ok) {
        const seguimientosData = await seguimientosResponse.json();
        setSeguimientos(seguimientosData);
      }

      if (schoolYearsResponse.ok) {
        const schoolYearsResult = await schoolYearsResponse.json();
        if (schoolYearsResult.success && Array.isArray(schoolYearsResult.data)) {
          setSchoolYears(schoolYearsResult.data);
        } else {
          console.error('Invalid school years response format:', schoolYearsResult);
          toast.error('Error cargando años académicos');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error cargando datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: SeguimientoConfig) => {
    setEditingItem(item);
    setFormData({
      phidias_id: item.phidias_id.toString(),
      name: item.name,
      description: item.description || '',
      tipo_falta: item.tipo_falta,
      nivel_academico: item.nivel_academico,
      school_year_id: item.schoolYear.id.toString(),
      isActive: item.isActive
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    setFormData({
      phidias_id: '',
      name: '',
      description: '',
      tipo_falta: '',
      nivel_academico: '',
      school_year_id: Array.isArray(schoolYears) ? (schoolYears.find(sy => sy.isActive)?.id.toString() || '') : '',
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = editingItem 
        ? `/api/v1/phidias/seguimientos`
        : `/api/v1/phidias/seguimientos`;
      
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem 
        ? { id: editingItem.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(editingItem ? 'Seguimiento actualizado' : 'Seguimiento creado');
        setIsDialogOpen(false);
        loadData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error guardando seguimiento');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este seguimiento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/phidias/seguimientos?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Seguimiento eliminado');
        loadData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error eliminando seguimiento');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Error de conexión');
    }
  };

  const getTipoFaltaBadge = (tipo: string) => {
    const colors = {
      'Tipo I': 'bg-blue-600',
      'Tipo II': 'bg-yellow-600',
      'Tipo III': 'bg-red-600'
    };
    return (
      <Badge className={colors[tipo as keyof typeof colors] || 'bg-gray-600'}>
        {tipo}
      </Badge>
    );
  };

  const getNivelBadge = (nivel: string) => {
    const colors = {
      'Preschool': 'bg-green-600',
      'Elementary': 'bg-blue-600',
      'Middle School': 'bg-orange-600',
      'High School': 'bg-purple-600'
    };
    return (
      <Badge variant="outline" className={`border-2 ${colors[nivel as keyof typeof colors] || 'border-gray-600'}`}>
        {nivel}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando configuraciones...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuraciones de Seguimientos
            </CardTitle>
            <CardDescription>
              Gestiona las configuraciones de seguimientos de Phidias por tipo de falta y nivel académico
            </CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Seguimiento
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}
                </DialogTitle>
                <DialogDescription>
                  Configura los parámetros del seguimiento de Phidias
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phidias_id">ID de Phidias</Label>
                    <Input
                      id="phidias_id"
                      type="number"
                      value={formData.phidias_id}
                      onChange={(e) => setFormData({ ...formData, phidias_id: e.target.value })}
                      placeholder="651"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="school_year">Año Académico</Label>
                    <Select 
                      value={formData.school_year_id} 
                      onValueChange={(value) => setFormData({ ...formData, school_year_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar año" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(schoolYears) && schoolYears.map((year) => (
                          <SelectItem key={year.id} value={year.id.toString()}>
                            {year.name} {year.isActive && '(Activo)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Llamados de Atención Formal Middle School"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción del seguimiento..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_falta">Tipo de Falta</Label>
                    <Select 
                      value={formData.tipo_falta} 
                      onValueChange={(value) => setFormData({ ...formData, tipo_falta: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tipo I">Tipo I</SelectItem>
                        <SelectItem value="Tipo II">Tipo II</SelectItem>
                        <SelectItem value="Tipo III">Tipo III</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nivel_academico">Nivel Académico</Label>
                    <Select 
                      value={formData.nivel_academico} 
                      onValueChange={(value) => setFormData({ ...formData, nivel_academico: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preschool">Preschool</SelectItem>
                        <SelectItem value="Elementary">Elementary</SelectItem>
                        <SelectItem value="Middle School">Middle School</SelectItem>
                        <SelectItem value="High School">High School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingItem ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {seguimientos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay configuraciones de seguimientos</p>
            <Button onClick={handleNew} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Crear primera configuración
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Phidias</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo Falta</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Año Académico</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seguimientos.map((seguimiento) => (
                <TableRow key={seguimiento.id}>
                  <TableCell className="font-mono">{seguimiento.phidias_id}</TableCell>
                  <TableCell className="font-medium">{seguimiento.name}</TableCell>
                  <TableCell>{getTipoFaltaBadge(seguimiento.tipo_falta)}</TableCell>
                  <TableCell>{getNivelBadge(seguimiento.nivel_academico)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {seguimiento.schoolYear.name}
                      {seguimiento.schoolYear.isActive && (
                        <Badge variant="secondary" className="text-xs">Activo</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {seguimiento.isActive ? (
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        Activo
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500">
                        <X className="h-4 w-4 mr-1" />
                        Inactivo
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(seguimiento)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(seguimiento.id)}
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
        )}
      </CardContent>
    </Card>
  );
}