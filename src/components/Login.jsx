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
      } catch {}
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      navigate('/timetable');
    } catch (error) {
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
      } catch {}
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      navigate('/timetable');
    } catch (error) {
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
    <div className="fixed inset-0 flex bg-gray-50 overflow-hidden font-inter">
      {/* Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex-col justify-center px-16 py-20 shadow-2xl shadow-blue-900/30">
        <div className="max-w-lg">
          <div className="flex items-center mb-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-5 shadow-lg shadow-blue-200/30">
              <span className="text-white text-3xl">📅</span>
            </div>
            <h1 className="text-4xl font-extrabold font-poppins tracking-tight text-white drop-shadow-lg">Timetable Tracker</h1>
          </div>
          
          <h2 className="text-5xl font-black font-poppins text-white mb-8 leading-tight tracking-tight drop-shadow-xl">
            Master Your Time,<br />
            <span className="text-blue-200">Achieve Your Goals</span>
          </h2>
          
          <p className="text-2xl font-medium text-blue-100 mb-10 leading-relaxed font-inter tracking-wide">
            Transform your productivity with our intelligent timetable management system. 
            Track your daily activities, monitor progress, and stay organized like never before.
          </p>
          
          <div className="space-y-5">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center mr-4 shadow shadow-blue-200/30">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white text-xl font-semibold font-inter tracking-wide">Smart scheduling and reminders</span>
            </div>
            <div className="flex items-center">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center mr-4 shadow shadow-blue-200/30">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white text-xl font-semibold font-inter tracking-wide">Progress tracking and analytics</span>
            </div>
            <div className="flex items-center">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center mr-4 shadow shadow-blue-200/30">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white text-xl font-semibold font-inter tracking-wide">Secure cloud synchronization</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Card Section */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-blue-200/40 border border-gray-200 p-10 flex flex-col items-center justify-center max-h-[90vh] overflow-y-auto font-inter">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow shadow-blue-200/40">
              <span className="text-blue-600 text-3xl">📅</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold font-poppins text-gray-900 mb-2 tracking-tight">{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <p className="text-lg text-gray-500 mb-8 font-inter tracking-wide">{isLogin ? 'Sign in to your Timetable Tracker account' : 'Start your productivity journey today'}</p>
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-base text-center w-full font-inter shadow shadow-red-100">{error}</div>
          )}
          <form onSubmit={handleEmailAuth} className="space-y-6 w-full">
            <div>
              <label htmlFor="email" className="block text-base font-semibold font-poppins text-gray-700 mb-2 tracking-wide">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-base font-inter tracking-wide"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-base font-semibold font-poppins text-gray-700 mb-2 tracking-wide">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-base font-inter tracking-wide"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-8 border border-transparent rounded-xl shadow-lg shadow-blue-200/40 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold font-poppins text-lg tracking-wide transition-all duration-150"
            >
              {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
          <div className="mt-6 w-full">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-8 border border-gray-200 rounded-xl shadow shadow-blue-100 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold font-inter text-base tracking-wide transition-all duration-150"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
          <div className="mt-6 text-center w-full">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-base font-semibold font-poppins text-blue-600 hover:text-blue-700 active:text-blue-800 transition-all duration-150 tracking-wide"
            >
              {isLogin ? (
                <>Don't have an account? <span className="font-bold">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-bold">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;