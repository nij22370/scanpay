"use client";

import { motion } from "framer-motion";
import { useProducts, useCreateProduct, useUpdateProduct } from "@/hooks";
import { ProductForm } from "./ProductForm";
import { useState } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Product } from "@/types";

export function ProductManager() {
  const [search, setSearch] = useState("");
  const { data: allProducts, isLoading } = useProducts();
  const products = search
    ? allProducts?.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : allProducts;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setEditing(null)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 p-2 border rounded-lg"
        />
      </div>

      {editing && <ProductForm product={editing} onSubmit={() => setEditing(null)} />}

      {isLoading && <div>Loading products...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products?.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 border rounded-lg space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold">{product.name}</h3>
                {product.name_np && (
                  <p className="text-sm text-muted-foreground">{product.name_np}</p>
                )}
              </div>
              <button onClick={() => setEditing(product)} className="p-1 hover:bg-accent rounded">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">Rs. {product.price}</span>
              <span className={`text-sm px-2 py-1 rounded ${product.stock <= 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                Stock: {product.stock}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{product.category ?? "Uncategorized"}</span>
              {product.barcode && <span className="font-mono">{product.barcode}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
