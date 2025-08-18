import './theme/global.css';
import AppLayout from './layout/AppLayout';
import TicketsPage from './pages/TicketsPage';

const App = () => {
	return (
		<AppLayout>
			<TicketsPage />
		</AppLayout>
	);
};

export default App;
