# 🚀 Frontend Setup Guide - Next.js 14 Dashboard

## What We're Building

A **manager-first dashboard** for transport companies that just bought 100 new buses and need to:
1. **Save money** ($271,600/year through data-driven decisions)
2. **Monitor fleet** in real-time
3. **Take quick actions** (2-click problem solving)
4. **Integrate Grafana** for metrics
5. **Work on mobile** (managers use tablets/phones)

---

## 🎯 Manager Pain Points We Solve

### Pain Point 1: "I don't know what needs attention TODAY"
**Solution**: Morning Dashboard
- Shows urgent alerts first
- Prioritizes by cost impact
- Actionable recommendations

### Pain Point 2: "Where are my buses RIGHT NOW?"
**Solution**: Real-Time Fleet Map
- Live GPS tracking
- Status indicators (on-time, delayed, breakdown)
- Click bus → see details

### Pain Point 3: "Are we making or losing money?"
**Solution**: Cost Control Dashboard
- Today's costs vs budget
- Fuel waste alerts
- ROI tracking

### Pain Point 4: "Too many clicks to fix problems"
**Solution**: Quick Actions
- Schedule maintenance: 2 clicks
- Cancel wasteful route: 2 clicks
- Send driver to training: 2 clicks

### Pain Point 5: "Can't access from my phone"
**Solution**: Mobile-First Design
- Works on tablets and phones
- Touch-friendly buttons
- Responsive charts

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── (dashboard)/              # Dashboard routes
│   │   │   ├── page.tsx              # Main dashboard (Morning view)
│   │   │   ├── fleet/                # Fleet management
│   │   │   ├── insights/             # Business insights
│   │   │   ├── monitoring/           # Real-time monitoring
│   │   │   └── settings/             # Settings
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   └── providers.tsx             # React Query, etc.
│   │
│   ├── components/                   # Reusable components
│   │   ├── dashboard/                # Dashboard-specific
│   │   │   ├── KPICard.tsx           # KPI display card
│   │   │   ├── AlertCard.tsx         # Urgent alert card
│   │   │   ├── QuickAction.tsx       # Quick action button
│   │   │   └── SavingsCard.tsx       # Savings opportunity
│   │   ├── charts/                   # Chart components
│   │   │   ├── FuelTrendChart.tsx    # Fuel efficiency trends
│   │   │   ├── RidershipChart.tsx    # Passenger trends
│   │   │   └── CostBreakdown.tsx     # Cost analysis
│   │   ├── fleet/                    # Fleet components
│   │   │   ├── BusCard.tsx           # Bus status card
│   │   │   ├── FleetMap.tsx          # Real-time map
│   │   │   └── MaintenanceList.tsx   # Maintenance queue
│   │   └── ui/                       # Base UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       └── Modal.tsx
│   │
│   ├── lib/                          # Utilities
│   │   ├── api-client.ts             # API client (Axios)
│   │   ├── utils.ts                  # Helper functions
│   │   └── hooks/                    # Custom hooks
│   │       ├── useFleetStatus.ts     # Fleet status hook
│   │       ├── useInsights.ts        # Business insights hook
│   │       └── useRealTime.ts        # Real-time updates
│   │
│   ├── types/                        # TypeScript types
│   │   └── index.ts                  # All type definitions
│   │
│   └── store/                        # State management (Zustand)
│       ├── fleet-store.ts            # Fleet state
│       └── ui-store.ts               # UI state
│
├── public/                           # Static assets
│   ├── icons/                        # Custom icons
│   └── images/                       # Images
│
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
└── next.config.js                    # Next.js config
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GRAFANA_URL=http://localhost:3001
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## 📱 Key Pages & Features

### 1. Morning Dashboard (`/`)
**What managers see first thing in the morning**

```
┌─────────────────────────────────────────────────────────┐
│  🌅 GOOD MORNING, MANAGER                               │
│  Today: Wednesday, Dec 31, 2024                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🚨 URGENT (Needs attention TODAY)                      │
│  ┌────────────────────────────────────────────────┐    │
│  │ 🔴 Bus #08: Brake maintenance due in 3 days   │    │
│  │    Cost if delayed: $3,500                     │    │
│  │    [Schedule Now]                              │    │
│  │                                                 │    │
│  │ 🟡 Route 5: 15 min delayed (traffic)          │    │
│  │    Affecting 45 passengers                     │    │
│  │    [View Alternative Routes]                   │    │
│  │                                                 │    │
│  │ 🟡 Driver John: 3rd speeding event this week  │    │
│  │    Wasting $450/month in fuel                  │    │
│  │    [Send to Training]                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  💰 TODAY'S MONEY                                       │
│  ┌────────────────────────────────────────────────┐    │
│  │ Fuel: $1,245  ↓ 8% vs yesterday ✅            │    │
│  │ Revenue: $4,850  ↑ 5% vs yesterday ✅          │    │
│  │ Profit: $3,605  (74% margin) ✅                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  📊 FLEET STATUS                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │ 🟢 Operating: 18  🟡 Delayed: 2               │    │
│  │ 🔴 Breakdown: 0   🔧 Maintenance: 4            │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  💡 AI RECOMMENDATIONS                                  │
│  ┌────────────────────────────────────────────────┐    │
│  │ 1. Cancel Route 7 at 11 AM → Save $1,800/mo   │    │
│  │ 2. Train 3 drivers → Save $2,100/mo           │    │
│  │ 3. Switch Route 3 path → Save $170/mo         │    │
│  │                                                 │    │
│  │ Total Potential: $4,070/month = $48,840/year   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [View Full Dashboard] [Fleet Map] [Reports]            │
└─────────────────────────────────────────────────────────┘
```

### 2. Real-Time Fleet Map (`/fleet/map`)
**Live tracking of all buses**

Features:
- GPS markers for each bus
- Color-coded status (green=on-time, yellow=delayed, red=breakdown)
- Click bus → see details
- Route overlays
- Traffic layer
- Passenger count heatmap

### 3. Business Insights (`/insights`)
**The 5 money-saving dashboards**

#### 3.1 Fuel Waste (`/insights/fuel`)
- Top 10 fuel wasters
- Driver comparison
- Actionable recommendations
- Potential savings calculator

#### 3.2 Empty Buses (`/insights/occupancy`)
- Routes with < 30% occupancy
- Overcrowded routes (> 85%)
- Schedule optimization suggestions
- Revenue opportunity calculator

#### 3.3 Driver Performance (`/insights/drivers`)
- Driver leaderboard
- Performance scores
- Training recommendations
- Bonus calculator

#### 3.4 Maintenance Alerts (`/insights/maintenance`)
- Urgent maintenance queue
- Upcoming maintenance calendar
- Cost comparison (planned vs breakdown)
- Prevention savings tracker

#### 3.5 Route Optimization (`/insights/routes`)
- Routes with delays
- Low-profitability routes
- Alternative route suggestions
- Savings calculator

### 4. Grafana Integration (`/monitoring`)
**Real-time metrics dashboard**

Embedded Grafana panels:
- Live fuel consumption
- Real-time passenger counts
- Bus locations
- System health
- API performance

### 5. Fleet Management (`/fleet`)
**CRUD operations for buses**

Features:
- Bus list with filters
- Add new bus
- Update mileage
- Schedule maintenance
- Retire bus
- View maintenance history

---

## 🎨 Design System

### Colors

```typescript
// Status Colors
success: '#22c55e'  // Green - Good performance
warning: '#f59e0b'  // Yellow - Needs attention
danger: '#ef4444'   // Red - Critical issue
primary: '#0ea5e9'  // Blue - Brand color

// Usage
<Badge status="success">On Time</Badge>
<Badge status="warning">Delayed</Badge>
<Badge status="danger">Critical</Badge>
```

### Components

#### KPI Card
```tsx
<KPICard
  title="Total Buses"
  value={100}
  change={+5}
  trend="up"
  icon={<Bus />}
/>
```

#### Alert Card
```tsx
<AlertCard
  severity="critical"
  title="Bus #08 needs maintenance"
  description="Brake pads at 15%, due in 3 days"
  action="Schedule Now"
  onAction={() => scheduleMaintenance(8)}
/>
```

#### Savings Card
```tsx
<SavingsCard
  problem="Fuel waste"
  currentCost={28200}
  potentialSavings={102000}
  actionRequired="Train 8 drivers"
  priority="high"
/>
```

---

## 🔌 API Integration

### Using React Query

```typescript
// Fetch fleet status
const { data, isLoading } = useQuery({
  queryKey: ['fleet-status'],
  queryFn: () => api.dashboard.fleetStatus(),
  refetchInterval: 30000, // Refresh every 30 seconds
});

// Fetch business insights
const { data: insights } = useQuery({
  queryKey: ['roi-summary', days],
  queryFn: () => api.insights.roiSummary(days),
});

// Mutation for actions
const scheduleMaintenance = useMutation({
  mutationFn: (data) => api.buses.scheduleMaintenance(busId, data),
  onSuccess: () => {
    toast.success('Maintenance scheduled!');
    queryClient.invalidateQueries(['buses']);
  },
});
```

### Real-Time Updates

```typescript
// Poll for updates every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    queryClient.invalidateQueries(['fleet-status']);
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 📊 Chart Examples

### Fuel Efficiency Trend

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={fuelTrends}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line 
      type="monotone" 
      dataKey="averageMPG" 
      stroke="#0ea5e9" 
      name="MPG"
    />
    <Line 
      type="monotone" 
      dataKey="target" 
      stroke="#22c55e" 
      strokeDasharray="5 5"
      name="Target"
    />
  </LineChart>
</ResponsiveContainer>
```

### Cost Breakdown

```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={costData}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={renderCustomizedLabel}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {costData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables (Production)

```env
NEXT_PUBLIC_API_URL=https://api.yourcompany.com/api
NEXT_PUBLIC_GRAFANA_URL=https://grafana.yourcompany.com
```

---

## 📱 Mobile Optimization

### Touch-Friendly

- Buttons: min 44x44px
- Cards: Easy to tap
- Swipe gestures for navigation

### Responsive Breakpoints

```typescript
// Tailwind breakpoints
sm: '640px'   // Phone landscape
md: '768px'   // Tablet portrait
lg: '1024px'  // Tablet landscape
xl: '1280px'  // Desktop
2xl: '1536px' // Large desktop
```

### Mobile-First CSS

```css
/* Mobile first */
.card {
  @apply p-4;
}

/* Tablet and up */
@screen md {
  .card {
    @apply p-6;
  }
}

/* Desktop */
@screen lg {
  .card {
    @apply p-8;
  }
}
```

---

## 🎯 Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const FleetMap = dynamic(() => import('@/components/fleet/FleetMap'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/bus-icon.png"
  alt="Bus"
  width={48}
  height={48}
  priority
/>
```

### API Caching

```typescript
// Cache for 5 minutes
const { data } = useQuery({
  queryKey: ['kpis'],
  queryFn: () => api.dashboard.kpis(),
  staleTime: 5 * 60 * 1000,
});
```

---

## 🔐 Security

### API Authentication

```typescript
// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Environment Variables

- Never commit `.env.local`
- Use `NEXT_PUBLIC_` prefix for client-side vars
- Keep API keys server-side only

---

## 📚 Next Steps

1. **Run the backend API** (see README_BACKEND.md)
2. **Seed mock data**: `POST /api/seed/mock-data`
3. **Start frontend**: `npm run dev`
4. **Open dashboard**: http://localhost:3000
5. **See real data** in action!

---

**This frontend is built for ONE purpose: Help transport managers save $271,600/year!** 💰

Every component, every page, every feature is designed to solve real business problems.

