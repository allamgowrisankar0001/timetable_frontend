import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { timetableAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

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

function calculateStreak(entries) {
  if (entries.length === 0) return 0;
  const todayName = getTodayName();
  let streak = 0;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = days.indexOf(todayName);
  for (let i = 0; i < 7; i++) {
    const checkIndex = (todayIndex - i + 7) % 7;
    const checkDay = days[checkIndex];
    const dayCompleted = entries.some(entry => entry.status[checkDay] === 'yes');
    if (dayCompleted) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActions: 0,
    completedToday: 0,
    skippedToday: 0,
    pendingToday: 0,
    totalCompleted: 0,
    totalSkipped: 0,
    totalPending: 0,
    weeklyProgress: {},
    streak: 0
  });
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayName = getTodayName();

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await timetableAPI.getEntries(user.uid);
      setEntries(data);
      calculateStats(data);
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalActions = data.length;
    const completedToday = data.filter(entry => entry.status[todayName] === 'yes').length;
    const skippedToday = data.filter(entry => entry.status[todayName] === 'no').length;
    const pendingToday = data.filter(entry => entry.status[todayName] === null).length;
    let totalCompleted = 0;
    let totalSkipped = 0;
    let totalPending = 0;
    const weeklyProgress = {};
    days.forEach(day => {
      const dayCompleted = data.filter(entry => entry.status[day] === 'yes').length;
      const daySkipped = data.filter(entry => entry.status[day] === 'no').length;
      const dayPending = data.filter(entry => entry.status[day] === null).length;
      totalCompleted += dayCompleted;
      totalSkipped += daySkipped;
      totalPending += dayPending;
      weeklyProgress[day] = {
        completed: dayCompleted,
        skipped: daySkipped,
        pending: dayPending,
        total: totalActions,
        percentage: totalActions > 0 ? Math.round((dayCompleted / totalActions) * 100) : 0
      };
    });
    const streak = calculateStreak(data);
    setStats({
      totalActions,
      completedToday,
      skippedToday,
      pendingToday,
      totalCompleted,
      totalSkipped,
      totalPending,
      weeklyProgress,
      streak
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('authToken');
      navigate('/');
    } catch (error) {}
  };

  const handleBackToTimetable = () => {
    navigate('/timetable');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-700 text-xl font-semibold">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Profile Dashboard</h1>
              <p className="text-gray-500 text-sm">Your progress overview</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={handleBackToTimetable} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm transition">
              <span className="mr-2">📅</span>Back to Timetable
            </button>
            <button onClick={handleLogout} className="bg-gray-200 hover:bg-red-100 text-red-600 font-semibold px-6 py-2 rounded-lg shadow-sm transition">
              <span className="mr-2">🚪</span>Logout
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto px-4 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex flex-col items-center">
            <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-full border border-gray-200 shadow" />
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-gray-900">{user.displayName}</h2>
              <p className="text-gray-500">{user.email}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-yellow-500 text-lg">🔥</span>
                <span className="text-gray-700 font-semibold">{stats.streak} Day Streak</span>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bg-blue-50 rounded-lg p-6 text-blue-700 text-center">
              <div className="text-2xl font-bold">{stats.totalCompleted}</div>
              <div className="text-sm opacity-90">Total Completed</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 text-gray-700 text-center">
              <div className="text-2xl font-bold">{stats.totalSkipped}</div>
              <div className="text-sm opacity-90">Total Skipped</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 text-gray-700 text-center">
              <div className="text-2xl font-bold">{stats.totalPending}</div>
              <div className="text-sm opacity-90">Total Pending</div>
            </div>
          </div>
        </div>
        {/* Today's Progress */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📈</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Today's Progress</h3>
              <p className="text-gray-500 text-sm">Your performance for {todayName}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 text-blue-700 text-center">
              <div className="text-xl font-bold">{stats.completedToday}</div>
              <div className="text-sm opacity-90">Completed</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 text-gray-700 text-center">
              <div className="text-xl font-bold">{stats.skippedToday}</div>
              <div className="text-sm opacity-90">Skipped</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 text-gray-700 text-center">
              <div className="text-xl font-bold">{stats.pendingToday}</div>
              <div className="text-sm opacity-90">Pending</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 text-blue-700 text-center">
              <div className="text-xl font-bold">{stats.totalActions}</div>
              <div className="text-sm opacity-90">Total Actions</div>
            </div>
          </div>
          {stats.totalActions > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">Completion Rate</span>
                <span className="text-gray-500">{Math.round((stats.completedToday / stats.totalActions) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div
                  className="h-4 bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.completedToday / stats.totalActions) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        {/* Weekly Progress */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📅</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Weekly Progress</h3>
              <p className="text-gray-500 text-sm">Your performance throughout the week</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {days.map(day => {
              const dayStats = stats.weeklyProgress[day];
              const isToday = day === todayName;
              return (
                <div key={day} className={`rounded-lg p-4 text-center ${isToday ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-800'}`}>
                  <div className="text-sm font-semibold mb-2">{day}</div>
                  <div className={`text-lg font-bold mb-1 ${isToday ? 'text-blue-700' : 'text-blue-600'}`}>{dayStats.completed}</div>
                  <div className="text-xs opacity-75 mb-2">Completed</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${isToday ? 'bg-blue-400' : 'bg-blue-200'}`}
                      style={{ width: `${dayStats.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs opacity-75">{dayStats.percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Action List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📋</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Your Actions</h3>
              <p className="text-gray-500 text-sm">All your tracked tasks and their status</p>
            </div>
          </div>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4 text-gray-300">📋</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">No actions yet</h4>
              <p className="text-gray-500 mb-6">Start adding actions to track your progress</p>
              <button
                onClick={handleBackToTimetable}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm transition"
              >
                <span className="mr-2">➕</span>Add Your First Action
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => {
                const todayStatus = entry.status[todayName];
                const totalCompleted = days.filter(day => entry.status[day] === 'yes').length;
                const totalSkipped = days.filter(day => entry.status[day] === 'no').length;
                const totalPending = days.filter(day => entry.status[day] === null).length;
                return (
                  <div key={entry._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 text-xl">📝</span>
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">{entry.action}</h4>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-blue-600">✔ {totalCompleted} completed</span>
                            <span className="text-xs text-red-600">✖ {totalSkipped} skipped</span>
                            <span className="text-xs text-gray-500">⏳ {totalPending} pending</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          todayStatus === 'yes' ? 'bg-blue-100 text-blue-700' :
                          todayStatus === 'no' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {todayStatus === 'yes' ? '✔ Completed' :
                           todayStatus === 'no' ? '✖ Skipped' : '⏳ Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile; 