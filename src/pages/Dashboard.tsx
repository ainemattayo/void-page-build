
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const { user, getUserRole, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      getUserRole().then(role => {
        setUserRole(role);
        
        // Redirect based on user role
        switch (role) {
          case 'founder':
            navigate('/founder-dashboard');
            break;
          case 'advisor':
            navigate('/advisor-dashboard');
            break;
          case 'admin':
          case 'coordinator':
            navigate('/admin-dashboard');
            break;
          default:
            // User exists but no role assigned - they need approval
            navigate('/pending-approval');
            break;
        }
      });
    }
  }, [user, loading, getUserRole, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
