import * as React from "react";


type Props = {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
};

export default function LinkedinButton({ onClick, className = "", disabled = false, loading = false }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={`flex items-center justify-center px-4 py-3 border rounded-lg font-medium text-sm transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span aria-hidden="true" className="h-5 w-5 mr-3 flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.62a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zm15.11 12.83h-3.55v-5.62c0-1.34-.03-3.06-1.86-3.06-1.86 0-2.15 1.46-2.15 2.97v5.71H9.33V9h3.41v1.56h.05c.48-.91 1.66-1.86 3.42-1.86 3.66 0 4.34 2.41 4.34 5.54v6.22z" />
        </svg>
      </span>
      {loading ? "A abrir..." : "Continuar com o LinkedIn"}
    </button>
  );
}
