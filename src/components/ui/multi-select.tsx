"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";

export type OptionType = {
    label: string;
    value: string;
};

interface MultiSelectProps {
    options: OptionType[];
    selected: string[];
    onChange: (selected: string[]) => void;
    className?: string;
    placeholder?: string;
}

function MultiSelect({ options, selected, onChange, className, placeholder = "Select options" }: MultiSelectProps) {
    const handleSelect = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const selectedLabels = options
        .filter(option => selected.includes(option.value))
        .map(option => option.label);

    const maxDisplay = 2;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-10">
                     <div className="flex gap-1">
                        {selected.length > 0 ? (
                            <>
                                {selectedLabels.slice(0, maxDisplay).map(label => (
                                    <Badge variant="secondary" key={label} className="whitespace-nowrap font-medium">
                                        {label}
                                    </Badge>
                                ))}
                                {selectedLabels.length > maxDisplay && (
                                    <Badge variant="secondary" className="whitespace-nowrap">
                                        +{selectedLabels.length - maxDisplay} more
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
                {options.map((option) => (
                    <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={selected.includes(option.value)}
                        onSelect={(e) => {
                            e.preventDefault();
                            handleSelect(option.value);
                        }}
                    >
                        {option.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export { MultiSelect } 