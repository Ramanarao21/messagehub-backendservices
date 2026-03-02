import { useState } from 'react';
import Button from '../sharedComponents/Button';
import Input from '../sharedComponents/Input';
import Dashboard from './Dashboard';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../lib/toast';
import girlProfile from '../assets/girlprofile.jpg';
import youngBoy from '../assets/youngboy.jpg';
import youngWomen from '../assets/youngwomen.jpg';

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  const { 
    user, 
    isAuthenticated, 
    login, 
    register,
    isLoggingIn, 
    isRegistering,
  } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        showToast.success('Login successful! Welcome back.');
      } else {
        await register({ 
          username: formData.username, 
          email: formData.email, 
          password: formData.password 
        });
        showToast.success('Registration successful! Welcome to MessageHub.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      showToast.error(
        error instanceof Error ? error.message : 'Authentication failed. Please try again.'
      );
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const isLoading = isLoggingIn || isRegistering;

  // Show authenticated view
  if (isAuthenticated && user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
      <div className="flex gap-12 max-w-7xl w-full items-center">
        
        {/* Left Side - Auth Form */}
        <div className="flex-1 max-w-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.68-.29-3.86-.81l-.28-.13-2.82.48.48-2.82-.13-.28C4.89 14.68 4.6 13.38 4.6 12c0-4.08 3.32-7.4 7.4-7.4s7.4 3.32 7.4 7.4-3.32 7.4-7.4 7.4z"/>
              </svg>
            </div>
            <span className="text-3xl font-bold text-slate-800">MessageHub</span>
          </div>
          
          {/* Title */}
          <h1 className="text-6xl font-bold text-slate-900 leading-tight mb-6">
            Flowing<br />
            Communication<br />
            for Modern Teams
          </h1>
          
          {/* Description */}
          <p className="text-lg text-slate-500 mb-12 leading-relaxed">
            Connect, collaborate, and succeed with our secure, unified platform.
          </p>

          {/* Tabs */}
          <div className="flex gap-8 mb-8">
            <button 
              className={`pb-3 text-lg font-semibold transition-all border-b-3 ${
                isLogin 
                  ? 'text-teal-700 border-teal-700' 
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button 
              className={`pb-3 text-lg font-semibold transition-all border-b-3 ${
                !isLogin 
                  ? 'text-teal-700 border-teal-700' 
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-12">
            <div className={`transition-all duration-300 overflow-hidden ${!isLogin ? 'max-h-32 opacity-100 mb-0' : 'max-h-0 opacity-0 mb-0'}`}>
              <Input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange('username')}
                disabled={isLoading}
              />
            </div>
            
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={isLoading}
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange('password')}
              disabled={isLoading}
            />

            <div className="flex gap-4 mt-8">
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
              <Button variant="outline" size="lg" disabled={isLoading}>
                Request Demo
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side - Illustration/Image */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-xl">
            {/* Main Illustration Container */}
            <div className="relative">
              {/* Background Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full opacity-30 blur-3xl"></div>
              
              {/* Chat Bubbles Illustration */}
              <div className="relative z-10 space-y-6">
                {/* Chat Bubble 1 */}
                <div className="flex justify-start animate-float">
                  <div className="bg-white rounded-3xl rounded-bl-sm shadow-lg p-6 max-w-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={youngWomen} 
                        alt="Sarah Johnson" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">Sarah Johnson</p>
                        <p className="text-xs text-slate-500">2 min ago</p>
                      </div>
                    </div>
                    <p className="text-slate-600">Hey team! The new feature is ready for review 🚀</p>
                  </div>
                </div>

                {/* Chat Bubble 2 */}
                <div className="flex justify-end animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="bg-teal-700 rounded-3xl rounded-br-sm shadow-lg p-6 max-w-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={youngBoy} 
                        alt="Mike Chen" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-white">Mike Chen</p>
                        <p className="text-xs text-teal-200">Just now</p>
                      </div>
                    </div>
                    <p className="text-white">Awesome! Let me check it out right away 👍</p>
                  </div>
                </div>

                {/* Chat Bubble 3 */}
                <div className="flex justify-start animate-float" style={{ animationDelay: '1s' }}>
                  <div className="bg-white rounded-3xl rounded-bl-sm shadow-lg p-6 max-w-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={girlProfile} 
                        alt="Emma Davis" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">Emma Davis</p>
                        <p className="text-xs text-slate-500">1 min ago</p>
                      </div>
                    </div>
                    <p className="text-slate-600">Great work everyone! 🎉</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 right-10 w-16 h-16 bg-teal-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute bottom-20 left-10 w-12 h-12 bg-orange-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '0.7s' }}></div>
              <div className="absolute top-1/2 right-0 w-8 h-8 bg-teal-600 rounded-full opacity-20 animate-float" style={{ animationDelay: '1.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
