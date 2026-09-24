import { Plus } from "lucide-react";
import { useState } from "react";

interface ActionButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  icon?: boolean;
}

export function ActionButton({
  label = "Add New",
  onClick,
  className = "",
  icon = true,
}: ActionButtonProps) {


  const [name,setName]=useState<null |  String>(null);
    return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 ${className}`}
    >
      {icon && <Plus className="h-4 w-4" />}
      {label}

          <input type="text" onChange={(e)=> setName(e.target.value)} />

    </button>

  );
}
