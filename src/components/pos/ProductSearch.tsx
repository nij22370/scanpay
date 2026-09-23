"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, ChevronDown, ChevronUp, Package, Barcode } from "lucide-react";
import { useDebounce } from "@/hooks";
import { useProductSearch } from "@/hooks/products/useProducts";
import type { Product } from "@/types/product";

interface ProductSearchProps {
  onProductSelect: (product: Product) => void;
  placeholder?: string;
}

const STOCK_BADGE_VARIANTS = {
  ok: "bg-emerald-100 text-emerald-700",
  low: "bg-yellow-100 text-yellow-700",
  out: "bg-red-100 text-red-700",
} as const;

function getStockBadgeClass(stock: number, threshold: number = 10): string {
  if (stock <= 0) return STOCK_BADGE_VARIANTS.out;
  if (stock <= threshold) return STOCK_BADGE_VARIANTS.low;
  return STOCK_BADGE_VARIANTS.ok;
}

function getStockLabel(stock: number): string {
  if (stock <= 0) return "Out of stock";
  if (stock <= 5) return "Low stock";
  return `${stock} in stock`;
}

export function ProductSearch({ onProductSelect, placeholder = "Search products by name or barcode..." }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: searchResults = [], isLoading } = useProductSearch(debouncedQuery);

  useEffect(() => {
    setHighlightedIndex(-1);
    if (searchQuery.trim() && searchResults.length > 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [searchQuery, searchResults]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isDropdownOpen || searchResults.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % searchResults.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
          break;
        case "Enter":
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
            onProductSelect(searchResults[highlightedIndex]);
            setSearchQuery("");
            setIsDropdownOpen(false);
            setHighlightedIndex(-1);
            inputRef.current?.blur();
          }
          break;
        case "Escape":
          setIsDropdownOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isDropdownOpen, searchResults, highlightedIndex, onProductSelect]
  );

  const handleResultClick = useCallback(
    (product: Product) => {
      onProductSelect(product);
      setSearchQuery("");
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    },
    [onProductSelect]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    []
  );

  const handleInputFocus = useCallback(() => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setIsDropdownOpen(true);
    }
  }, [searchQuery, searchResults]);

  return (
    <div className="relative" ref={dropdownRef} role="combobox" aria-expanded={isDropdownOpen && searchResults.length > 0} aria-controls="product-search-results">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="w-full h-12 pl-11 pr-10 rounded-xl border border-slate-200 bg-white text-base focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-400 shadow-xs"
          autoComplete="off"
          aria-autocomplete="list"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setIsDropdownOpen(false);
              setHighlightedIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            aria-label="Clear search"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {isDropdownOpen && searchResults.length > 0 && (
        <div
          id="product-search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50 max-h-[300px] overflow-y-auto animate-in fade-in-0 duration-150"
          role="listbox"
        >
          {searchResults.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleResultClick(product)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${
                index === highlightedIndex ? "bg-primary/5" : "hover:bg-slate-50"
              }`}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{product.name}</span>
                  {product.name_np && (
                    <span className="text-sm text-slate-500 truncate">{product.name_np}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <span className="font-bold text-slate-900">Rs. {product.price.toFixed(2)}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStockBadgeClass(
                      product.stock,
                      product.low_stock_threshold ?? 10
                    )}`}
                  >
                    {getStockLabel(product.stock)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                {product.barcode && <Barcode className="w-5 h-5" />}
                <Package className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>
      )}

      {(isDropdownOpen || searchQuery.trim()) && searchResults.length === 0 && !isLoading && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50 p-4 text-center animate-in fade-in-0 duration-150"
        >
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No products found</p>
          <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
        </div>
      )}

      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50 p-4 animate-in fade-in-0 duration-150">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}