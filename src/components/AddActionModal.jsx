import React, { useState } from 'react';

const AddActionModal = ({ onClose, onAdd }) => {
  const [actionName, setActionName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!actionName.trim()) {
      return;
    }

    try {
      setLoading(true);
      await onAdd(actionName.trim());
      setActionName('');
    } catch (error) {
      console.error('Error adding action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">➕</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent">
                Add New Action
              </h3>
              <p className="text-slate-600 text-sm">Create a new task to track</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="actionName" className="block text-sm font-semibold text-slate-700 mb-3">
              Action Name
            </label>
            <input
              type="text"
              id="actionName"
              value={actionName}
              onChange={(e) => setActionName(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-300 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              placeholder="e.g., Wake up at 6am"
              required
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-slate-400 to-slate-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !actionName.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Adding...
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="mr-2">✓</span>
                  Add Action
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActionModal; 