
export default function InputField({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly = false,
  disabled = false,
  onKeyDown,
  onBlur,
  maxLength,
  hint,
  className = "",
}) {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        maxLength={maxLength}
        required={required}
      />
      {hint && <span className="input-hint">{hint}</span>}
    </div>
  );
}