import React from 'react'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import { useFormContext, ValidationRules } from 'react-hook-form'

export type TextFieldInputProps =
  Omit<TextFieldProps, 'inputRef'> &
  {
    validateRules: ValidationRules
  }

const TextFieldInput: React.FC<TextFieldInputProps> = ({ validateRules, variant, ...props }) => {
  const { register } = useFormContext()

  return (
    <TextField
      variant={variant as any}
      {...props}
      inputRef={register(validateRules)}
    />
  )
}
export default TextFieldInput
