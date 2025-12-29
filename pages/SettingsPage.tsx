import React, { useContext, useState } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = () => {
    auth?.logout();
    navigate('/');
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account and preferences.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Security</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                disabled value={auth?.user?.email} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
            <button className="text-indigo-600 font-bold hover:underline">Change Password →</button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
          <p className="text-slate-500 text-sm mb-6">Deleting your account is permanent and cannot be undone. All your goals, profile data, and plan history will be erased from local storage.</p>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Are you absolutely sure?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              This action will permanently delete your FinPlanner account and all associated data.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SettingsPage;