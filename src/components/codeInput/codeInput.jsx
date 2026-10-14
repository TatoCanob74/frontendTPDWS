export default function CodeInput({
  id, value, disabled, error, onChange, onComplete
}){

  const handleChange = (e) => {
    const rawValue = e.target.value;

    const valueString = rawValue.replace(/[^\d]/g, "");

    onChange(valueString);

    if(valueString.length >= 6){
      onComplete?.(valueString)
    }
  }

  return(
    <input
    id={id}
    type="text"
    inputMode="numeric"
    autoComplete="one-time-code"
    maxLength={6}
    value={value}
    onChange={handleChange}
    disabled={disabled}
    aria-invalid={Boolean(error)}
    className={`input input--code ${error ? 'input--error' : ''}`}
  />
  );
}
