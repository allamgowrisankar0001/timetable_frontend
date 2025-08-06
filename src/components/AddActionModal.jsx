import React, { useState } from 'react';

const AddActionModal = ({ onClose, onAdd }) => {
  const [actionName, setActionName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actionName.trim()) return;
    try {
      setLoading(true);
      await onAdd(actionName.trim());
      setActionName('');
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">➕</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Add New Action</h3>
              <p className="text-gray-500 text-sm">Create a new task to track</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="actionName" className="block text-sm font-semibold text-gray-700 mb-2">Action Name</label>
            <input
              type="text"
              id="actionName"
              value={actionName}
              onChange={(e) => setActionName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="e.g., Wake up at 6am"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !actionName.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActionModal; 