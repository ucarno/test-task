import {InputHTMLAttributes, useId, useState} from "react";
import styled from "styled-components";

const InputContainer = styled.div.attrs((props: {invalid: boolean}) => props)`
  width: 100%;
  
  display: flex;
  flex-direction: column;
  
  input {
    border-radius: 4px;
    
    ${p => p.invalid ? (
            'border: none; outline: 2px solid red;'
    ) : null}
  }
  
  // error
  span {
    margin-top: 2px;
    font-size: 14px;
    color: red;
  }
`

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string,
    error?: string
}
const Input = (props: InputProps) => {
    const {label, error, ...otherProps} = props

    const [focused, setFocused] = useState(false)
    const htmlId = useId();

    return (
        <InputContainer invalid={!!error && !focused}>
            {label ? <label htmlFor={htmlId}>{label}</label> : null}
            <input id={htmlId}
                   {...otherProps}
                   onFocus={e => {
                       otherProps.onFocus?.(e)
                       setFocused(true)
                   }}
                   onBlur={e => {
                       otherProps.onBlur?.(e)
                       setFocused(false)
                   }}
            />
            {(!!error && !focused) ? <span>{error}</span> : null}
        </InputContainer>
    )
}
export default Input
