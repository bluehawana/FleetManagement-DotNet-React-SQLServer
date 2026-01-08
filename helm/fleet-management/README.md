# Fleet Management Helm Chart

This Helm chart deploys the complete Fleet Management System including backend API, PostgreSQL database, Prometheus monitoring, and Grafana dashboards.

## Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured to communicate with your cluster
- (Optional) cert-manager for automatic TLS certificate management
- (Optional) NGINX Ingress Controller for ingress support

## Installation

### Quick Start

Install with default values:

```bash
# Add the Helm repository (if published)
helm repo add fleet-management https://charts.yourdomain.com
helm repo update

# Install the chart
helm install fleet-management fleet-management/fleet-management \
  --create-namespace \
  --namespace fleet-app
```

### Install from local chart

```bash
cd helm/fleet-management

# Install for development
helm install fleet-dev . \
  -f values-dev.yaml \
  --create-namespace \
  --namespace fleet-dev

# Install for production
helm install fleet-prod . \
  -f values-prod.yaml \
  --create-namespace \
  --namespace fleet-prod
```

## Configuration

### Values Files

The chart includes environment-specific values files:

- `values.yaml` - Default production values
- `values-dev.yaml` - Development overrides (smaller resources, 1 replica)
- `values-prod.yaml` - Production overrides (HA setup, larger resources)

### Key Configuration Options

#### Backend API

```yaml
backend:
  enabled: true
  replicaCount: 3
  image:
    repository: ghcr.io/yourusername/fleet-backend
    tag: "latest"
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
```

#### PostgreSQL Database

```yaml
postgresql:
  enabled: true
  auth:
    database: FleetManagement
    username: fleetuser
    password: FleetPass123!  # CHANGE THIS!
  persistence:
    size: 20Gi
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
```

#### Monitoring Stack

```yaml
prometheus:
  enabled: true
  retention:
    time: 30d
    size: 50GB

grafana:
  enabled: true
  auth:
    adminUser: admin
    adminPassword: fleetadmin  # CHANGE THIS!
```

## Upgrading

### Upgrade to a new version

```bash
# Development
helm upgrade fleet-dev . \
  -f values-dev.yaml \
  -n fleet-dev

# Production
helm upgrade fleet-prod . \
  -f values-prod.yaml \
  -n fleet-prod
```

### View upgrade history

```bash
helm history fleet-prod -n fleet-prod
```

### Rollback to previous version

```bash
helm rollback fleet-prod -n fleet-prod
```

## Uninstallation

```bash
# Development
helm uninstall fleet-dev -n fleet-dev

# Production
helm uninstall fleet-prod -n fleet-prod
```

Note: PersistentVolumeClaims are not automatically deleted. To delete them:

```bash
kubectl delete pvc -n fleet-prod -l app.kubernetes.io/instance=fleet-prod
```

## Components

### Backend API
- .NET 9 REST API
- Prometheus metrics endpoint
- Auto-scaling with HPA
- Zero-downtime rolling updates

### PostgreSQL Database
- PostgreSQL 16 Alpine
- StatefulSet for persistence
- PostgreSQL Exporter for metrics
- Configurable HA support

### Prometheus
- Time-series metrics database
- Auto-discovery of Kubernetes targets
- 30-day retention (configurable)
- Alert rules for fleet operations

### Grafana
- Pre-configured dashboards
- Connected to Prometheus datasource
- Persistent storage for dashboards

## Networking

### Ingress

The chart supports NGINX Ingress Controller with automatic TLS via cert-manager:

```yaml
backend:
  ingress:
    enabled: true
    className: nginx
    hosts:
      - host: api.fleet.yourdomain.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: fleet-backend-tls
        hosts:
          - api.fleet.yourdomain.com
```

### Network Policies

Network policies are enabled by default to restrict traffic between pods:

```yaml
networkPolicies:
  enabled: true
```

## Security

### Secrets Management

**Production Recommendation:** Use external secrets management:

```yaml
postgresql:
  auth:
    existingSecret: postgres-secret  # Create secret externally

grafana:
  auth:
    existingSecret: grafana-secret   # Create secret externally
```

### RBAC

RBAC is enabled by default with minimal required permissions:

```yaml
rbac:
  create: true
```

### Security Contexts

All containers run with security best practices:
- Non-root user
- Read-only root filesystem (where applicable)
- Dropped capabilities
- seccomp profile

## Monitoring

### Access Grafana

```bash
# Port-forward method
kubectl port-forward -n fleet-monitoring svc/grafana 3000:3000

# Or get LoadBalancer IP
kubectl get svc grafana -n fleet-monitoring
```

Default credentials:
- Username: `admin`
- Password: `fleetadmin` (change in production!)

### Access Prometheus

```bash
kubectl port-forward -n fleet-monitoring svc/prometheus 9090:9090
```

### View Metrics

Backend metrics are available at:
```
http://<backend-service>/metrics
```

## Troubleshooting

### Check pod status

```bash
kubectl get pods -n fleet-app
kubectl get pods -n fleet-data
kubectl get pods -n fleet-monitoring
```

### View logs

```bash
# Backend logs
kubectl logs -f -n fleet-app -l app=fleet-backend

# Database logs
kubectl logs -f -n fleet-data -l app=postgres

# Prometheus logs
kubectl logs -f -n fleet-monitoring -l app=prometheus
```

### Check HPA status

```bash
kubectl get hpa -n fleet-app
kubectl describe hpa fleet-backend-hpa -n fleet-app
```

### Database connection issues

```bash
# Test database connectivity
kubectl run -it --rm psql-test \
  --image=postgres:16-alpine \
  --restart=Never \
  -n fleet-data \
  -- psql -h postgres.fleet-data.svc.cluster.local \
         -U fleetuser \
         -d FleetManagement
```

### Ingress not working

```bash
# Check ingress status
kubectl get ingress -n fleet-app
kubectl describe ingress fleet-backend-ingress -n fleet-app

# Check cert-manager certificates
kubectl get certificates -n fleet-app
kubectl describe certificate fleet-backend-tls -n fleet-app
```

## Development

### Lint the chart

```bash
helm lint .
```

### Template rendering (dry-run)

```bash
helm template fleet-dev . -f values-dev.yaml --debug
```

### Package the chart

```bash
helm package .
```

## Contributing

Contributions are welcome! Please submit pull requests or issues to the repository.

## License

[Your License Here]

## Support

For support, please contact: devops@yourdomain.com
