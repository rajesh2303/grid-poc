import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export default function Select(props: SelectProps) {
	return <select className={`ui-select ${props.className || ''}`.trim()} {...props} />;
}


