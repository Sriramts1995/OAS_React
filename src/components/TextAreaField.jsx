
export default function TextAreaField({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  rows = 4,
  readOnly = false,
  disabled = false,
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
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
      />
      {hint && <span className="input-hint">{hint}</span>}
    </div>
  );
}