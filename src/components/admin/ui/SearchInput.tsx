'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { TextInput } from '@/components/ui/inputs';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
}

export default function SearchInput({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className = ''
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query (instant clear for responsiveness)
  useEffect(() => {
    if (query === '') {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Call onSearch when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <div className={className}>
      <TextInput
        value={query}
        onChange={(val) => setQuery(val)}
        placeholder={placeholder}
        leftIcon={Search}
        clearable
      />
    </div>
  );
}
