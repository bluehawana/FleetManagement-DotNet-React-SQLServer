.PHONY: help build test deploy clean docker-build docker-push k8s-deploy k8s-delete logs status

# Variables
PROJECT_NAME = fleet-management
BACKEND_IMAGE = ghcr.io/$(GITHUB_USER)/fleet-backend
FRONTEND_IMAGE = ghcr.io/$(GITHUB_USER)/fleet-frontend
VERSION ?= $(shell git rev-parse --short HEAD)
NAMESPACE = fleet-app

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Fleet Management System - DevOps Makefile$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Development

dev: ## Start development environment with Docker Compose
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "$(YELLOW)Backend:$(NC) http://localhost:5001"
	@echo "$(YELLOW)Grafana:$(NC) http://localhost:3001 (admin/fleetadmin)"
	@echo "$(YELLOW)Prometheus:$(NC) http://localhost:9090"

dev-logs: ## Tail development logs
	docker-compose logs -f

dev-stop: ## Stop development environment
	@echo "$(RED)Stopping development environment...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

dev-clean: ## Clean development environment (removes volumes)
	@echo "$(RED)Cleaning development environment...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)✓ Environment cleaned$(NC)"

##@ Build & Test

build: ## Build .NET backend
	@echo "$(GREEN)Building backend...$(NC)"
	cd backend && dotnet restore
	cd backend && dotnet build --configuration Release
	@echo "$(GREEN)✓ Build complete$(NC)"

test: ## Run unit tests
	@echo "$(GREEN)Running tests...$(NC)"
	cd backend && dotnet test --configuration Release --verbosity normal
	@echo "$(GREEN)✓ Tests complete$(NC)"

test-coverage: ## Run tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	cd backend && dotnet test \
		--configuration Release \
		--collect:"XPlat Code Coverage" \
		--results-directory ./coverage
	@echo "$(GREEN)✓ Coverage report generated in backend/coverage$(NC)"

lint: ## Run code linting
	@echo "$(GREEN)Running linting...$(NC)"
	cd backend && dotnet format --verify-no-changes
	@echo "$(GREEN)✓ Linting complete$(NC)"

security-scan: ## Run security vulnerability scan
	@echo "$(GREEN)Scanning for vulnerabilities...$(NC)"
	cd backend && dotnet list package --vulnerable --include-transitive
	@echo "$(GREEN)✓ Security scan complete$(NC)"

##@ Docker

docker-build: ## Build Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker build -t $(BACKEND_IMAGE):$(VERSION) -t $(BACKEND_IMAGE):latest ./backend
	@echo "$(GREEN)✓ Docker images built$(NC)"

docker-push: ## Push Docker images to registry
	@echo "$(GREEN)Pushing Docker images...$(NC)"
	docker push $(BACKEND_IMAGE):$(VERSION)
	docker push $(BACKEND_IMAGE):latest
	@echo "$(GREEN)✓ Docker images pushed$(NC)"

docker-scan: ## Scan Docker image for vulnerabilities
	@echo "$(GREEN)Scanning Docker image...$(NC)"
	docker scout cves $(BACKEND_IMAGE):latest || \
	trivy image --severity HIGH,CRITICAL $(BACKEND_IMAGE):latest
	@echo "$(GREEN)✓ Image scan complete$(NC)"

##@ Kubernetes

k8s-ns: ## Create Kubernetes namespaces
	@echo "$(GREEN)Creating namespaces...$(NC)"
	kubectl apply -f k8s/base/namespace.yaml
	@echo "$(GREEN)✓ Namespaces created$(NC)"

k8s-secrets: ## Create Kubernetes secrets
	@echo "$(GREEN)Creating secrets...$(NC)"
	kubectl apply -f k8s/base/postgres-statefulset.yaml -n fleet-data
	@echo "$(GREEN)✓ Secrets created$(NC)"

k8s-deploy: k8s-ns k8s-secrets ## Deploy to Kubernetes
	@echo "$(GREEN)Deploying to Kubernetes...$(NC)"
	kubectl apply -f k8s/base/postgres-statefulset.yaml
	kubectl apply -f k8s/base/backend-deployment.yaml
	@echo "$(GREEN)✓ Deployment complete$(NC)"
	@echo "$(YELLOW)Waiting for pods to be ready...$(NC)"
	kubectl wait --for=condition=ready pod -l app=postgres -n fleet-data --timeout=5m
	kubectl wait --for=condition=ready pod -l app=fleet-backend -n fleet-app --timeout=5m
	@echo "$(GREEN)✓ All pods are ready$(NC)"
	@$(MAKE) k8s-status

k8s-update: ## Update Kubernetes deployment
	@echo "$(GREEN)Updating deployment...$(NC)"
	kubectl set image deployment/fleet-backend \
		backend=$(BACKEND_IMAGE):$(VERSION) \
		-n $(NAMESPACE)
	kubectl rollout status deployment/fleet-backend -n $(NAMESPACE)
	@echo "$(GREEN)✓ Update complete$(NC)"

k8s-rollback: ## Rollback Kubernetes deployment
	@echo "$(RED)Rolling back deployment...$(NC)"
	kubectl rollout undo deployment/fleet-backend -n $(NAMESPACE)
	kubectl rollout status deployment/fleet-backend -n $(NAMESPACE)
	@echo "$(GREEN)✓ Rollback complete$(NC)"

k8s-status: ## Show Kubernetes deployment status
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Kubernetes Status$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@echo "\n$(YELLOW)Namespaces:$(NC)"
	@kubectl get ns | grep fleet
	@echo "\n$(YELLOW)Pods:$(NC)"
	@kubectl get pods -n fleet-app
	@kubectl get pods -n fleet-data
	@echo "\n$(YELLOW)Services:$(NC)"
	@kubectl get svc -n fleet-app
	@kubectl get svc -n fleet-data
	@echo "\n$(YELLOW)Deployments:$(NC)"
	@kubectl get deployments -n fleet-app
	@echo "\n$(YELLOW)HPA:$(NC)"
	@kubectl get hpa -n fleet-app
	@echo ""

k8s-logs: ## Tail Kubernetes logs
	@echo "$(GREEN)Tailing backend logs...$(NC)"
	kubectl logs -f -l app=fleet-backend -n $(NAMESPACE) --max-log-requests=10

k8s-exec: ## Execute shell in backend pod
	@echo "$(GREEN)Opening shell in backend pod...$(NC)"
	kubectl exec -it $$(kubectl get pod -l app=fleet-backend -n $(NAMESPACE) -o jsonpath='{.items[0].metadata.name}') -n $(NAMESPACE) -- /bin/sh

k8s-delete: ## Delete Kubernetes resources
	@echo "$(RED)Deleting Kubernetes resources...$(NC)"
	kubectl delete -f k8s/base/backend-deployment.yaml || true
	kubectl delete -f k8s/base/postgres-statefulset.yaml || true
	@echo "$(GREEN)✓ Resources deleted$(NC)"

k8s-describe: ## Describe backend deployment
	kubectl describe deployment fleet-backend -n $(NAMESPACE)
	kubectl describe hpa fleet-backend-hpa -n $(NAMESPACE)

##@ Database

db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	cd backend && dotnet ef database update --project FleetManagement.Infrastructure --startup-project FleetManagement.API
	@echo "$(GREEN)✓ Migrations complete$(NC)"

db-seed: ## Seed database with test data
	@echo "$(GREEN)Seeding database...$(NC)"
	curl -X POST http://localhost:5001/api/seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

db-backup: ## Backup PostgreSQL database
	@echo "$(GREEN)Backing up database...$(NC)"
	docker exec fleet-postgres pg_dump -U fleetuser FleetManagement > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup complete$(NC)"

db-restore: ## Restore PostgreSQL database
	@echo "$(RED)Restoring database...$(NC)"
	@read -p "Enter backup file path: " backup_file; \
	docker exec -i fleet-postgres psql -U fleetuser FleetManagement < $$backup_file
	@echo "$(GREEN)✓ Restore complete$(NC)"

##@ Monitoring

metrics: ## Open Prometheus metrics
	@echo "$(YELLOW)Opening Prometheus...$(NC)"
	open http://localhost:9090

grafana: ## Open Grafana dashboards
	@echo "$(YELLOW)Opening Grafana...$(NC)"
	open http://localhost:3001

health: ## Check service health
	@echo "$(GREEN)Checking service health...$(NC)"
	@echo "\n$(YELLOW)Backend:$(NC)"
	@curl -s http://localhost:5001/metrics | head -5 || echo "$(RED)✗ Backend not responding$(NC)"
	@echo "\n$(YELLOW)Prometheus:$(NC)"
	@curl -s http://localhost:9090/-/healthy || echo "$(RED)✗ Prometheus not responding$(NC)"
	@echo "\n$(YELLOW)Grafana:$(NC)"
	@curl -s http://localhost:3001/api/health | jq '.' || echo "$(RED)✗ Grafana not responding$(NC)"
	@echo ""

load-test: ## Run load test with k6
	@echo "$(GREEN)Running load test...$(NC)"
	k6 run scripts/load-test.js || echo "$(YELLOW)k6 not installed. Run: brew install k6$(NC)"

##@ CI/CD

ci: build test security-scan ## Run CI pipeline locally
	@echo "$(GREEN)✓ CI pipeline complete$(NC)"

cd: docker-build docker-push k8s-update ## Run CD pipeline
	@echo "$(GREEN)✓ CD pipeline complete$(NC)"

pipeline: ci cd ## Run full CI/CD pipeline
	@echo "$(GREEN)✓ Full pipeline complete$(NC)"

##@ Utilities

clean: ## Clean build artifacts
	@echo "$(GREEN)Cleaning artifacts...$(NC)"
	cd backend && dotnet clean
	rm -rf backend/*/bin backend/*/obj
	@echo "$(GREEN)✓ Clean complete$(NC)"

version: ## Show current version
	@echo "$(YELLOW)Version:$(NC) $(VERSION)"
	@echo "$(YELLOW)Git Branch:$(NC) $(shell git branch --show-current)"
	@echo "$(YELLOW)Git Commit:$(NC) $(shell git rev-parse HEAD)"

port-forward: ## Forward Kubernetes service ports
	@echo "$(GREEN)Forwarding ports...$(NC)"
	kubectl port-forward -n $(NAMESPACE) svc/fleet-backend 5001:5000 &
	kubectl port-forward -n fleet-monitoring svc/grafana 3001:3000 &
	kubectl port-forward -n fleet-monitoring svc/prometheus 9090:9090 &
	@echo "$(GREEN)✓ Ports forwarded$(NC)"
	@echo "$(YELLOW)Backend:$(NC) http://localhost:5001"
	@echo "$(YELLOW)Grafana:$(NC) http://localhost:3001"
	@echo "$(YELLOW)Prometheus:$(NC) http://localhost:9090"

stop-forward: ## Stop port forwarding
	@echo "$(RED)Stopping port forwarding...$(NC)"
	pkill -f "kubectl port-forward" || true
	@echo "$(GREEN)✓ Port forwarding stopped$(NC)"

install-tools: ## Install required DevOps tools
	@echo "$(GREEN)Installing required tools...$(NC)"
	@echo "$(YELLOW)Checking prerequisites...$(NC)"
	@command -v docker >/dev/null 2>&1 || echo "$(RED)✗ Docker not installed$(NC)"
	@command -v kubectl >/dev/null 2>&1 || echo "$(RED)✗ kubectl not installed$(NC)"
	@command -v helm >/dev/null 2>&1 || echo "$(RED)✗ Helm not installed$(NC)"
	@command -v dotnet >/dev/null 2>&1 || echo "$(RED)✗ .NET SDK not installed$(NC)"
	@echo "$(GREEN)✓ Tool check complete$(NC)"

##@ Documentation

docs: ## Generate API documentation
	@echo "$(GREEN)Generating documentation...$(NC)"
	cd backend && dotnet swagger tofile --output ../docs/swagger.json FleetManagement.API/bin/Release/net9.0/FleetManagement.API.dll v1
	@echo "$(GREEN)✓ Documentation generated$(NC)"

# Default target
.DEFAULT_GOAL := help
