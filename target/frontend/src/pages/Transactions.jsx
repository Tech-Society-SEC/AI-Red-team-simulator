import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { getProfile } from "../api/api";
import TransactionTable from "../components/TransactionTable";
import AddTransactionModal from "../components/AddTransactionModal";

export default function Transactions() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }
      setUser(user);
      
      try {
        const profileRes = await getProfile();
        setUserProfile(profileRes);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [navigate]);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowAddModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingTransaction(null);
  };

  const handleTransactionSuccess = () => {
    // The TransactionTable component will handle refreshing its own data
    setShowAddModal(false);
    setEditingTransaction(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">💰 My Transactions</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {userProfile?.profile?.full_name || userProfile?.profile?.username || user?.email}
              </span>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TransactionTable 
          onEdit={handleEditTransaction}
          onAdd={handleAddTransaction}
        />
      </div>

      {/* Add/Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        transaction={editingTransaction}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}
