import React from 'react';

export default function Chip({ children, icon }: { children: React.ReactNode; icon?: string }) {
	return (
		<span className="ui-chip">
			{icon ? <i className={`bi ${icon}`} style={{ marginRight: 6 }} /> : null}
			{children}
		</span>
	);
}


