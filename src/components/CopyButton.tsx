import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied',
  variant = 'secondary',
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const baseStyles =
    'inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium tracking-wide transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1917]';

  const variantStyles = {
    primary: 'bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917]',
    secondary:
      'bg-[#F6F2EC] text-[#1C1917] border border-[#DFD6C7] hover:bg-[#EDE6DA] hover:border-[#C9BDA9]',
    ghost:
      'text-[#57534E] hover:text-[#1C1917] underline underline-offset-4 decoration-[#D6CEBE] hover:decoration-[#1C1917] px-2 py-1',
  }[variant];

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${baseStyles} ${variantStyles} ${className}`}
      aria-label={copied ? copiedLabel : label}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-[#14532D]" aria-hidden="true" />
      ) : (
        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
