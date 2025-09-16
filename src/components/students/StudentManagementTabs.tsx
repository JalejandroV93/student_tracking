"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Users } from "lucide-react";
import { StudentImportTab } from "./StudentImportTab";
import { StudentCRUDTab } from "./StudentCRUDTab";

export function StudentManagementTabs() {
  const [activeTab, setActiveTab] = useState("crud");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="crud" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Gestión de Estudiantes
        </TabsTrigger>
        <TabsTrigger value="import" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Importar CSV
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="crud" className="mt-6">
        <StudentCRUDTab />
      </TabsContent>
      
      <TabsContent value="import" className="mt-6">
        <StudentImportTab />
      </TabsContent>
    </Tabs>
  );
}