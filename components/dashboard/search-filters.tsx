'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { SortField, SortDirection } from '@/types';

interface SearchFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    sortBy: SortField;
    onSortByChange: (field: SortField) => void;
    sortDirection: SortDirection;
    onSortDirectionChange: (direction: SortDirection) => void;
}

const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'sentiment', label: 'Market Sentiment' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'valuation', label: 'Valuation' },
    { value: 'volatility', label: 'Volatility' },
    { value: 'other', label: 'Other' },
];

const sortFields = [
    { value: 'view_count' as const, label: 'Most Popular' },
    { value: 'name' as const, label: 'Name' },
    { value: 'category' as const, label: 'Category' },
    { value: 'latest_value' as const, label: 'Latest Value' },
    { value: 'latest_ts' as const, label: 'Last Updated' },
];

export function SearchFilters({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    sortBy,
    onSortByChange,
    sortDirection,
    onSortDirectionChange,
}: SearchFiltersProps) {
    return (
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search indicators..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                            {category.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {sortFields.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                            {field.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                variant="outline"
                size="sm"
                onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="min-w-[70px]"
            >
                {sortDirection === 'asc' ? '↑ ASC' : '↓ DESC'}
            </Button>
        </div>
    );
}
