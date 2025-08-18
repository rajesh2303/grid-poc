import React from 'react';
import './layout.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="app-shell">
			<header className="app-topbar app-topbar__bg">
				<div className="container row">
					<div className="app-logo">io</div>
					<nav className="app-nav">
						<a href="#">Dashboard</a>
						<a className="active" href="#">Tickets</a>
						<a href="#">Brokers</a>
						<a href="#">Reports</a>
					</nav>
					<div className="spacer" />
					<div className="app-user">JD</div>
				</div>
			</header>

			<main className="container">
				{children}
			</main>
		</div>
	);
	
}


