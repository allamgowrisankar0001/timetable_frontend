import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { timetableAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AddActionModal from './AddActionModal';

function getCurrentWeekMonday() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getTodayName() {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}

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
        const localEntry = {
          ...newEntry,
          _id: `local_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        setEntries([...entries, localEntry]);
      }
      setShowAddModal(false);
    } catch (error) {
      setError('Failed to add action');
    }
  };

  const handleStatusUpdate = async (entryId, day, status) => {
    try {
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
      setError('Failed to delete action');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('authToken');
    } catch (error) {}
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
        <div className="flex space-x-2 justify-center my-2">
          <button
            onClick={() => handleStatusUpdate(entry._id, day, 'yes')}
            className={`px-3 py-2 bg-blue-600 text-white text-base font-semibold rounded-md shadow-sm border border-blue-500 transition ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={isDisabled}
          >
            ✓
          </button>
          <button
            onClick={() => handleStatusUpdate(entry._id, day, 'no')}
            className={`px-3 py-2 bg-gray-300 text-gray-700 text-base font-semibold rounded-md shadow-sm border border-gray-400 transition ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-400'}`}
            disabled={isDisabled}
          >
            ✗
          </button>
        </div>
      );
    }
    return (
      <div className="flex justify-center my-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border ${
          status === 'yes'
            ? 'bg-blue-600 border-blue-500 text-white'
            : 'bg-gray-300 border-gray-400 text-gray-700'
        }`}>
          {status === 'yes' ? '✓' : '✗'}
        </div>
      </div>
    );
  };

  const renderProgressBar = (day) => {
    const progress = calculateDailyProgress(entries, day);
    const isToday = day === todayName;
    return (
      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
        <div
          className={`h-2 rounded-full ${isToday ? 'bg-blue-200' : 'bg-gray-200'}`}
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-gray-700 text-2xl font-bold mb-2">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 text-2xl">📅</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Timetable Tracker</h1>
              <p className="text-gray-500 text-sm">Stay on track with your daily goals</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {user && (
              <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-xl">
                <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-300" />
                <span className="font-semibold text-gray-800">{user.displayName || 'Demo User'}</span>
              </div>
            )}
            <button onClick={handleProfileClick} className="text-gray-700 font-medium hover:text-blue-600 transition">Profile</button>
            <button onClick={handleLogout} className="text-gray-700 font-medium hover:text-blue-600 transition">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-3 rounded-lg shadow-sm transition"
          >
            + Add New Action
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-base font-semibold text-gray-800">Action</th>
                {days.map(day => (
                  <th
                    key={day}
                    className={`px-4 py-4 text-center text-base font-semibold ${day === todayName ? 'text-blue-700 bg-blue-50' : 'text-gray-800'}`}
                  >
                    <div>{day}</div>
                    {renderProgressBar(day)}
                    <div className="text-xs font-medium text-gray-500">{calculateDailyProgress(entries, day)}%</div>
                  </th>
                ))}
                <th className="px-4 py-4 text-center text-base font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-7xl mb-4">📋</span>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No actions added yet</h3>
                      <p className="text-gray-500 mb-6">Start tracking your daily tasks by adding your first action</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition"
                      >
                        + Add Your First Action
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => (
                  <tr key={entry._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-base font-medium text-gray-900">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTaskIcon(entry.action)}</span>
                        <span>{entry.action}</span>
                      </div>
                    </td>
                    {days.map(day => (
                      <td key={day} className="px-4 py-4 text-center">
                        {renderStatusButtons(entry, day)}
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDeleteAction(entry._id)}
                        className="w-8 h-8 bg-gray-200 hover:bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto transition"
                        title="Delete action"
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
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