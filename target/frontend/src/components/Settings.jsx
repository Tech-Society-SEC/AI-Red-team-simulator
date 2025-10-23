import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api/api';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, FormField, Select } from '../components/ui';
import { User, Settings as SettingsIcon, Save, Globe, Palette } from 'lucide-react';

const Settings = () => {
  const [profile, setProfile] = useState({});
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.profile || {});
      setSettings(response.settings || {});
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const updateData = {
        ...profile,
        ...settings
      };
      
      await updateProfile(updateData);
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-primary-400" />
        <h1 className="text-3xl font-bold text-gray-100">Settings</h1>
      </div>
      
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.includes('success') 
            ? 'bg-success-500/20 text-success-400 border-success-500/30' 
            : 'bg-error-500/20 text-error-400 border-error-500/30'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <Card variant="elevated" className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-100">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <FormField>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={profile.full_name || ''}
                onChange={(e) => handleProfileChange('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </FormField>

            <FormField>
              <Label>Avatar URL</Label>
              <Input
                type="url"
                value={profile.avatar_url || ''}
                onChange={(e) => handleProfileChange('avatar_url', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </FormField>

            <FormField>
              <Label>Currency</Label>
              <Select
                value={profile.currency || 'INR'}
                onChange={(e) => handleProfileChange('currency', e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </Select>
            </FormField>
          </CardContent>
        </Card>

        {/* User Settings */}
        <Card variant="elevated" className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-100">
              <SettingsIcon className="w-5 h-5" />
              <span>Preferences</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <FormField>
              <Label>Theme</Label>
              <Select
                value={settings.theme || 'dark'}
                onChange={(e) => handleSettingsChange('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </FormField>

            <FormField>
              <Label>Language</Label>
              <Select
                value={settings.language || 'en'}
                onChange={(e) => handleSettingsChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
              </Select>
            </FormField>

            <FormField>
              <Label>Date Format</Label>
              <Select
                value={settings.date_format || 'DD/MM/YYYY'}
                onChange={(e) => handleSettingsChange('date_format', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </Select>
            </FormField>

            <FormField>
              <Label>Notifications</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.email_notifications || false}
                    onChange={(e) => handleSettingsChange('email_notifications', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-gray-300">Email notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.budget_alerts || false}
                    onChange={(e) => handleSettingsChange('budget_alerts', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-gray-300">Budget alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.goal_reminders || false}
                    onChange={(e) => handleSettingsChange('goal_reminders', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-gray-300">Goal reminders</span>
                </label>
              </div>
            </FormField>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="primary"
          icon={<Save className="w-4 h-4" />}
          loading={saving}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;