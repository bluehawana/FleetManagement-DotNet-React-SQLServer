# 📱 iPad Development Workflow for Valencia

## 🎯 Goal
Continue developing the Fleet Management System from your iPad while in Valencia, Spain.

## 🛠️ Setup Options

### Option 1: GitHub Codespaces (Recommended ⭐)
**Best for**: Full development environment in browser

1. **Open Codespaces**:
   - Go to https://github.com/bluehawana/fleet-management-system
   - Click "Code" → "Codespaces" → "Create codespace on main"
   - Wait 2-3 minutes for environment to load

2. **Start Backend**:
   ```bash
   cd backend/FleetManagement.API
   dotnet run
   ```

3. **Start Frontend** (new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Seed Data**:
   ```bash
   curl -X POST http://localhost:5000/api/seed/mock-data
   ```

5. **Preview**:
   - Codespaces will show "Open in Browser" for ports 3000 and 5000
   - Click to view dashboard

### Option 2: VPS Deployment
**Best for**: Production deployment and testing

1. **SSH to VPS** (using Termius or Blink):
   ```bash
   ssh root@your-vps-ip
   ```

2. **Clone Repository**:
   ```bash
   git clone https://github.com/bluehawana/fleet-management-system.git
   cd fleet-management-system
   ```

3. **Deploy with Docker**:
   ```bash
   docker-compose up -d
   ```

4. **Seed Data**:
   ```bash
   curl -X POST http://localhost:5000/api/seed/mock-data
   ```

5. **Access**:
   - Frontend: http://your-vps-ip:3000
   - Backend: http://your-vps-ip:5000/api
   - Grafana: http://your-vps-ip:3001

### Option 3: Working Copy + Textastic (iOS Native)
**Best for**: Quick edits and commits

1. **Install Apps**:
   - Working Copy (Git client)
   - Textastic (Code editor)

2. **Clone in Working Copy**:
   - Add repository: https://github.com/bluehawana/fleet-management-system
   - Clone to iPad

3. **Edit in Textastic**:
   - Open files from Working Copy
   - Make changes
   - Save back to Working Copy

4. **Commit & Push**:
   - Review changes in Working Copy
   - Commit with message
   - Push to GitHub

5. **Deploy**:
   - SSH to VPS
   - `git pull origin main`
   - `docker-compose up -d --build`

## 📋 Development Tasks for Valencia

### Phase 1: Complete Core Features (Days 1-2)
- [ ] Add Fleet Map page with bus locations
- [ ] Create charts for fuel trends and ridership
- [ ] Build maintenance scheduling UI
- [ ] Add driver management page

### Phase 2: Grafana Integration (Day 3)
- [ ] Set up Grafana data source (SQL Server)
- [ ] Create fuel consumption dashboard
- [ ] Create real-time fleet status dashboard
- [ ] Embed Grafana in `/monitoring` page

### Phase 3: Polish & Deploy (Days 4-5)
- [ ] Add loading states and error handling
- [ ] Implement toast notifications
- [ ] Add authentication (optional)
- [ ] Deploy to fleet.bluehawana.com
- [ ] Set up SSL certificate
- [ ] Test on mobile devices

### Phase 4: Portfolio Prep (Day 6-7)
- [ ] Add screenshots to README
- [ ] Record demo video
- [ ] Write LinkedIn post
- [ ] Update resume with project
- [ ] Prepare interview talking points

## 🎨 UI Components to Build

### Fleet Map (`/fleet/map`)
```typescript
// frontend/src/app/fleet/map/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export default function FleetMapPage() {
  const { data: buses } = useQuery({
    queryKey: ['buses'],
    queryFn: async () => {
      const response = await api.buses.getAll();
      return response.data;
    },
  });

  return (
    <div className="h-screen">
      <div className="grid grid-cols-4 h-full">
        {/* Sidebar with bus list */}
        <div className="col-span-1 bg-white p-4 overflow-y-auto">
          <h2 className="font-bold mb-4">Fleet Status</h2>
          {buses?.map((bus: any) => (
            <div key={bus.busId} className="p-3 mb-2 bg-gray-50 rounded">
              <div className="font-medium">Bus {bus.busNumber}</div>
              <div className="text-sm text-gray-600">{bus.status}</div>
            </div>
          ))}
        </div>
        
        {/* Map area */}
        <div className="col-span-3 bg-gray-100">
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Map integration coming soon</p>
            {/* TODO: Add Leaflet or Google Maps */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Fuel Trend Chart
```typescript
// frontend/src/components/charts/FuelTrendChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FuelTrendChartProps {
  data: Array<{
    date: string;
    averageMPG: number;
  }>;
}

export function FuelTrendChart({ data }: FuelTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="averageMPG" 
          stroke="#0ea5e9" 
          strokeWidth={2}
          name="MPG"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

## 🔧 Common iPad Development Commands

### Git Workflow
```bash
# Check status
git status

# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/fleet-map

# Stage changes
git add .

# Commit
git commit -m "feat: Add fleet map page"

# Push
git push origin feature/fleet-map

# Merge to main
git checkout main
git merge feature/fleet-map
git push origin main
```

### Docker Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart service
docker-compose restart frontend

# Rebuild and restart
docker-compose up -d --build

# Stop all services
docker-compose down

# Check status
docker-compose ps
```

### Backend Commands
```bash
# Run backend
cd backend/FleetManagement.API
dotnet run

# Build
dotnet build

# Run tests
cd ../FleetManagement.Tests
dotnet test
```

### Frontend Commands
```bash
# Install dependencies
cd frontend
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check
```

## 📱 iPad-Specific Tips

### 1. Split Screen
- Use Safari + Codespaces side-by-side
- Left: Dashboard preview
- Right: Code editor

### 2. External Keyboard Shortcuts
- `Cmd + /`: Comment code
- `Cmd + P`: Quick file open
- `Cmd + Shift + P`: Command palette
- `Cmd + B`: Toggle sidebar

### 3. Touch-Friendly Development
- Use Codespaces web interface (optimized for touch)
- Increase font size for easier reading
- Use iPad Pro with Magic Keyboard for best experience

### 4. Testing on iPad
- Open http://localhost:3000 in Safari
- Use responsive design mode
- Test touch interactions
- Check mobile layout

## 🌐 Accessing from iPad

### Local Development (Codespaces)
- Frontend: Click "Open in Browser" for port 3000
- Backend: Click "Open in Browser" for port 5000
- Swagger: http://localhost:5000/swagger

### VPS Deployment
- Frontend: http://your-vps-ip:3000
- Backend: http://your-vps-ip:5000/api
- Grafana: http://your-vps-ip:3001
- Production: https://fleet.bluehawana.com (after SSL setup)

## 🎯 Daily Workflow Example

### Morning (9 AM - 12 PM)
1. Open Codespaces on iPad
2. Pull latest changes: `git pull origin main`
3. Start backend: `cd backend/FleetManagement.API && dotnet run`
4. Start frontend: `cd frontend && npm run dev`
5. Work on one feature (e.g., fleet map)
6. Test in browser
7. Commit and push

### Afternoon (2 PM - 6 PM)
1. Continue feature development
2. Add tests if needed
3. Update documentation
4. Deploy to VPS for testing
5. Test on iPad Safari
6. Fix any mobile issues

### Evening (8 PM - 10 PM)
1. Review progress
2. Update PROGRESS_TRACKER.md
3. Plan tomorrow's tasks
4. Push all changes
5. Deploy to production if ready

## 📚 Resources

### Documentation
- Next.js: https://nextjs.org/docs
- React Query: https://tanstack.com/query/latest/docs/react/overview
- Tailwind CSS: https://tailwindcss.com/docs
- Recharts: https://recharts.org/en-US/

### iPad Apps
- **GitHub Mobile**: Repository management
- **Working Copy**: Git client
- **Textastic**: Code editor
- **Termius**: SSH client
- **Blink Shell**: Advanced terminal

### Codespaces Tips
- Use `Cmd + K` for quick commands
- Install extensions: ESLint, Prettier, C# Dev Kit
- Enable auto-save: File → Auto Save
- Use terminal split view

## 🚀 Quick Start Checklist

Before starting work each day:
- [ ] Open Codespaces or SSH to VPS
- [ ] Pull latest changes
- [ ] Start backend and frontend
- [ ] Seed data if needed
- [ ] Open dashboard in browser
- [ ] Check what needs to be built today

## 💡 Pro Tips

1. **Use Codespaces for development**, VPS for deployment testing
2. **Commit often** - iPad can lose connection
3. **Test on iPad Safari** - it's your target device
4. **Use Docker** - consistent environment everywhere
5. **Keep terminal open** - monitor logs in real-time
6. **Use split screen** - code + preview side-by-side

---

**You're all set for Valencia! 🇪🇸**

Open Codespaces, start coding, and enjoy the Spanish sun! ☀️
