import React from "react";

const analytics = [
  {
    label: "Total Orders",
    value: 1280,
    icon: (
      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
    ),
  },
  {
    label: "Active Users",
    value: 342,
    icon: (
      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    ),
  },
  {
    label: "Revenue",
      value: "₹24,500",
    icon: (
      <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8" /></svg>
    ),
  },
  {
    label: "Deliveries",
    value: 97,
    icon: (
      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4a4 4 0 014 4v2M9 17H7a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4h-2" /></svg>
    ),
  },
];

const AnalyticsWidgets = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {analytics.map((a) => (
        <div key={a.label} className="bg-gray-900 rounded-xl p-6 flex items-center gap-4 shadow border border-gray-700">
          <div className="bg-gray-800 p-3 rounded-full flex items-center justify-center">
            {a.icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-100">{a.value}</div>
            <div className="text-gray-400 text-sm">{a.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsWidgets; 