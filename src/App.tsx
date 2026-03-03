import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { queryClient } from './lib/queryClient';
import LandingPage from './components/LandingPage';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LandingPage />
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default App;