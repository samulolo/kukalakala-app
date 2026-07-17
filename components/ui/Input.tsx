
type Props = {
    placeholder?: string
    type?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    disabled?: boolean
    className?: string
}

export default function Input({ placeholder, type = "text", value, onChange, disabled, className }: Props){
    return(
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={className}
        />
    )
}