# Fleet Management System - Deployment Guide

This comprehensive guide covers deploying the Fleet Management System from development to production using modern DevOps practices.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Helm Deployment](#helm-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring & Observability](#monitoring--observability)
8. [Troubleshooting](#troubleshooting)
9. [Production Checklist](#production-checklist)

---

## Prerequisites

### Required Tools

```bash
# Check installed versions
docker --version          # Docker 24.0+
docker-compose --version  # Docker Compose 2.0+
kubectl version          # Kubernetes 1.24+
helm version             # Helm 3.8+
dotnet --version         # .NET 9.0+
```

### Installation

**macOS (Homebrew):**
```bash
brew install docker docker-compose kubectl helm dotnet
```

**Linux:**
```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# .NET
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 9.0
```

---

## Local Development

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/fleet-management.git
cd fleet-management

# Start development environment
make dev

# Or using docker-compose directly
docker-compose up -d
```

### Access Development Services

- **Backend API:** http://localhost:5001
- **Swagger UI:** http://localhost:5001/swagger
- **Grafana:** http://localhost:3001 (admin/fleetadmin)
- **Prometheus:** http://localhost:9090

### Database Seeding

```bash
# Seed database with test data
make db-seed

# Or using curl
curl -X POST http://localhost:5001/api/seed
```

### Running Tests

```bash
# Run unit tests
make test

# Run tests with coverage
make test-coverage

# View coverage report
open backend/coverage/index.html
```

### Development Workflow

```bash
# Clean build artifacts
make clean

# Build the backend
make build

# Run linting
make lint

# Security scan
make security-scan

# View logs
make dev-logs

# Stop services
make dev-stop

# Clean everything (including volumes)
make dev-clean
```

---

## Docker Deployment

### Building Images

```bash
# Build backend Docker image
make docker-build

# Or manually
docker build -t ghcr.io/yourusername/fleet-backend:latest ./backend
```

### Scanning for Vulnerabilities

```bash
# Scan Docker image
make docker-scan

# Or using trivy directly
trivy image --severity HIGH,CRITICAL ghcr.io/yourusername/fleet-backend:latest
```

### Pushing to Registry

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USER --password-stdin

# Push images
make docker-push
```

### Custom Docker Compose

Create a `docker-compose.override.yml` for local customizations:

```yaml
version: '3.8'

services:
  backend:
    environment:
      - CUSTOM_ENV_VAR=value
    ports:
      - "5002:5000"  # Use different port
```

---

## Kubernetes Deployment

### Cluster Setup

**Option 1: Local Kubernetes (Docker Desktop, Minikube, Kind)**

```bash
# Docker Desktop - Enable Kubernetes in settings

# Or use Minikube
minikube start --cpus=4 --memory=8192

# Or use Kind
kind create cluster --name fleet-management
```

**Option 2: Cloud Kubernetes (GKE, EKS, AKS)**

```bash
# Google Cloud (GKE)
gcloud container clusters create fleet-cluster \
  --num-nodes=3 \
  --machine-type=n1-standard-2 \
  --zone=us-central1-a

# AWS (EKS)
eksctl create cluster \
  --name fleet-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3

# Azure (AKS)
az aks create \
  --resource-group fleet-rg \
  --name fleet-cluster \
  --node-count 3 \
  --node-vm-size Standard_D2s_v3
```

### Deploy Using Makefile

```bash
# Create namespaces
make k8s-ns

# Deploy all resources
make k8s-deploy

# Check deployment status
make k8s-status

# View logs
make k8s-logs
```

### Manual Kubernetes Deployment

```bash
# Apply manifests in order
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/postgres-statefulset.yaml
kubectl apply -f k8s/base/backend-deployment.yaml
kubectl apply -f k8s/base/monitoring-stack.yaml
kubectl apply -f k8s/base/ingress.yaml
kubectl apply -f k8s/base/network-policies.yaml

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n fleet-data --timeout=5m
kubectl wait --for=condition=ready pod -l app=fleet-backend -n fleet-app --timeout=5m
```

### Accessing Services

**Port Forwarding:**
```bash
# Backend API
kubectl port-forward -n fleet-app svc/fleet-backend 5001:5000

# Grafana
kubectl port-forward -n fleet-monitoring svc/grafana 3001:3000

# Prometheus
kubectl port-forward -n fleet-monitoring svc/prometheus 9090:9090
```

**LoadBalancer:**
```bash
# Get external IPs
kubectl get svc -n fleet-app
kubectl get svc -n fleet-monitoring
```

### Updating Deployment

```bash
# Update to new image version
make k8s-update VERSION=v1.2.3

# Or manually
kubectl set image deployment/fleet-backend \
  backend=ghcr.io/yourusername/fleet-backend:v1.2.3 \
  -n fleet-app

# Watch rollout
kubectl rollout status deployment/fleet-backend -n fleet-app
```

### Rollback

```bash
# Automatic rollback
make k8s-rollback

# Or manually
kubectl rollout undo deployment/fleet-backend -n fleet-app
kubectl rollout status deployment/fleet-backend -n fleet-app
```

---

## Helm Deployment

Helm provides a more declarative and version-controlled deployment approach.

### Install Helm Chart

**Development:**
```bash
cd helm/fleet-management

helm install fleet-dev . \
  -f values-dev.yaml \
  --create-namespace \
  --namespace fleet-dev
```

**Production:**
```bash
# Install with production values
helm install fleet-prod . \
  -f values-prod.yaml \
  --create-namespace \
  --namespace fleet-prod

# With custom values
helm install fleet-prod . \
  -f values-prod.yaml \
  --set backend.image.tag=v1.2.3 \
  --set postgresql.auth.password=$DB_PASSWORD \
  --namespace fleet-prod
```

### Upgrade Helm Release

```bash
# Upgrade to new version
helm upgrade fleet-prod . \
  -f values-prod.yaml \
  --set backend.image.tag=v1.2.4 \
  -n fleet-prod

# View upgrade history
helm history fleet-prod -n fleet-prod

# Rollback to previous version
helm rollback fleet-prod -n fleet-prod

# Rollback to specific revision
helm rollback fleet-prod 3 -n fleet-prod
```

### Helm Best Practices

```bash
# Dry-run before installing
helm install fleet-prod . \
  -f values-prod.yaml \
  --dry-run --debug

# Template rendering
helm template fleet-prod . \
  -f values-prod.yaml > rendered-manifests.yaml

# Lint the chart
helm lint .

# Package the chart
helm package .
```

### Customizing Values

Create a custom `my-values.yaml`:

```yaml
backend:
  image:
    tag: "v1.2.3"
  replicaCount: 5

postgresql:
  auth:
    password: "super-secure-password"
  persistence:
    size: 50Gi

grafana:
  auth:
    adminPassword: "another-secure-password"
```

Install with custom values:
```bash
helm install fleet-prod . \
  -f values-prod.yaml \
  -f my-values.yaml \
  -n fleet-prod
```

---

## CI/CD Pipeline

### GitHub Actions Setup

The repository includes a complete CI/CD pipeline in `.github/workflows/backend-ci-cd.yml`.

### Required Secrets

Configure these secrets in your GitHub repository:

```bash
# GitHub Container Registry (automatically available)
GITHUB_TOKEN

# Kubernetes credentials (base64 encoded kubeconfig)
KUBE_CONFIG_DEV
KUBE_CONFIG_PROD

# Notification secrets (optional)
SLACK_WEBHOOK
EMAIL_USERNAME
EMAIL_PASSWORD
```

### Setting Kubernetes Secrets

```bash
# Encode kubeconfig
cat ~/.kube/config | base64

# Add to GitHub:
# Settings → Secrets → Actions → New repository secret
# Name: KUBE_CONFIG_PROD
# Value: <paste base64 output>
```

### Pipeline Stages

1. **Build & Test** - Compile code, run unit tests, generate coverage
2. **Security Scan** - Trivy vulnerability scanning
3. **Build & Push Image** - Docker build and push to GHCR
4. **Deploy Dev** - Automatic deployment to dev environment
5. **Deploy Prod** - Manual approval required, deployment to production
6. **Notify** - Slack/email notifications

### Manual Trigger

```bash
# Trigger workflow manually via GitHub UI:
# Actions → Backend CI/CD Pipeline → Run workflow
```

### Local CI Pipeline

Run the CI pipeline locally:

```bash
make ci
```

This executes:
- Build
- Test
- Security scan

---

## Monitoring & Observability

### Accessing Dashboards

**Grafana:**
```bash
# Port-forward
kubectl port-forward -n fleet-monitoring svc/grafana 3001:3000

# Or use ingress
open https://grafana.fleet.yourdomain.com
```

**Prometheus:**
```bash
# Port-forward
kubectl port-forward -n fleet-monitoring svc/prometheus 9090:9090

# Or use ingress
open https://prometheus.fleet.yourdomain.com
```

### Health Checks

```bash
# Application health
curl http://localhost:5001/health

# Readiness check
curl http://localhost:5001/health/ready

# Detailed status
curl http://localhost:5001/health/status | jq
```

### Viewing Metrics

```bash
# Backend metrics
curl http://localhost:5001/metrics

# Fleet KPIs
curl http://localhost:5001/api/fleet-kpis/prometheus
```

### Setting Up Alerts

Edit `k8s/base/monitoring-stack.yaml` alert rules:

```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  annotations:
    summary: "High error rate detected"
```

Apply changes:
```bash
kubectl apply -f k8s/base/monitoring-stack.yaml
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**

```bash
# Check database pod
kubectl get pods -n fleet-data -l app=postgres
kubectl logs -n fleet-data -l app=postgres

# Test connectivity
kubectl run -it --rm psql-test \
  --image=postgres:16-alpine \
  --restart=Never \
  -n fleet-data \
  -- psql -h postgres.fleet-data.svc.cluster.local \
         -U fleetuser \
         -d FleetManagement
```

**2. Pods Not Starting**

```bash
# Check pod status
kubectl get pods -n fleet-app
kubectl describe pod <pod-name> -n fleet-app

# Check events
kubectl get events -n fleet-app --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n fleet-app
```

**3. Ingress Not Working**

```bash
# Check ingress
kubectl get ingress -n fleet-app
kubectl describe ingress fleet-backend-ingress -n fleet-app

# Check cert-manager
kubectl get certificates -n fleet-app
kubectl describe certificate fleet-backend-tls -n fleet-app
```

**4. High Memory Usage**

```bash
# Check resource usage
kubectl top pods -n fleet-app
kubectl top nodes

# Adjust resource limits in values.yaml
backend:
  resources:
    limits:
      memory: "1Gi"
```

### Debug Commands

```bash
# Exec into running pod
kubectl exec -it <pod-name> -n fleet-app -- /bin/sh

# View recent events
kubectl get events -n fleet-app --sort-by='.lastTimestamp' | tail -20

# Check HPA status
kubectl get hpa -n fleet-app
kubectl describe hpa fleet-backend-hpa -n fleet-app

# Network debugging
kubectl run -it --rm netshoot \
  --image=nicolaka/netshoot \
  --restart=Never \
  -n fleet-app
```

---

## Production Checklist

### Security

- [ ] Change all default passwords (PostgreSQL, Grafana)
- [ ] Use Kubernetes secrets or external secret management
- [ ] Enable network policies
- [ ] Configure TLS certificates
- [ ] Enable RBAC with minimal permissions
- [ ] Scan images for vulnerabilities
- [ ] Enable pod security policies
- [ ] Set up OAuth/OIDC for Grafana

### High Availability

- [ ] Run multiple backend replicas (3+)
- [ ] Configure HPA for auto-scaling
- [ ] Set up pod anti-affinity rules
- [ ] Configure liveness/readiness probes
- [ ] Set proper resource requests/limits
- [ ] Use persistent storage for databases
- [ ] Configure database backups

### Monitoring

- [ ] Set up Prometheus scraping
- [ ] Configure Grafana dashboards
- [ ] Enable alerting (Slack, email, PagerDuty)
- [ ] Set up log aggregation (ELK, Loki)
- [ ] Monitor resource usage
- [ ] Set up uptime monitoring

### Performance

- [ ] Enable HTTP/2
- [ ] Configure connection pooling
- [ ] Optimize database queries
- [ ] Set up caching (Redis)
- [ ] Enable CDN for static assets
- [ ] Configure rate limiting

### Backup & DR

- [ ] Automated database backups
- [ ] Backup retention policy
- [ ] Disaster recovery plan
- [ ] Test restore procedures
- [ ] Document RTO/RPO objectives

### Documentation

- [ ] Architecture diagrams
- [ ] Runbook for incidents
- [ ] Deployment procedures
- [ ] API documentation
- [ ] Configuration guide

---

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [.NET Documentation](https://learn.microsoft.com/en-us/dotnet/)

---

## Support

For questions or issues:
- Email: devops@yourdomain.com
- GitHub Issues: https://github.com/yourusername/fleet-management/issues
- Slack: #fleet-management

---

**Last Updated:** 2026-01-08
**Version:** 1.0.0
