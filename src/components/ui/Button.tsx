import React from 'react';

export type ButtonVariant = 'solid' | 'soft' | 'ghost';
export type ButtonColor = 'primary' | 'neutral';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	color?: ButtonColor;
}

export default function Button({ variant = 'solid', color = 'primary', className = '', ...rest }: ButtonProps) {
	const cls = `ui-btn ui-btn--${variant} ui-btn--${color} ${className}`.trim();
	return <button className={cls} {...rest} />;
}


