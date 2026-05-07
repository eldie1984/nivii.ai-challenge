import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const APEX_EMAIL = 'demo@example.com';

export function seedApexAuth() {
  const users = JSON.parse(localStorage.getItem('apex_users') || '{}');
  if (!users[APEX_EMAIL]) {
    users[APEX_EMAIL] = { email: APEX_EMAIL, name: 'Demo User', pw: '' };
    localStorage.setItem('apex_users', JSON.stringify(users));
  }
  localStorage.setItem('apex_session', JSON.stringify({ email: APEX_EMAIL, ts: Date.now() }));
}

const Dashboard: React.FC = () => {
  useEffect(() => { seedApexAuth(); }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Portfolio Value</h3>
          <p className="text-2xl font-bold text-green-600">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">24h Change</h3>
          <p className="text-2xl font-bold text-gray-600">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Assets</h3>
          <p className="text-2xl font-bold text-gray-600">0</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Access</h3>
          <div className="flex flex-col gap-3">
            <Link to="/portfolio" className="text-left px-4 py-3 rounded bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="font-semibold text-blue-700">APEX Portfolio</div>
              <div className="text-sm text-gray-500">View holdings, allocation, and P&amp;L</div>
            </Link>
            <Link to="/terminal" className="text-left px-4 py-3 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors">
              <div className="font-semibold text-emerald-700">APEX Terminal</div>
              <div className="text-sm text-gray-500">Trade with AI-powered analysis</div>
            </Link>
            <Link to="/preferences" className="text-left px-4 py-3 rounded bg-purple-50 hover:bg-purple-100 transition-colors">
              <div className="font-semibold text-purple-700">Preferences</div>
              <div className="text-sm text-gray-500">Profile, trading defaults, notifications</div>
            </Link>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-gray-400 text-sm">No recent activity</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
