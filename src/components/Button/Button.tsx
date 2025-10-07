import type { ButtonProps } from "../../types/types";

export const Button = ({
  type,
  className,
  onClick,
  hidden,
  disabled,
  children
}: ButtonProps) => (
  <button
    type={type}
    className={className}
    onClick={onClick}
    hidden={hidden}
    disabled={disabled}
  >
    {children}
  </button>
);