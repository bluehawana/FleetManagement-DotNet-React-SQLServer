'use client';

import { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Globe,
  Mail,
  Smartphone,
  Key,
  Save,
  ChevronRight
} from 'lucide-react';

function SettingSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="card-description">{description}</p>
        </div>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        {description && <p className="text-xs text-[var(--foreground-muted)] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
    >
      <span 
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    maintenance: true,
    alerts: true,
  });

  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <div className="card">
            <div className="card-body p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id 
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]' 
                        : 'text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="col-span-9 space-y-6">
          {activeTab === 'general' && (
            <>
              <SettingSection title="Profile Information" description="Update your personal details">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center text-white text-xl font-semibold">
                      FM
                    </div>
                    <div>
                      <button className="btn btn-secondary btn-sm">Change Avatar</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--foreground)]">First Name</label>
                      <input 
                        type="text" 
                        defaultValue="Fleet"
                        className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--foreground)]">Last Name</label>
                      <input 
                        type="text" 
                        defaultValue="Manager"
                        className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
                    <input 
                      type="email" 
                      defaultValue="manager@fleetcommand.com"
                      className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    />
                  </div>
                </div>
              </SettingSection>

              <SettingSection title="Company Information" description="Your organization details">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--foreground)]">Company Name</label>
                    <input 
                      type="text" 
                      defaultValue="Metro Transit Authority"
                      className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--foreground)]">Fleet Size</label>
                      <input 
                        type="text" 
                        defaultValue="20 vehicles"
                        className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--foreground)]">Timezone</label>
                      <select className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-white">
                        <option>America/New_York (EST)</option>
                        <option>America/Chicago (CST)</option>
                        <option>America/Denver (MST)</option>
                        <option>America/Los_Angeles (PST)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </SettingSection>
            </>
          )}

          {activeTab === 'notifications' && (
            <SettingSection title="Notification Preferences" description="Choose how you want to be notified">
              <SettingRow label="Email Notifications" description="Receive updates via email">
                <Toggle enabled={notifications.email} onChange={(val) => setNotifications({...notifications, email: val})} />
              </SettingRow>
              <SettingRow label="Push Notifications" description="Browser and mobile notifications">
                <Toggle enabled={notifications.push} onChange={(val) => setNotifications({...notifications, push: val})} />
              </SettingRow>
              <SettingRow label="Maintenance Alerts" description="Get notified about upcoming maintenance">
                <Toggle enabled={notifications.maintenance} onChange={(val) => setNotifications({...notifications, maintenance: val})} />
              </SettingRow>
              <SettingRow label="Critical Alerts" description="Emergency and safety notifications">
                <Toggle enabled={notifications.alerts} onChange={(val) => setNotifications({...notifications, alerts: val})} />
              </SettingRow>
            </SettingSection>
          )}

          {activeTab === 'security' && (
            <>
              <SettingSection title="Password" description="Update your password">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--foreground)]">Current Password</label>
                    <input 
                      type="password" 
                      className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--foreground)]">New Password</label>
                    <input 
                      type="password" 
                      className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    />
                  </div>
                  <button className="btn btn-primary">
                    <Key size={16} />
                    Update Password
                  </button>
                </div>
              </SettingSection>

              <SettingSection title="Two-Factor Authentication" description="Add an extra layer of security">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--success-light)] flex items-center justify-center">
                      <Shield size={20} className="text-[var(--success)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">2FA is enabled</p>
                      <p className="text-xs text-[var(--foreground-muted)]">Using authenticator app</p>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm">Manage</button>
                </div>
              </SettingSection>
            </>
          )}

          {activeTab === 'appearance' && (
            <SettingSection title="Theme" description="Customize the look and feel">
              <div className="grid grid-cols-3 gap-4">
                <button className="p-4 border-2 border-[var(--primary)] rounded-lg bg-white">
                  <div className="w-full h-20 bg-[var(--background-secondary)] rounded mb-2 flex items-center justify-center">
                    <span className="text-xs text-[var(--foreground-muted)]">Light</span>
                  </div>
                  <p className="text-sm font-medium text-center">Light Mode</p>
                </button>
                <button className="p-4 border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors">
                  <div className="w-full h-20 bg-gray-900 rounded mb-2 flex items-center justify-center">
                    <span className="text-xs text-gray-400">Dark</span>
                  </div>
                  <p className="text-sm font-medium text-center">Dark Mode</p>
                </button>
                <button className="p-4 border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors">
                  <div className="w-full h-20 bg-gradient-to-b from-white to-gray-900 rounded mb-2 flex items-center justify-center">
                    <span className="text-xs text-gray-500">Auto</span>
                  </div>
                  <p className="text-sm font-medium text-center">System</p>
                </button>
              </div>
            </SettingSection>
          )}

          {activeTab === 'data' && (
            <>
              <SettingSection title="Data Export" description="Download your fleet data">
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 border border-[var(--border)] rounded-lg hover:bg-[var(--background-secondary)] transition-colors">
                    <div className="flex items-center gap-3">
                      <Database size={18} className="text-[var(--foreground-muted)]" />
                      <span className="text-sm">Export Fleet Data (CSV)</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--foreground-muted)]" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-[var(--border)] rounded-lg hover:bg-[var(--background-secondary)] transition-colors">
                    <div className="flex items-center gap-3">
                      <Database size={18} className="text-[var(--foreground-muted)]" />
                      <span className="text-sm">Export Maintenance History</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--foreground-muted)]" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-[var(--border)] rounded-lg hover:bg-[var(--background-secondary)] transition-colors">
                    <div className="flex items-center gap-3">
                      <Database size={18} className="text-[var(--foreground-muted)]" />
                      <span className="text-sm">Export Analytics Report</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--foreground-muted)]" />
                  </button>
                </div>
              </SettingSection>

              <SettingSection title="API Access" description="Manage API keys for integrations">
                <div className="p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">API Key</p>
                      <p className="text-xs font-mono text-[var(--foreground-muted)] mt-1">fc_live_****************************</p>
                    </div>
                    <button className="btn btn-secondary btn-sm">Regenerate</button>
                  </div>
                </div>
              </SettingSection>
            </>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="btn btn-primary">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
