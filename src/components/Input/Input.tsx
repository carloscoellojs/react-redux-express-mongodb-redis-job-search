import type { InputProps } from "../../types/types";

export const Input = ({ id, type, name, className, onChange, placeholder, value } : InputProps) => (
  <input
    id={id}
    type={type}
    name={name}
    className={className}
    onChange={onChange}
    placeholder={placeholder}
    value={value}
  />
);
