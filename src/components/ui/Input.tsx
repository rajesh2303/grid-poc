import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input(props: InputProps) {
	return <input className={`ui-input ${props.className || ''}`.trim()} {...props} />;
}


