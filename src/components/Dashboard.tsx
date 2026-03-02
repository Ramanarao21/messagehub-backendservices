import { useAuth } from '../hooks/useAuth';
import Button from '../sharedComponents/Button';

const Dashboard = () => {
  const { user, logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-700 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white font-bold">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Welcome, {user?.username}!
                </h1>
                <p className="text-slate-500">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Profile</h3>
            <p className="text-slate-600 mb-4">Manage your account settings and preferences</p>
            <Button variant="primary" size="sm">View Profile</Button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Messages</h3>
            <p className="text-slate-600 mb-4">Check your recent conversations</p>
            <Button variant="primary" size="sm">Open Chat</Button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Settings</h3>
            <p className="text-slate-600 mb-4">Configure your application preferences</p>
            <Button variant="primary" size="sm">Manage</Button>
          </div>
        </div>

        {/* Status Card */}
        <div className="mt-8 bg-gradient-to-r from-teal-700 to-teal-600 rounded-3xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🎉 Authentication Active</h2>
              <p className="text-teal-100">Your session is secure and your token is valid</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
              <p className="text-sm text-teal-100">User ID</p>
              <p className="font-mono font-bold">{user?.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
