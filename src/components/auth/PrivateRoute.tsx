import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 relative animate-pulse" style={{
            filter: 'drop-shadow(0 0 30px rgba(166, 124, 82, 0.5))',
            border: '3px solid rgba(166, 124, 82, 0.6)',
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(166, 124, 82, 0.4), inset 0 0 20px rgba(166, 124, 82, 0.1)',
            padding: '8px',
            background: 'rgba(0, 0, 0, 0.3)'
          }}>
            <img
              src="/a_mystical_and_adorable_shrine_mascot_character_de-1767804824217.png"
              alt="神社のマスコット"
              className="w-full h-full object-contain"
              style={{ borderRadius: '50%' }}
            />
          </div>
          <p className="text-lg glow-text" style={{ color: 'var(--pale-gold)' }}>
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
