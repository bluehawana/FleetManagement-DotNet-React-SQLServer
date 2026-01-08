# Fleet Management System - DevOps Infrastructure

## Executive Summary

This document provides an overview of the production-ready DevOps infrastructure implemented for the Fleet Management System. The system demonstrates enterprise-grade deployment capabilities including containerization, Kubernetes orchestration, automated CI/CD pipelines, and comprehensive observability.

## Technology Stack

### Backend & Infrastructure
- **Backend:** C# .NET 9.0 - Engineered for extensibility and performance
- **Database:** PostgreSQL 16 - Production-grade relational database
- **Containerization:** Docker - Consistent development and deployment environments
- **Orchestration:** Kubernetes - Auto-scaling, self-healing, and zero-downtime deployments
- **Package Management:** Helm 3 - Declarative application management
- **CI/CD:** GitHub Actions - Automated testing, building, and deployment
- **Observability:** Prometheus + Grafana - Full-stack monitoring and alerting

### Deployment Target
- **Platform:** Kubernetes (local, cloud, or HomeLab)
- **Environment:** Proxmox-based HomeLab simulation of real-world data center
- **Security:** RBAC, Network Policies, TLS encryption, Secret management

---

## Infrastructure Components

### 1. Docker Configuration

**Location:** `/backend/Dockerfile`, `docker-compose.yml`

**Features:**
- Multi-stage builds for optimized image size
- Non-root user for security
- Health checks for container orchestration
- Environment-specific configurations
- Volume management for data persistence

**Services:**
```yaml
- Backend API (.NET 9.0)
- PostgreSQL 16 Database
- Prometheus Monitoring
- Grafana Dashboards
```

**Usage:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### 2. Kubernetes Manifests

**Location:** `/k8s/base/`

#### a. Namespace Configuration
**File:** `namespace.yaml`

Creates three isolated namespaces:
- `fleet-app` - Application services (Backend API)
- `fleet-data` - Data layer (PostgreSQL)
- `fleet-monitoring` - Observability stack (Prometheus, Grafana)

#### b. Backend Deployment
**File:** `backend-deployment.yaml`

**Components:**
- **Deployment:** 3 replicas with rolling update strategy
- **Service:** LoadBalancer type for external access
- **HorizontalPodAutoscaler:** Auto-scales 3-10 pods based on CPU/memory
- **ServiceAccount & RBAC:** Minimal permissions for security
- **Security Context:** Non-root, dropped capabilities, restricted privileges

**Features:**
- Zero-downtime deployments
- Liveness, readiness, and startup probes
- Resource limits and requests
- Pod anti-affinity for HA
- Prometheus metrics scraping

#### c. PostgreSQL StatefulSet
**File:** `postgres-statefulset.yaml`

**Components:**
- **StatefulSet:** Persistent database with 20Gi storage
- **Headless Service:** For StatefulSet DNS
- **LoadBalancer Service:** For external access (dev/testing)
- **ConfigMap:** Optimized PostgreSQL configuration
- **Secrets:** Database credentials
- **Postgres Exporter:** Sidecar for metrics

**Features:**
- Persistent storage with PVC
- Health probes for automatic recovery
- Performance-tuned configuration
- Metrics export to Prometheus

#### d. Monitoring Stack
**File:** `monitoring-stack.yaml`

**Prometheus Components:**
- ConfigMap with scrape configs and alert rules
- Deployment with 50Gi persistent storage
- Service Discovery for Kubernetes pods
- ClusterRole for API access
- Retention: 30 days, 50GB

**Grafana Components:**
- Deployment with persistent storage
- Pre-configured Prometheus datasource
- Dashboard provisioning
- Secret for credentials

**Alert Rules:**
- Backend API down
- High error rate (>5%)
- High response time (>1s)
- PostgreSQL down
- High database connections
- Pod memory/CPU usage

#### e. Ingress Configuration
**File:** `ingress.yaml`

**Features:**
- NGINX Ingress Controller support
- Automatic TLS via cert-manager
- Rate limiting (100 req/s)
- CORS configuration
- Security headers
- Basic auth for Prometheus

**Endpoints:**
- `api.fleet.yourdomain.com` - Backend API
- `grafana.fleet.yourdomain.com` - Grafana
- `prometheus.fleet.yourdomain.com` - Prometheus

#### f. Network Policies
**File:** `network-policies.yaml`

**Security:**
- Default deny all traffic
- Explicit allow rules for required communication
- Namespace isolation
- DNS access whitelisting
- Ingress controller access

**Policies:**
- Backend can access PostgreSQL
- Prometheus can scrape metrics
- Grafana can query Prometheus
- Block all other traffic

---

### 3. Helm Chart

**Location:** `/helm/fleet-management/`

#### Structure
```
helm/fleet-management/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default values (production)
├── values-dev.yaml         # Development overrides
├── values-prod.yaml        # Production overrides
├── README.md              # Helm chart documentation
└── templates/
    ├── _helpers.tpl        # Template helpers
    └── NOTES.txt          # Post-install notes
```

#### Key Features

**Parameterization:**
- Environment-specific configurations
- Image tags and repositories
- Resource limits and requests
- Replica counts
- Storage sizes
- Ingress hosts and TLS

**Development Values:**
- 1 replica
- Smaller resources (128Mi memory, 100m CPU)
- 10Gi storage
- Staging TLS certificates

**Production Values:**
- 5 replicas
- Larger resources (512Mi memory, 500m CPU)
- 100Gi storage
- Production TLS certificates
- Pod anti-affinity for HA
- Higher connection limits

**Usage:**
```bash
# Install development
helm install fleet-dev helm/fleet-management \
  -f helm/fleet-management/values-dev.yaml \
  -n fleet-dev --create-namespace

# Install production
helm install fleet-prod helm/fleet-management \
  -f helm/fleet-management/values-prod.yaml \
  -n fleet-prod --create-namespace

# Upgrade
helm upgrade fleet-prod helm/fleet-management \
  -f helm/fleet-management/values-prod.yaml

# Rollback
helm rollback fleet-prod
```

---

### 4. CI/CD Pipeline

**Location:** `.github/workflows/backend-ci-cd.yml`

#### Pipeline Architecture

```
┌─────────────────┐
│  Build & Test   │─┐
└─────────────────┘ │
                    ├──> ┌─────────────────────┐
┌─────────────────┐ │    │ Build & Push Image  │
│ Security Scan   │─┘    └─────────────────────┘
└─────────────────┘               │
                                  ├──> ┌─────────────┐
                                  │    │  Deploy Dev  │
                                  │    └─────────────┘
                                  │
                                  └──> ┌──────────────┐
                                       │ Deploy Prod  │ (manual approval)
                                       └──────────────┘
                                              │
                                       ┌─────────────┐
                                       │   Notify    │
                                       └─────────────┘
```

#### Job 1: Build & Test
- Checkout code
- Setup .NET 9.0
- Restore dependencies
- Build solution
- Run unit tests with coverage
- Publish test results
- Upload coverage to Codecov

#### Job 2: Security Scan
- Trivy filesystem scan
- Upload results to GitHub Security
- Check for vulnerable packages
- Check for deprecated packages
- Fail build if vulnerabilities found

#### Job 3: Build & Push Image
- Login to GitHub Container Registry
- Build Docker image with BuildKit
- Multi-platform support (amd64)
- Layer caching for faster builds
- Tag with SHA, branch, and version
- Scan image with Trivy
- Push to registry

#### Job 4: Deploy Development
- Triggers on `develop` branch
- Setup kubectl
- Update deployment image
- Wait for rollout completion
- Health checks
- Smoke tests
- Automatic rollback on failure

#### Job 5: Deploy Production
- Triggers on `main` branch
- Requires manual approval
- Gradual rollout (canary)
- Health checks
- Smoke tests
- Automatic rollback on failure
- Deployment metrics

#### Job 6: Notifications
- Slack notifications with status
- Email on failure
- Includes commit info and workflow link

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main`
- Manual workflow dispatch

**Required Secrets:**
- `GITHUB_TOKEN` (automatic)
- `KUBE_CONFIG_DEV` (base64 kubeconfig)
- `KUBE_CONFIG_PROD` (base64 kubeconfig)
- `SLACK_WEBHOOK` (optional)
- `EMAIL_USERNAME` (optional)
- `EMAIL_PASSWORD` (optional)

---

### 5. Makefile Automation

**Location:** `/Makefile`

#### Categories

**Development:**
```bash
make dev           # Start development environment
make dev-logs      # Tail development logs
make dev-stop      # Stop development environment
make dev-clean     # Clean environment (removes volumes)
```

**Build & Test:**
```bash
make build         # Build .NET backend
make test          # Run unit tests
make test-coverage # Run tests with coverage
make lint          # Run code linting
make security-scan # Scan for vulnerabilities
```

**Docker:**
```bash
make docker-build  # Build Docker images
make docker-push   # Push images to registry
make docker-scan   # Scan image for vulnerabilities
```

**Kubernetes:**
```bash
make k8s-ns        # Create namespaces
make k8s-deploy    # Deploy to Kubernetes
make k8s-update    # Update deployment
make k8s-rollback  # Rollback deployment
make k8s-status    # Show deployment status
make k8s-logs      # Tail backend logs
make k8s-delete    # Delete all resources
```

**Database:**
```bash
make db-migrate    # Run EF Core migrations
make db-seed       # Seed database with test data
make db-backup     # Backup PostgreSQL
make db-restore    # Restore PostgreSQL
```

**Monitoring:**
```bash
make metrics       # Open Prometheus
make grafana       # Open Grafana
make health        # Check service health
make load-test     # Run k6 load test
```

**CI/CD:**
```bash
make ci            # Run CI pipeline locally
make cd            # Run CD pipeline
make pipeline      # Run full CI/CD
```

**Features:**
- Color-coded output
- Help documentation (`make help`)
- Error handling
- Dependency management
- Version tracking

---

### 6. Load Testing

**Location:** `/scripts/load-test.js`

**Framework:** k6 (Grafana k6)

**Test Scenarios:**
1. **Ramp-up:** 0 → 50 users (2 min)
2. **Steady State:** 50 users (5 min)
3. **Peak Load:** 50 → 100 users (2 min)
4. **Peak Steady:** 100 users (3 min)
5. **Spike Test:** 100 → 200 users (1 min)
6. **Recovery:** 200 → 50 users (2 min)
7. **Ramp-down:** 50 → 0 users (2 min)

**Total Duration:** ~19 minutes

**Metrics:**
- Request rate (req/s)
- Response times (avg, p95, p99)
- Error rate
- Success/failure counts

**Thresholds:**
- Error rate < 1%
- p95 response time < 500ms
- p99 response time < 1s
- Average response time < 200ms
- Request rate > 100 req/s

**Endpoints Tested:**
- `/metrics` (10% traffic)
- `/api/fleet-kpis/prometheus` (30%)
- `/swagger/index.html` (5%)
- `/api/buses` (20%)
- `/api/drivers` (20%)
- `/api/routes` (15%)

**Reports:**
- Console output with colors
- JSON report (`reports/load-test-*.json`)
- HTML report (`reports/load-test-*.html`)

**Usage:**
```bash
# Run load test
make load-test

# Or with k6 directly
k6 run scripts/load-test.js

# With custom base URL
BASE_URL=https://api.fleet.yourdomain.com k6 run scripts/load-test.js
```

---

### 7. Health Checks

**Location:** `/backend/FleetManagement.API/Controllers/HealthController.cs`

#### Endpoints

**1. Basic Health - `/health` or `/health/live`**
- **Purpose:** Kubernetes liveness probe
- **Returns:** 200 OK if app is running
- **Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-08T12:00:00Z",
  "uptime": "01:23:45",
  "version": "1.0.0",
  "environment": "Production"
}
```

**2. Readiness Check - `/health/ready`**
- **Purpose:** Kubernetes readiness probe
- **Checks:**
  - Database connectivity
  - Database query performance
  - Memory usage
- **Returns:** 200 if ready, 503 if not
- **Response:**
```json
{
  "status": "ready",
  "timestamp": "2026-01-08T12:00:00Z",
  "uptime": "01:23:45",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": "12.34ms"
    },
    "database_query": {
      "status": "healthy",
      "responseTime": "23.45ms",
      "recordCount": 150
    },
    "memory": {
      "status": "healthy",
      "workingSet": "245 MB"
    }
  }
}
```

**3. Startup Check - `/health/startup`**
- **Purpose:** Kubernetes startup probe
- **Checks:**
  - Database connection
  - Pending migrations
- **Returns:** 200 when started, 503 during startup

**4. Detailed Status - `/health/status`**
- **Purpose:** Comprehensive monitoring
- **Includes:**
  - Application info
  - Database statistics
  - Memory and GC info
  - Thread pool metrics
- **Not recommended for K8s probes** (too heavy)

#### Kubernetes Integration

**Liveness Probe:**
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10
```

**Readiness Probe:**
```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 5
```

**Startup Probe:**
```yaml
startupProbe:
  httpGet:
    path: /health/startup
    port: 5000
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 30  # 150s max startup time
```

---

## Deployment Workflows

### Local Development
```bash
1. make dev              # Start services
2. make db-seed          # Seed database
3. make health           # Verify health
4. Open http://localhost:3001  # View Grafana
```

### Docker Deployment
```bash
1. make docker-build     # Build images
2. make docker-scan      # Security scan
3. make docker-push      # Push to registry
```

### Kubernetes Deployment
```bash
1. make k8s-ns           # Create namespaces
2. make k8s-deploy       # Deploy all resources
3. make k8s-status       # Check status
4. make k8s-logs         # View logs
```

### Helm Deployment
```bash
1. cd helm/fleet-management
2. helm install fleet-prod . -f values-prod.yaml -n fleet-prod --create-namespace
3. helm status fleet-prod -n fleet-prod
```

### CI/CD Pipeline
```bash
1. git push origin main           # Trigger pipeline
2. Monitor GitHub Actions UI
3. Approve production deployment
4. Verify deployment via health checks
```

---

## Observability

### Metrics Collection

**Prometheus Scrape Targets:**
- Backend API (`/metrics`)
- PostgreSQL Exporter (port 9187)
- Kubernetes API Server
- Kubernetes Nodes
- All annotated pods

**Custom Metrics:**
- `driver_overall_score`
- `driver_fatigue_level`
- `driver_safety_score`
- `bus_health_score`
- `bus_km_since_service`
- `fleet_total_buses`
- `fleet_operational_buses`

### Grafana Dashboards

**Pre-configured Dashboards:**
1. **Fleet Operations** - Overall fleet health
2. **Driver Monitoring** - Driver performance and safety
3. **Cost & Financial** - Operational costs

**Dashboard Features:**
- Real-time metrics
- Historical trends
- Alerting thresholds
- Drill-down capabilities
- Mobile responsive

### Alert Rules

**Critical Alerts:**
- Backend API down (2 min)
- PostgreSQL down (1 min)
- High error rate (>5% for 5 min)
- Pod memory usage >90%
- Pod CPU usage >80%

**Warning Alerts:**
- High response time (>1s for 5 min)
- High database connections (>80 for 5 min)

---

## Security Features

### Container Security
- Non-root users
- Read-only root filesystem (where possible)
- Dropped capabilities (ALL)
- Security contexts
- Image vulnerability scanning

### Kubernetes Security
- RBAC with minimal permissions
- Network policies (default deny)
- Pod security standards (restricted)
- Secret management
- Service accounts per component

### Network Security
- Namespace isolation
- Ingress with TLS
- Rate limiting
- CORS configuration
- Security headers

### Secret Management
- Kubernetes Secrets
- Base64 encoding
- External secret support
- Rotation recommendations

---

## High Availability

### Application Layer
- Multiple replicas (3-5)
- HorizontalPodAutoscaler
- Rolling updates (zero downtime)
- Pod anti-affinity rules
- Health checks for auto-recovery

### Data Layer
- Persistent volumes
- StatefulSet for PostgreSQL
- Regular backups
- Point-in-time recovery

### Infrastructure
- Multi-node Kubernetes cluster
- LoadBalancer services
- Ingress controller
- Auto-scaling nodes

---

## Disaster Recovery

### Backup Strategy
```bash
# Database backup
make db-backup

# Manual backup
kubectl exec -n fleet-data postgres-0 -- \
  pg_dump -U fleetuser FleetManagement > backup.sql
```

### Restore Procedure
```bash
# Restore database
make db-restore

# Or manually
kubectl exec -i -n fleet-data postgres-0 -- \
  psql -U fleetuser FleetManagement < backup.sql
```

### Recovery Steps
1. Restore database from latest backup
2. Deploy previous known-good image version
3. Verify health checks
4. Run smoke tests
5. Monitor metrics

---

## Performance Optimization

### Application
- Connection pooling
- Async/await patterns
- Efficient queries
- Caching strategies
- Resource limits

### Database
- Optimized configuration
- Indexes on frequently queried columns
- Connection pooling
- Query optimization
- Regular VACUUM

### Infrastructure
- Horizontal scaling
- Resource requests/limits
- Network policies optimization
- Storage class selection

---

## Cost Optimization

### Resource Management
- Right-sized containers
- HPA for auto-scaling
- Spot instances for non-critical workloads
- Storage class optimization

### Monitoring
- Track resource usage
- Identify optimization opportunities
- Alert on unusual patterns

---

## Future Enhancements

### Planned Features
1. **Service Mesh** - Istio for advanced traffic management
2. **GitOps** - ArgoCD for declarative deployments
3. **Secrets Management** - HashiCorp Vault integration
4. **Log Aggregation** - ELK stack or Grafana Loki
5. **Tracing** - Jaeger or Tempo for distributed tracing
6. **Multi-region** - Geographic distribution
7. **Chaos Engineering** - Resilience testing
8. **Database HA** - Patroni/Stolon for PostgreSQL clustering

---

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review and rotate secrets quarterly
- [ ] Test backup/restore procedures monthly
- [ ] Review and update alert rules
- [ ] Security scanning weekly
- [ ] Performance testing monthly
- [ ] Review resource usage weekly

### Version Upgrades
- Kubernetes: Follow N-1 version support
- Helm: Stay on latest stable
- .NET: Upgrade LTS versions
- PostgreSQL: Major version every 2 years

---

## Documentation

### Available Guides
1. **DEPLOYMENT_GUIDE.md** - Step-by-step deployment instructions
2. **DEVOPS_INFRASTRUCTURE.md** - This document
3. **helm/fleet-management/README.md** - Helm chart documentation
4. **README.md** - Project overview

### Runbooks
- Incident response procedures
- Rollback procedures
- Database recovery
- Common troubleshooting

---

## Metrics & KPIs

### Technical Metrics
- Deployment frequency: Daily (automated)
- Lead time: < 30 minutes
- MTTR: < 15 minutes
- Change failure rate: < 5%
- Uptime: 99.9% target

### Performance Metrics
- Response time p95: < 500ms
- Response time p99: < 1s
- Error rate: < 1%
- Request rate: 100+ req/s

---

## Conclusion

This DevOps infrastructure demonstrates enterprise-grade deployment capabilities including:

✅ **Containerization** - Docker with multi-stage builds
✅ **Orchestration** - Kubernetes with auto-scaling
✅ **Automation** - CI/CD pipeline with GitHub Actions
✅ **Observability** - Prometheus + Grafana monitoring
✅ **Security** - RBAC, network policies, TLS
✅ **High Availability** - Multiple replicas, health checks
✅ **Disaster Recovery** - Automated backups, rollback
✅ **Developer Experience** - Makefile, Helm, documentation

The infrastructure is production-ready and can be deployed to any Kubernetes environment, from local development to cloud providers to HomeLab Proxmox clusters.

---

**Version:** 1.0.0
**Last Updated:** 2026-01-08
**Maintained By:** Fleet Management DevOps Team
