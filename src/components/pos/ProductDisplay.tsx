"use client";

interface ProductDisplayProps {
  name: string;
  price: number;
  stock: number;
  onAddToCart: () => void;
}

export function ProductDisplay({ name, price, stock, onAddToCart }: ProductDisplayProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold">{name}</h3>
      <p className="text-lg font-bold">Rs. {price}</p>
      <p className={`text-sm ${stock <= 5 ? "text-red-600" : "text-muted-foreground"}`}>
        {stock <= 5 ? "Low stock" : `${stock} in stock`}
      </p>
      <button
        onClick={onAddToCart}
        disabled={stock === 0}
        className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
      >
        Add to Cart
      </button>
    </div>
  );
}
