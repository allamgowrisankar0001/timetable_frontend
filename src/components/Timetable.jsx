import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { timetableAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AddActionModal from './AddActionModal';

// Helper to get current week's Monday
function getCurrentWeekMonday() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Helper to get today's day name
function getTodayName() {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}

// Helper to get task category icon
function getTaskIcon(action) {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes('read') || lowerAction.includes('study') || lowerAction.includes('book')) return '📚';
  if (lowerAction.includes('workout') || lowerAction.includes('exercise') || lowerAction.includes('gym')) return '🏃';
  if (lowerAction.includes('code') || lowerAction.includes('program') || lowerAction.includes('develop')) return '💻';
  if (lowerAction.includes('sleep') || lowerAction.includes('wake') || lowerAction.includes('bed')) return '😴';
  if (lowerAction.includes('eat') || lowerAction.includes('meal') || lowerAction.includes('food')) return '🍽️';
  if (lowerAction.includes('work') || lowerAction.includes('meeting') || lowerAction.includes('project')) return '💼';
  if (lowerAction.includes('meditate') || lowerAction.includes('yoga') || lowerAction.includes('mindful')) return '🧘';
  return '📝';
}

// Helper to calculate daily progress
function calculateDailyProgress(entries, day) {
  if (entries.length === 0) return 0;
  const completed = entries.filter(entry => entry.status[day] === 'yes').length;
  return Math.round((completed / entries.length) * 100);
}

const Timetable = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [backendAvailable, setBackendAvailable] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayName = getTodayName();

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await timetableAPI.getEntries(user.uid);
      setEntries(data);
      setBackendAvailable(true);
    } catch (error) {
      console.error('Error loading entries:', error);
      setError('Backend not available. Running in offline mode.');
      setBackendAvailable(false);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = async (actionName) => {
    try {
      const newEntry = {
        userId: user.uid,
        action: actionName,
        weekStart: getCurrentWeekMonday(),
        status: {
          Monday: null,
          Tuesday: null,
          Wednesday: null,
          Thursday: null,
          Friday: null,
          Saturday: null,
          Sunday: null
        }
      };

      if (backendAvailable) {
        const savedEntry = await timetableAPI.addEntry(newEntry);
        setEntries([...entries, savedEntry]);
      } else {
        // Create local entry with temporary ID
        const localEntry = {
          ...newEntry,
          _id: `local_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        setEntries([...entries, localEntry]);
      }
      
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding action:', error);
      setError('Failed to add action');
    }
  };

  const handleStatusUpdate = async (entryId, day, status) => {
    try {
      // Only allow update for today
      if (day !== todayName) return;
      const entry = entries.find(e => e._id === entryId);
      const updatedStatus = { ...entry.status, [day]: status };
      
      if (backendAvailable && !entryId.startsWith('local_')) {
        await timetableAPI.updateEntry(entryId, { status: updatedStatus });
      }
      
      setEntries(entries.map(e => 
        e._id === entryId 
          ? { ...e, status: updatedStatus }
          : e
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  const handleDeleteAction = async (entryId) => {
    try {
      if (backendAvailable && !entryId.startsWith('local_')) {
        await timetableAPI.deleteEntry(entryId);
      }
      setEntries(entries.filter(e => e._id !== entryId));
    } catch (error) {
      console.error('Error deleting action:', error);
      setError('Failed to delete action');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const renderStatusButtons = (entry, day) => {
    const status = entry.status[day];
    const isToday = day === todayName;
    const isDisabled = !isToday || status !== null;
    
    if (status === null) {
      return (
        <div className="flex space-x-3 justify-center my-2">
          <button
            onClick={() => handleStatusUpdate(entry._id, day, 'yes')}
            className={`px-4 py-2 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg border border-emerald-300 transition-all duration-300 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl transform hover:scale-105'}`}
            disabled={isDisabled}
          >
            ✓ Yes
          </button>
          <button
            onClick={() => handleStatusUpdate(entry._id, day, 'no')}
            className={`px-4 py-2 bg-gradient-to-br from-rose-400 to-rose-600 text-white text-sm font-semibold rounded-xl shadow-lg border border-rose-300 transition-all duration-300 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl transform hover:scale-105'}`}
            disabled={isDisabled}
          >
            ✗ No
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex justify-center my-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
          status === 'yes' 
            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' 
            : 'bg-gradient-to-br from-rose-400 to-rose-600'
        }`}>
          <span className="text-white text-xl font-bold">
            {status === 'yes' ? '✓' : '✗'}
          </span>
        </div>
      </div>
    );
  };

  const renderProgressBar = (day) => {
    const progress = calculateDailyProgress(entries, day);
    const isToday = day === todayName;
    
    return (
      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            isToday ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-400'
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  const todayProgress = calculateDailyProgress(entries, todayName);
  const totalActions = entries.length;
  const completedToday = entries.filter(entry => entry.status[todayName] === 'yes').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        <div className="text-slate-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">📅</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent">
                  Timetable Tracker
                </h1>
                <p className="text-slate-600 text-sm font-medium">Manage your daily tasks</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {user && (
                <div className="flex items-center space-x-4 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-white/30">
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border-2 border-white/50 shadow-md"
                  />
                  <div>
                    <p className="text-slate-800 font-semibold text-sm">{user.displayName}</p>
                    <p className="text-slate-500 text-xs">Active User</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleProfileClick}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-indigo-400"
              >
                <span className="mr-2">👤</span>
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-slate-500"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {totalActions > 0 && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Today's Progress</h3>
                  <p className="text-slate-600 text-sm">Keep up the great work!</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{completedToday}</div>
                  <div className="text-sm text-slate-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{totalActions}</div>
                  <div className="text-sm text-slate-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{todayProgress}%</div>
                  <div className="text-sm text-slate-600">Progress</div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${todayProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-gradient-to-r from-amber-400 to-orange-500 border border-amber-300 text-white px-6 py-4 rounded-2xl shadow-xl backdrop-blur-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {!backendAvailable && (
          <div className="mb-8 bg-gradient-to-r from-blue-400 to-indigo-500 border border-blue-300 text-white px-6 py-4 rounded-2xl shadow-xl backdrop-blur-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🌐</span>
              <span className="font-semibold">Running in offline mode. Data will not be saved to the server.</span>
            </div>
          </div>
        )}

        {/* Add Action Button */}
        <div className="mb-12 flex justify-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border border-indigo-400"
          >
            <span className="text-2xl mr-3">➕</span>
            Add New Action
          </button>
        </div>

        {/* Timetable Container - Fixed Width */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gradient-to-r from-slate-700 to-slate-800">
                  <th className="w-1/4 px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider border-b border-slate-600">
                    <span className="flex items-center">
                      <span className="mr-2">📝</span>
                      Action
                    </span>
                  </th>
                  {days.map(day => (
                    <th key={day} className={`w-1/12 px-6 py-6 text-center text-sm font-bold uppercase tracking-wider border-b border-slate-600 ${day === todayName ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white relative' : 'text-white'}`}>
                      {day === todayName && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                      )}
                      <div className="text-xs mb-2">{day}</div>
                      {renderProgressBar(day)}
                      <div className="text-xs opacity-75">{calculateDailyProgress(entries, day)}%</div>
                    </th>
                  ))}
                  <th className="w-1/12 px-6 py-6 text-center text-sm font-bold text-white uppercase tracking-wider border-b border-slate-600">
                    <span className="flex items-center justify-center">
                      <span className="mr-2">⚙️</span>
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/40 backdrop-blur-sm">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-8 py-20 text-center">
                      <div className="text-8xl mb-6 text-slate-400">📋</div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4">No actions added yet</h3>
                      <p className="text-slate-600 text-lg mb-6">Start tracking your daily tasks by adding your first action</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                      >
                        <span className="mr-3">➕</span>
                        Add Your First Action
                      </button>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, index) => (
                    <tr key={entry._id} className="hover:bg-white/60 transition-all duration-300 border-b border-white/20">
                      <td className="px-8 py-6 text-base font-semibold text-slate-800">
                        <div className="my-2 mx-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getTaskIcon(entry.action)}</span>
                            <div>
                              <div className="font-semibold">{entry.action}</div>
                              <div className="text-xs text-slate-500 mt-1">
                                {entry.status[todayName] === 'yes' ? '✅ Completed today' : 
                                 entry.status[todayName] === 'no' ? '❌ Skipped today' : 
                                 todayName === 'Monday' ? '📅 New week starts' : '⏳ Pending'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      {days.map(day => (
                        <td key={day} className="px-6 py-6 text-sm text-slate-700">
                          {renderStatusButtons(entry, day)}
                        </td>
                      ))}
                      <td className="px-6 py-6 text-center">
                        <div className="my-2">
                          <button
                            onClick={() => handleDeleteAction(entry._id)}
                            className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 border border-red-300 flex items-center justify-center"
                            title="Delete action"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Action Modal */}
      {showAddModal && (
        <AddActionModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAction}
        />
      )}
    </div>
  );
};

export default Timetable; 