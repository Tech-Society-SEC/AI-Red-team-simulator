import React, { useState, useEffect } from 'react';
import { createTransaction, updateTransaction, getCategories, categorizeTransaction } from '../api/api';
import { Button, Input, Label, FormField, FormError } from '../components/ui';
import { Bot, Calendar, DollarSign, Tag, Building, FileText } from 'lucide-react';

const AddTransactionModal = ({ isOpen, onClose, transaction = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    txn_date: '',
    description: '',
    category: '',
    merchant: '',
    type: 'debit',
    amount: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [aiSuggesting, setAiSuggesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (transaction) {
        setFormData({
          txn_date: transaction.txn_date || '',
          description: transaction.description || '',
          category: transaction.category || '',
          merchant: transaction.merchant || '',
          type: transaction.type || 'debit',
          amount: transaction.amount || ''
        });
      } else {
        setFormData({
          txn_date: new Date().toISOString().split('T')[0],
          description: '',
          category: '',
          merchant: '',
          type: 'debit',
          amount: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, transaction]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAiCategorize = async () => {
    if (!formData.description && !formData.merchant) {
      alert('Please enter a description or merchant name for AI categorization');
      return;
    }

    setAiSuggesting(true);
    try {
      const response = await categorizeTransaction({
        description: formData.description,
        merchant: formData.merchant,
        amount: formData.amount
      });

      if (response.suggested_category) {
        setFormData(prev => ({ ...prev, category: response.suggested_category }));
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
    } finally {
      setAiSuggesting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.txn_date) {
      newErrors.txn_date = 'Date is required';
    }

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (transaction) {
        await updateTransaction(transaction.id, transactionData);
      } else {
        await createTransaction(transactionData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrors({ submit: 'Failed to save transaction' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-large max-w-md w-full">
        <div className="px-6 py-4 border-b border-white/20">
          <h2 className="text-xl font-semibold text-gray-100">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {errors.submit && (
            <div className="mb-4 p-3 bg-error-500/20 text-error-400 rounded-xl border border-error-500/30">
              {errors.submit}
            </div>
          )}

          <div className="space-y-4">
            <FormField>
              <Label required>Date</Label>
              <Input
                type="date"
                value={formData.txn_date}
                onChange={(e) => handleChange('txn_date', e.target.value)}
                icon={<Calendar className="w-4 h-4" />}
                error={!!errors.txn_date}
              />
              <FormError>{errors.txn_date}</FormError>
            </FormField>

            <FormField>
              <Label>Description</Label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Transaction description"
                icon={<FileText className="w-4 h-4" />}
              />
            </FormField>

            <FormField>
              <Label>Category</Label>
              <div className="flex space-x-2">
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 backdrop-blur-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={handleAiCategorize}
                  disabled={aiSuggesting}
                  variant="secondary"
                  icon={<Bot className="w-4 h-4" />}
                  className={aiSuggesting ? 'animate-pulse' : ''}
                >
                  {aiSuggesting ? 'AI...' : 'AI'}
                </Button>
              </div>
            </FormField>

            <FormField>
              <Label>Merchant</Label>
              <Input
                type="text"
                value={formData.merchant}
                onChange={(e) => handleChange('merchant', e.target.value)}
                placeholder="Merchant name"
                icon={<Building className="w-4 h-4" />}
              />
            </FormField>

            <FormField>
              <Label>Type</Label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 backdrop-blur-sm"
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </FormField>

            <FormField>
              <Label required>Amount (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                icon={<DollarSign className="w-4 h-4" />}
                error={!!errors.amount}
              />
              <FormError>{errors.amount}</FormError>
            </FormField>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              loading={loading}
            >
              {transaction ? 'Update' : 'Create'} Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;