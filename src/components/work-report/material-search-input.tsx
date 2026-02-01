"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMaterials } from "@/context/material-context";
import { WorkReportFormValues } from "@/components/work-report-form";
import { Material, UNITS } from "@/types/material"; // Import Material and UNITS type

interface MaterialSearchInputProps {
  index: number;
  field: any; // react-hook-form field object for description
}

export const MaterialSearchInput = ({ index, field }: MaterialSearchInputProps) => {
  const [open, setOpen] = React.useState(false);
  const { materials, loading: materialsLoading } = useMaterials();
  const { setValue } = useFormContext<WorkReportFormValues>();

  const currentDescription = field.value || "";

  const handleSelect = (material: Material | null) => {
    if (material) {
      setValue(`materials.${index}.description`, material.description, { shouldValidate: true });
      setValue(`materials.${index}.unit`, material.unit, { shouldValidate: true });
    } else {
      // User chose to manually enter, keep current input as description, default unit
      setValue(`materials.${index}.unit`, UNITS[0], { shouldValidate: true }); // Default to first unit (PZ)
    }
    setOpen(false);
  };

  const filteredMaterials = materials.filter((material) =>
    material.description.toLowerCase().includes(currentDescription.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        >
          {currentDescription ? currentDescription : "Cerca o inserisci materiale..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Cerca materiale..."
            value={currentDescription}
            onValueChange={field.onChange} // Update react-hook-form field directly
          />
          <CommandList>
            {materialsLoading ? (
              <CommandEmpty>Caricamento materiali...</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>Nessun materiale trovato.</CommandEmpty>
                <CommandGroup>
                  {filteredMaterials.map((material) => (
                    <CommandItem
                      key={material.id}
                      value={material.description}
                      onSelect={() => handleSelect(material)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          currentDescription === material.description ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {material.description} ({material.unit})
                    </CommandItem>
                  ))}
                </CommandGroup>
                {currentDescription && ( // Only show manual input if something is typed
                  <CommandGroup heading="Azioni">
                    <CommandItem onSelect={() => handleSelect(null)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Inserisci manualmente "{currentDescription}"
                    </CommandItem>
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};