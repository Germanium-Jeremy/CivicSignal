"use client";

interface BtnProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

export default function MainBtn({ 
    text, 
    onClick, 
    disabled = false,
    className = "",
    type = 'button'
}: BtnProps) {
    return (
        <button 
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                rounded-lg px-4 py-2 bg-primary hover:bg-accent2 
                text-white font-semibold transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-accent2/50
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                ${className}
            `}
        >
            {text}
        </button>
    );
}