import React, { useState, useEffect } from 'react';
import { getTransactions, deleteTransaction } from '../api/api';
import { Button, Input, Label } from '../components/ui';
import { Edit, Trash2, Plus, Search, Filter, Calendar } from 'lucide-react';

const TransactionTable = ({ onEdit, onAdd }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    category: '',
    type: '',
    merchant: '',
    search: '',
    page: 1,
    page_size: 25
  });
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransactions(filters);
      setTransactions(response.transactions || []);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await deleteTransaction(transactionId);
      loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeColor = (type) => {
    return type === 'credit' ? 'text-success-400' : 'text-error-400';
  };

  const getTypeBadge = (type) => {
    return type === 'credit' ? 'bg-success-500/20 text-success-400 border border-success-500/30' : 'bg-error-500/20 text-error-400 border border-error-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-100">Filter Transactions</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Category</Label>
            <Input
              type="text"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              placeholder="Filter by category"
            />
          </div>
          <div>
            <Label>Type</Label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 backdrop-blur-sm"
            >
              <option value="">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Merchant</Label>
            <Input
              type="text"
              value={filters.merchant}
              onChange={(e) => handleFilterChange('merchant', e.target.value)}
              placeholder="Filter by merchant"
            />
          </div>
          <div>
            <Label>Search</Label>
            <Input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search in descriptions"
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={onAdd}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Transaction
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              Showing {transactions.length} of {totalCount} transactions
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-300">Loading transactions...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-300">No transactions found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-800/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Merchant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(transaction.txn_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.merchant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getTypeColor(transaction.type)}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => onEdit(transaction)}
                          variant="ghost"
                          size="sm"
                          icon={<Edit className="w-4 h-4" />}
                        />
                        <Button
                          onClick={() => handleDelete(transaction.id)}
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-error-400 hover:text-error-300"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > filters.page_size && (
        <div className="flex justify-center items-center space-x-4">
          <Button
            onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
            variant="secondary"
          >
            Previous
          </Button>
          <span className="text-gray-300">
            Page {filters.page} of {Math.ceil(totalCount / filters.page_size)}
          </span>
          <Button
            onClick={() => handleFilterChange('page', Math.min(Math.ceil(totalCount / filters.page_size), filters.page + 1))}
            disabled={filters.page >= Math.ceil(totalCount / filters.page_size)}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;