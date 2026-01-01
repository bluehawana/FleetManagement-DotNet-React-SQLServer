'use client';

import { useState } from 'react';
import { 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Video,
  Zap,
  Users,
  Truck,
  Wrench,
  BarChart3
} from 'lucide-react';

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium text-[var(--foreground)]">{question}</span>
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-[var(--foreground-secondary)]">
          {answer}
        </div>
      )}
    </div>
  );
}

function GuideCard({ icon: Icon, title, description, href }: { icon: any; title: string; description: string; href: string }) {
  return (
    <a 
      href={href}
      className="card hover:border-[var(--primary)] transition-colors group"
    >
      <div className="card-body">
        <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center mb-3 group-hover:bg-[var(--primary)] transition-colors">
          <Icon size={20} className="text-[var(--primary)] group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">{description}</p>
      </div>
    </a>
  );
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: "How do I add a new vehicle to my fleet?",
      answer: "Navigate to Fleet Overview, click the 'Add Vehicle' button, and fill in the required information including VIN, license plate, make, model, and year. The vehicle will be added to your fleet immediately."
    },
    {
      question: "How do I schedule maintenance for a vehicle?",
      answer: "Go to the Maintenance section, select the vehicle, and click 'Schedule Maintenance'. You can set the type of service, date, and any notes. The system will send reminders as the date approaches."
    },
    {
      question: "How do I export my fleet data?",
      answer: "Go to Settings > Data & Storage, and click on the export option you need. You can export fleet data, maintenance history, or analytics reports in CSV format."
    },
    {
      question: "What do the different vehicle statuses mean?",
      answer: "Active: Vehicle is operational and available. In Maintenance: Currently being serviced. Out of Service: Not available for use. Delayed: Running behind schedule on current route."
    },
    {
      question: "How do I set up maintenance alerts?",
      answer: "Go to Settings > Notifications and enable 'Maintenance Alerts'. You can customize the alert threshold (e.g., 7 days before due date) in the Maintenance settings."
    },
    {
      question: "Can I integrate with other systems?",
      answer: "Yes! FleetCommand offers API access for integrations. Go to Settings > Data & Storage to find your API key. Check our API documentation for available endpoints."
    },
  ];

  const guides = [
    { icon: Zap, title: "Quick Start Guide", description: "Get up and running in 5 minutes", href: "#" },
    { icon: Truck, title: "Fleet Management", description: "Managing your vehicles effectively", href: "#" },
    { icon: Wrench, title: "Maintenance Guide", description: "Scheduling and tracking service", href: "#" },
    { icon: BarChart3, title: "Analytics & Reports", description: "Understanding your data", href: "#" },
    { icon: Users, title: "Team Management", description: "Adding and managing users", href: "#" },
    { icon: FileText, title: "API Documentation", description: "Integrate with your systems", href: "#" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">How can we help?</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-2">
          Search our knowledge base or browse the guides below
        </p>
        
        {/* Search */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" size={20} />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        <a href="#" className="card hover:border-[var(--primary)] transition-colors">
          <div className="card-body flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--info-light)] flex items-center justify-center">
              <Book size={24} className="text-[var(--info)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Documentation</h3>
              <p className="text-xs text-[var(--foreground-muted)]">Browse our guides</p>
            </div>
          </div>
        </a>
        <a href="#" className="card hover:border-[var(--primary)] transition-colors">
          <div className="card-body flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--success-light)] flex items-center justify-center">
              <MessageCircle size={24} className="text-[var(--success)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Live Chat</h3>
              <p className="text-xs text-[var(--foreground-muted)]">Chat with support</p>
            </div>
          </div>
        </a>
        <a href="#" className="card hover:border-[var(--primary)] transition-colors">
          <div className="card-body flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--warning-light)] flex items-center justify-center">
              <Video size={24} className="text-[var(--warning)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Video Tutorials</h3>
              <p className="text-xs text-[var(--foreground-muted)]">Watch and learn</p>
            </div>
          </div>
        </a>
      </div>

      {/* Guides Grid */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Popular Guides</h2>
        <div className="grid grid-cols-3 gap-4">
          {guides.map((guide, idx) => (
            <GuideCard key={idx} {...guide} />
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Frequently Asked Questions</h3>
            <p className="card-description">Quick answers to common questions</p>
          </div>
        </div>
        <div className="card-body">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} {...faq} />
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                <Mail size={24} className="text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Email Support</h3>
                <p className="text-xs text-[var(--foreground-muted)]">We'll respond within 24 hours</p>
                <a href="mailto:support@fleetcommand.com" className="text-sm text-[var(--primary)] font-medium mt-1 inline-block">
                  support@fleetcommand.com
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                <Phone size={24} className="text-[var(--success)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Phone Support</h3>
                <p className="text-xs text-[var(--foreground-muted)]">Mon-Fri, 9am-6pm EST</p>
                <a href="tel:+18001234567" className="text-sm text-[var(--primary)] font-medium mt-1 inline-block">
                  1-800-123-4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
