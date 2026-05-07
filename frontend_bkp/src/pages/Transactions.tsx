import React from 'react';

const Transactions: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transactions</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Transaction history will be displayed here.</p>
      </div>
    </div>
  );
};

export default Transactions;
