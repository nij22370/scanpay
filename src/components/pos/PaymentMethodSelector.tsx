"use client";

interface PaymentMethodSelectorProps {
  selected: string | null;
  onSelect: (method: string) => void;
}

const methods = [
  { id: "esewa", label: "eSewa", icon: "₨" },
  { id: "khalti", label: "Khalti", icon: "K" },
  { id: "fonepay", label: "FonePay", icon: "F" },
  { id: "cash", label: "Cash", icon: "₹" },
  { id: "card", label: "Card", icon: "💳" },
];

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {methods.map((method) => (
        <button
          key={method.id}
          onClick={() => onSelect(method.id)}
          className={`p-3 rounded-lg border text-center transition-colors ${
            selected === method.id
              ? "border-primary bg-primary/10"
              : "border-input hover:bg-accent"
          }`}
        >
          <span className="block text-xl mb-1">{method.icon}</span>
          <span className="text-sm font-medium">{method.label}</span>
        </button>
      ))}
    </div>
  );
}
