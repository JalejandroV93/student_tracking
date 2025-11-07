import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";

interface UserFiltersProps {
  searchInput: string;
  showBlockedOnly: boolean;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  onBlockedFilterChange: (checked: boolean) => void;
}

export function UserFilters({
  searchInput,
  showBlockedOnly,
  onSearchInputChange,
  onSearch,
  onClearSearch,
  onBlockedFilterChange,
}: UserFiltersProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-4">
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, usuario o email..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={onClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={onSearch}>Buscar</Button>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="blocked-filter"
          checked={showBlockedOnly}
          onCheckedChange={onBlockedFilterChange}
        />
        <Label htmlFor="blocked-filter" className="cursor-pointer">
          Solo usuarios bloqueados
        </Label>
      </div>
    </div>
  );
}
