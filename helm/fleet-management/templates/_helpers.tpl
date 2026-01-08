{{/*
Expand the name of the chart.
*/}}
{{- define "fleet-management.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "fleet-management.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "fleet-management.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "fleet-management.labels" -}}
helm.sh/chart: {{ include "fleet-management.chart" . }}
{{ include "fleet-management.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
environment: {{ .Values.global.environment }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "fleet-management.selectorLabels" -}}
app.kubernetes.io/name: {{ include "fleet-management.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "fleet-management.backend.labels" -}}
{{ include "fleet-management.labels" . }}
app: {{ .Values.backend.name }}
component: api
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "fleet-management.backend.selectorLabels" -}}
app: {{ .Values.backend.name }}
{{- end }}

{{/*
PostgreSQL labels
*/}}
{{- define "fleet-management.postgresql.labels" -}}
{{ include "fleet-management.labels" . }}
app: {{ .Values.postgresql.name }}
component: database
{{- end }}

{{/*
PostgreSQL selector labels
*/}}
{{- define "fleet-management.postgresql.selectorLabels" -}}
app: {{ .Values.postgresql.name }}
{{- end }}

{{/*
Prometheus labels
*/}}
{{- define "fleet-management.prometheus.labels" -}}
{{ include "fleet-management.labels" . }}
app: {{ .Values.prometheus.name }}
component: monitoring
{{- end }}

{{/*
Prometheus selector labels
*/}}
{{- define "fleet-management.prometheus.selectorLabels" -}}
app: {{ .Values.prometheus.name }}
{{- end }}

{{/*
Grafana labels
*/}}
{{- define "fleet-management.grafana.labels" -}}
{{ include "fleet-management.labels" . }}
app: {{ .Values.grafana.name }}
component: visualization
{{- end }}

{{/*
Grafana selector labels
*/}}
{{- define "fleet-management.grafana.selectorLabels" -}}
app: {{ .Values.grafana.name }}
{{- end }}

{{/*
Create the name of the service account to use for backend
*/}}
{{- define "fleet-management.backend.serviceAccountName" -}}
{{- if .Values.backend.serviceAccount.create }}
{{- default .Values.backend.serviceAccount.name .Values.backend.name }}
{{- else }}
{{- default "default" .Values.backend.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use for Prometheus
*/}}
{{- define "fleet-management.prometheus.serviceAccountName" -}}
{{- if .Values.prometheus.serviceAccount.create }}
{{- default .Values.prometheus.serviceAccount.name .Values.prometheus.name }}
{{- else }}
{{- default "default" .Values.prometheus.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
PostgreSQL connection string
*/}}
{{- define "fleet-management.postgresql.connectionString" -}}
Host={{ .Values.postgresql.name }}.{{ .Values.namespaces.data }}.svc.cluster.local;Port=5432;Database={{ .Values.postgresql.auth.database }};Username={{ .Values.postgresql.auth.username }};Password={{ .Values.postgresql.auth.password }};
{{- end }}
