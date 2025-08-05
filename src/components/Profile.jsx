import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { timetableAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Helper to get current week's Monday
function getCurrentWeekMonday() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Helper to get today's day name
function getTodayName() {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}

// Helper to calculate streak
function calculateStreak(entries) {
  if (entries.length === 0) return 0;
  
  const today = new Date();
  const todayName = getTodayName();
  let streak = 0;
  
  // Check if today has any completed tasks
  const todayCompleted = entries.some(entry => entry.status[todayName] === 'yes');
  if (todayCompleted) streak = 1;
  
  // Check previous days
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = days.indexOf(todayName);
  
  for (let i = 1; i <= 7; i++) {
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
      console.error('Error loading profile data:', error);
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
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBackToTimetable = () => {
    navigate('/timetable');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        <div className="text-slate-600 text-xl font-semibold">Loading Profile...</div>
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
                <span className="text-white text-2xl">👤</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent">
                  Profile Dashboard
                </h1>
                <p className="text-slate-600 text-sm font-medium">Your progress overview</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToTimetable}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-indigo-400"
              >
                <span className="mr-2">📅</span>
                Back to Timetable
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="flex flex-col items-center">
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-white/50 shadow-xl"
              />
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-slate-800">{user.displayName}</h2>
                <p className="text-slate-600">{user.email}</p>
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <span className="text-yellow-500 text-xl">🔥</span>
                  <span className="text-slate-700 font-semibold">{stats.streak} Day Streak</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 text-white text-center">
                <div className="text-3xl font-bold">{stats.totalCompleted}</div>
                <div className="text-sm opacity-90">Total Completed</div>
              </div>
              <div className="bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl p-6 text-white text-center">
                <div className="text-3xl font-bold">{stats.totalSkipped}</div>
                <div className="text-sm opacity-90">Total Skipped</div>
              </div>
              <div className="bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl p-6 text-white text-center">
                <div className="text-3xl font-bold">{stats.totalPending}</div>
                <div className="text-sm opacity-90">Total Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Today's Progress</h3>
              <p className="text-slate-600">Your performance for {todayName}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 text-white text-center">
              <div className="text-4xl font-bold">{stats.completedToday}</div>
              <div className="text-sm opacity-90">Completed</div>
            </div>
            <div className="bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl p-6 text-white text-center">
              <div className="text-4xl font-bold">{stats.skippedToday}</div>
              <div className="text-sm opacity-90">Skipped</div>
            </div>
            <div className="bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl p-6 text-white text-center">
              <div className="text-4xl font-bold">{stats.pendingToday}</div>
              <div className="text-sm opacity-90">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl p-6 text-white text-center">
              <div className="text-4xl font-bold">{stats.totalActions}</div>
              <div className="text-sm opacity-90">Total Actions</div>
            </div>
          </div>
          
          {stats.totalActions > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-700 font-semibold">Completion Rate</span>
                <span className="text-slate-600">
                  {Math.round((stats.completedToday / stats.totalActions) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4">
                <div 
                  className="h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.completedToday / stats.totalActions) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Progress */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">📅</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Weekly Progress</h3>
              <p className="text-slate-600">Your performance throughout the week</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {days.map(day => {
              const dayStats = stats.weeklyProgress[day];
              const isToday = day === todayName;
              
              return (
                <div key={day} className={`rounded-2xl p-4 text-center ${isToday ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-white/50 text-slate-800'}`}>
                  <div className="text-sm font-semibold mb-2">{day}</div>
                  <div className={`text-2xl font-bold mb-1 ${isToday ? 'text-white' : 'text-emerald-600'}`}>
                    {dayStats.completed}
                  </div>
                  <div className="text-xs opacity-75 mb-2">Completed</div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isToday ? 'bg-white' : 'bg-emerald-500'
                      }`}
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
        <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">📋</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Your Actions</h3>
              <p className="text-slate-600">All your tracked tasks and their status</p>
            </div>
          </div>
          
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-slate-400">📋</div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">No actions yet</h4>
              <p className="text-slate-600 mb-6">Start adding actions to track your progress</p>
              <button
                onClick={handleBackToTimetable}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="mr-2">➕</span>
                Add Your First Action
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
                  <div key={entry._id} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-xl">📝</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800">{entry.action}</h4>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-emerald-600">✅ {totalCompleted} completed</span>
                            <span className="text-sm text-rose-600">❌ {totalSkipped} skipped</span>
                            <span className="text-sm text-slate-600">⏳ {totalPending} pending</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          todayStatus === 'yes' ? 'bg-emerald-100 text-emerald-800' :
                          todayStatus === 'no' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {todayStatus === 'yes' ? '✅ Completed' :
                           todayStatus === 'no' ? '❌ Skipped' : '⏳ Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 