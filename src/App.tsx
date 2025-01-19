import { AuthProvider } from './providers/AuthProvider';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <AuthProvider>
        <MainLayout />
    </AuthProvider>
  );
}

export default App;