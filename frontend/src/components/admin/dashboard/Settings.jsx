import React from "react";

const Settings = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <p className="text-gray-300 mb-4">Platform settings and admin controls will be implemented here.</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded">
            <span className="text-gray-300">Email Notifications</span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Configure</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded">
            <span className="text-gray-300">System Maintenance</span>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Schedule</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded">
            <span className="text-gray-300">Backup & Recovery</span>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Backup Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 