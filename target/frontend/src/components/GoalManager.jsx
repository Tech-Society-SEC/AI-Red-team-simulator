import React, { useState, useEffect } from 'react';
import { getGoals, createGoal, updateGoal, deleteGoal, checkGoalDeadlines } from '../api/api';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label, FormField } from '../components/ui';
import { Plus, Edit, Trash2, Target, Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const GoalManager = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    deadline: ''
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await getGoals();
      setGoals(response.goals || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const goalData = {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
      } else {
        await createGoal(goalData);
      }
      await loadGoals();
      setShowAddModal(false);
      setEditingGoal(null);
      setFormData({
        title: '',
        target_amount: '',
        current_amount: '',
        deadline: ''
      });
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await deleteGoal(goalId);
      await loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleCheckDeadlines = async () => {
    try {
      await checkGoalDeadlines();
      await loadGoals();
    } catch (error) {
      console.error('Error checking deadlines:', error);
    }
  };

  const getProgressPercentage = (goal) => {
    if (!goal.target_amount || goal.target_amount === 0) return 0;
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const getStatusColor = (goal) => {
    switch (goal.status) {
      case 'completed': return 'bg-success-500';
      case 'missed': return 'bg-error-500';
      default: return 'bg-primary-500';
    }
  };

  const getStatusText = (goal) => {
    switch (goal.status) {
      case 'completed': return 'Completed';
      case 'missed': return 'Missed';
      default: return 'Active';
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (goal) => {
    if (goal.status !== 'active' || !goal.deadline) return false;
    return new Date(goal.deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-300">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">🎯 Goal Manager</h2>
          <p className="text-gray-400 mt-1">Set and track your financial goals</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleCheckDeadlines}
            variant="secondary"
            icon={<Clock className="w-4 h-4" />}
          >
            Check Deadlines
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Goal
          </Button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal);
          const statusColor = getStatusColor(goal);
          const overdue = isOverdue(goal);
          
          return (
            <Card key={goal.id} variant="elevated" hover className="p-6">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-gray-100 mb-2">
                      {goal.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        goal.status === 'completed' ? 'bg-success-500/20 text-success-400 border border-success-500/30' :
                        goal.status === 'missed' ? 'bg-error-500/20 text-error-400 border border-error-500/30' :
                        'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      }`}>
                        {getStatusText(goal)}
                      </span>
                      {overdue && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-error-500/20 text-error-400 border border-error-500/30">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(goal)}
                      variant="ghost"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                    />
                    <Button
                      onClick={() => handleDelete(goal.id)}
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
                  <span className="text-gray-300">Progress: <span className="text-gray-100 font-medium">{formatCurrency(goal.current_amount)}</span></span>
                  <span className="text-gray-300">Target: <span className="text-gray-100 font-medium">{formatCurrency(goal.target_amount)}</span></span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${statusColor} transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-300">
                    {progress.toFixed(1)}% complete
                  </span>
                </div>

                {goal.deadline && (
                  <div className="text-center text-sm text-gray-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Deadline: {formatDate(goal.deadline)}
                  </div>
                )}

                {goal.status === 'active' && (
                  <div className="text-center">
                    <span className="text-sm text-gray-400">
                      {formatCurrency(goal.target_amount - goal.current_amount)} remaining
                    </span>
                  </div>
                )}

                {goal.status === 'completed' && (
                  <div className="text-center text-success-400 text-sm font-medium flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Goal achieved!
                  </div>
                )}

                {goal.status === 'missed' && (
                  <div className="text-center text-error-400 text-sm font-medium flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Goal missed
                  </div>
                )}

                {overdue && goal.status === 'active' && (
                  <div className="text-center text-error-400 text-sm font-medium flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Past deadline
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg text-gray-300 mb-2">No goals created yet</p>
            <p className="text-gray-400">Set your first financial goal to start saving</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="lg"
            icon={<Plus className="w-5 h-5" />}
          >
            Create Your First Goal
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-large max-w-md w-full">
            <div className="px-6 py-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-gray-100">
                {editingGoal ? 'Edit Goal' : 'Add Goal'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <FormField>
                  <Label required>Goal Title</Label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Save for vacation"
                    required
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField>
                    <Label required>Target Amount (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.target_amount}
                      onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                      placeholder="50000"
                      required
                    />
                  </FormField>

                  <FormField>
                    <Label>Current Amount (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.current_amount}
                      onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                      placeholder="0"
                    />
                  </FormField>
                </div>

                <FormField>
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormField>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGoal(null);
                    setFormData({
                      title: '',
                      target_amount: '',
                      current_amount: '',
                      deadline: ''
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
                  {editingGoal ? 'Update' : 'Create'} Goal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalManager;