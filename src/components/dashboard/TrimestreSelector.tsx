import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TrimestreSelectorProps {
  currentTrimestre: string | undefined;
  onTrimestreChange: (trimestre: string) => void;
}

export function TrimestreSelector({
  currentTrimestre,
  onTrimestreChange,
}: TrimestreSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Trimestre:</span>
      <Select
        value={currentTrimestre || "all"}
        onValueChange={onTrimestreChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Seleccionar trimestre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los trimestres</SelectItem>
          <SelectItem value="1">Primer Trimestre</SelectItem>
          <SelectItem value="2">Segundo Trimestre</SelectItem>
          <SelectItem value="3">Tercer Trimestre</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
