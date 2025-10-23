import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/api';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label, FormField } from '../components/ui';
import { Plus, Edit, Trash2, Tag, Palette } from 'lucide-react';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#4f46e5',
    icon: '',
    budget_limit: ''
  });

  const predefinedColors = [
    '#4f46e5', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const predefinedIcons = [
    '🍔', '🚗', '🏠', '💊', '👕', '🎬', '📚', '🏋️', '✈️', '💳',
    '🛒', '🍕', '☕', '🎮', '🎵', '📱', '💻', '🔧', '🎁', '💰'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const categoryData = {
        ...formData,
        budget_limit: formData.budget_limit ? parseFloat(formData.budget_limit) : null
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await createCategory(categoryData);
      }
      await loadCategories();
      setShowAddModal(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        color: '#4f46e5',
        icon: '',
        budget_limit: ''
      });
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color || '#4f46e5',
      icon: category.icon || '',
      budget_limit: category.budget_limit || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(categoryId);
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-300">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">🏷️ Category Manager</h2>
          <p className="text-gray-400 mt-1">Organize your transactions with custom categories</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} variant="elevated" hover className="p-6">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-md"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon || '📁'}
                  </div>
                  <div>
                    <CardTitle className="text-gray-100">
                      {category.name}
                    </CardTitle>
                    {category.budget_limit && (
                      <p className="text-sm text-gray-400 mt-1">
                        Budget: ₹{parseFloat(category.budget_limit).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEdit(category)}
                    variant="ghost"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                  />
                  <Button
                    onClick={() => handleDelete(category.id)}
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    className="text-error-400 hover:text-error-300"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm text-gray-400">
                  Color: {category.color}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg text-gray-300 mb-2">No categories created yet</p>
            <p className="text-gray-400">Create categories to organize your transactions</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="lg"
            icon={<Plus className="w-5 h-5" />}
          >
            Create Your First Category
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-large max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-gray-100">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <FormField>
                  <Label required>Category Name</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Food & Dining"
                    required
                  />
                </FormField>

                <FormField>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-10 gap-2 mb-3">
                    {predefinedIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({...formData, icon})}
                        className={`w-8 h-8 text-lg rounded border-2 transition-all duration-200 ${
                          formData.icon === icon 
                            ? 'border-primary-500 bg-primary-500/20' 
                            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    placeholder="Or enter custom emoji"
                  />
                </FormField>

                <FormField>
                  <Label>Color</Label>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({...formData, color})}
                        className={`w-8 h-8 rounded border-2 transition-all duration-200 ${
                          formData.color === color 
                            ? 'border-gray-200 scale-110' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-12 h-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-transparent"
                    />
                    <Input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="#4f46e5"
                      className="flex-1"
                    />
                  </div>
                </FormField>

                <FormField>
                  <Label>Monthly Budget Limit (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.budget_limit}
                    onChange={(e) => setFormData({...formData, budget_limit: e.target.value})}
                    placeholder="5000.00"
                  />
                </FormField>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    setFormData({
                      name: '',
                      color: '#4f46e5',
                      icon: '',
                      budget_limit: ''
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
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;