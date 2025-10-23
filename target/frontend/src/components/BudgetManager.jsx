import React, { useState, useEffect } from 'react';
import { getBudgets, createBudget, updateBudget, deleteBudget, recomputeBudgets, getCategories } from '../api/api';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label, Select, FormField } from '../components/ui';
import { Plus, Edit, Trash2, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    limit_amount: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetsRes, categoriesRes] = await Promise.all([
        getBudgets(),
        getCategories()
      ]);
      setBudgets(budgetsRes.budgets || []);
      setCategories(categoriesRes.categories || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, formData);
      } else {
        await createBudget(formData);
      }
      await loadData();
      setShowAddModal(false);
      setEditingBudget(null);
      setFormData({
        category_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        limit_amount: ''
      });
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category_id: budget.category_id,
      month: budget.month,
      year: budget.year,
      limit_amount: budget.limit_amount
    });
    setShowAddModal(true);
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await deleteBudget(budgetId);
      await loadData();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleRecompute = async () => {
    try {
      await recomputeBudgets();
      await loadData();
    } catch (error) {
      console.error('Error recomputing budgets:', error);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getSpendingPercentage = (budget) => {
    if (!budget.limit_amount || budget.limit_amount === 0) return 0;
    return Math.min((budget.spent_amount / budget.limit_amount) * 100, 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'bg-error-500';
    if (percentage >= 80) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-300">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">💰 Budget Manager</h2>
          <p className="text-gray-400 mt-1">Track and manage your monthly spending limits</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleRecompute}
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Recompute
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Budget
          </Button>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const percentage = getSpendingPercentage(budget);
          const statusColor = getStatusColor(percentage);
          
          return (
            <Card key={budget.id} variant="elevated" hover className="p-6">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-gray-100">
                      {getCategoryName(budget.category_id)}
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      {budget.month}/{budget.year}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(budget)}
                      variant="ghost"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                    />
                    <Button
                      onClick={() => handleDelete(budget.id)}
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                      className="text-error-400 hover:text-error-300"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Spent: <span className="text-gray-100 font-medium">{formatCurrency(budget.spent_amount)}</span></span>
                  <span className="text-gray-300">Budget: <span className="text-gray-100 font-medium">{formatCurrency(budget.limit_amount)}</span></span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${statusColor} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="text-center">
                  <span className={`text-sm font-medium ${
                    percentage >= 100 ? 'text-error-400' : 
                    percentage >= 80 ? 'text-warning-400' : 'text-success-400'
                  }`}>
                    {percentage.toFixed(1)}% used
                  </span>
                </div>

                {percentage >= 100 && (
                  <div className="text-center text-error-400 text-sm font-medium flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Budget exceeded!
                  </div>
                )}
                {percentage >= 80 && percentage < 100 && (
                  <div className="text-center text-warning-400 text-sm font-medium flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Approaching limit
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg text-gray-300 mb-2">No budgets created yet</p>
            <p className="text-gray-400">Create your first budget to start tracking your spending</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="lg"
            icon={<Plus className="w-5 h-5" />}
          >
            Create Your First Budget
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-large max-w-md w-full">
            <div className="px-6 py-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-gray-100">
                {editingBudget ? 'Edit Budget' : 'Add Budget'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <FormField>
                  <Label required>Category</Label>
                  <Select
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField>
                    <Label required>Month</Label>
                    <Select
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                      required
                    >
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i+1} value={i+1}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField>
                    <Label required>Year</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                      min="2020"
                      max="2030"
                      required
                    />
                  </FormField>
                </div>

                <FormField>
                  <Label required>Budget Limit (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.limit_amount}
                    onChange={(e) => setFormData({...formData, limit_amount: e.target.value})}
                    placeholder="5000.00"
                    required
                  />
                </FormField>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBudget(null);
                    setFormData({
                      category_id: '',
                      month: new Date().getMonth() + 1,
                      year: new Date().getFullYear(),
                      limit_amount: ''
                    });
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  {editingBudget ? 'Update' : 'Create'} Budget
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;