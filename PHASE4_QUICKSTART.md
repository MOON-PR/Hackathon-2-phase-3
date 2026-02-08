# 🚀 Phase 4 Quick Start Guide

## One-Command Deployment

```powershell
# Make sure Docker Desktop is running, then:
.\scripts\deploy-local.bat
```

That's it! The script will handle everything.

---

## Manual Deployment (5 Steps)

### 1️⃣ Start Minikube
```powershell
minikube start --driver=docker
```

### 2️⃣ Configure Docker
```powershell
minikube docker-env --shell powershell | Invoke-Expression
```

### 3️⃣ Build Images
```powershell
cd web-app && docker build -t todo-frontend:latest . && cd ..
cd api && docker build -t todo-backend:latest . && cd ..
```

### 4️⃣ Create Secrets
```powershell
kubectl create secret generic todo-secrets --from-env-file=api\.env
```

### 5️⃣ Deploy
```powershell
helm upgrade --install todo-app .\helm\todo-app --set frontend.image.pullPolicy=Never --set backend.image.pullPolicy=Never --wait
```

---

## Access Application

```powershell
# Get URLs
minikube service todo-frontend --url

# Or open in browser
minikube service todo-frontend
```

---

## Useful Commands

```powershell
# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -l app=todo-frontend
kubectl logs -l app=todo-backend

# Cleanup
.\scripts\cleanup.bat
```

---

## Troubleshooting

**Pods not starting?**
```powershell
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

**Can't access service?**
```powershell
minikube service list
minikube tunnel  # Run in separate terminal
```

**Need to rebuild?**
```powershell
.\scripts\cleanup.bat
.\scripts\deploy-local.bat
```

---

**Full documentation**: See `PHASE4_DEPLOYMENT.md`
