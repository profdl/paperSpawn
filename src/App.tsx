import { AuthProvider } from './providers/AuthProvider';
import { QualityProvider } from './contexts/QualityContext';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <AuthProvider>
      <QualityProvider>
        <MainLayout />
      </QualityProvider>
    </AuthProvider>
  );
}

export default App;