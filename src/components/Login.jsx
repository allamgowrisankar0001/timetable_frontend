import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      let user;
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
      }

      try {
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.email.split('@')[0],
          photoURL: user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email)
        };
        await userAPI.saveUser(userData);
      } catch (backendError) {
        console.warn('Backend not available, continuing with frontend only:', backendError);
      }

      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      navigate('/timetable');
    } catch (error) {
      console.error('Auth error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError('Failed to authenticate. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      const user = await signInWithGoogle();
      
      try {
        const userData = {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        };
        
        await userAPI.saveUser(userData);
      } catch (backendError) {
        console.warn('Backend not available, continuing with frontend only:', backendError);
      }
      
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      navigate('/timetable');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups for this site and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please contact support.');
      } else {
        setError('Failed to sign in. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Timetable Tracker Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Timetable Tracker™</h1>
          <p className="text-xl text-gray-600 mb-8">Efficient Schedule Management</p>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">You will be using one of our core applications:</h2>
              <p className="text-gray-600">Timetable Tracker™ helps you organize your daily schedule efficiently.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">What to Expect?</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Easy schedule management</li>
                <li>Real-time updates</li>
                <li>Cross-platform synchronization</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Other Future Applications</h2>
              <p className="text-gray-600">Stay tuned for more productivity tools coming soon.</p>
            </div>
          </div>
        </div>
        
        <div className="text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Timetable Tracker™. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            {isLogin ? 'Log In to Timetable Tracker™' : 'Create an Account'}
          </h2>
          <p className="text-gray-600 mb-8">
            {isLogin ? 'Manage your schedule efficiently' : 'Get started with your account'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-red-700">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Your Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Your Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember
                  </label>
                </div>

                <div className="text-sm">
                  <button type="button" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgotten?
                  </button>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Logging in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Log in' : 'Create account'
                )}
              </button>
            </div>
          </form>

          {isLogin && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? (
                <>
                  Don't have an account? <span className="font-semibold">Sign Up</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="font-semibold">Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;