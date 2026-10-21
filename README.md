# FOTA Deployment Readiness Dashboard

A browser-based engineering demonstration that evaluates whether a connected vehicle meets key prerequisites before a firmware over-the-air (FOTA) update begins.

The dashboard turns vehicle conditions into a clear **Ready for update** or **Update blocked** decision and explains every gate in plain language.

## Live demonstration

https://fota-deployment-readiness-dashboard.blondlamb6.chatgpt.site

## Purpose

Starting a vehicle software update under unsafe or unstable conditions can lead to an incomplete installation or an unavailable module. This project demonstrates a pre-installation gate for power, battery charge, vehicle state, connectivity, storage, and diagnostic health.

## Capabilities

- Seven independent readiness checks
- Ready and blocked scenario presets
- Plain-language PASS/BLOCK explanations
- Downloadable readiness report
- Responsive, accessible interface
- Automated boundary and failure-path tests
- Rootless Docker delivery with a health check
- Hardened Kubernetes deployment with probes and resource limits

## Decision rules

| Condition | Demonstration rule |
|---|---|
| 12 V voltage | 12.2–14.8 V |
| Battery charge | At least 70% |
| Vehicle state | Parked |
| Ignition | Off |
| Network | Stable |
| Storage | At least 4 GB |
| Diagnostics | No blocking DTCs |

These are illustrative thresholds, not an OEM service specification.

## Run locally

No dependencies or build step are required:

```powershell
python -m http.server 8000 -d dist
```

Open `http://localhost:8000`.

## Run automated tests

```powershell
npm test
```

## Run with Docker

```powershell
docker build -t fota-readiness-dashboard:1.0.0 .
docker run -d --name fota-readiness -p 8083:8080 fota-readiness-dashboard:1.0.0
```

Open `http://localhost:8083`.

## Deploy to Docker Desktop Kubernetes

```powershell
kubectl apply -f k8s/fota-readiness.yaml
kubectl get pods
kubectl get service fota-readiness-service
```

Open `http://localhost:30081`. If NodePort access is unavailable, use:

```powershell
kubectl port-forward service/fota-readiness-service 8084:8080
```

Then open `http://localhost:8084`.

## Architecture

- `dist/index.html` — semantic interface structure
- `dist/styles.css` — responsive visual system
- `dist/logic.js` — reusable readiness decision engine
- `dist/app.js` — interface controls, results, presets, and report export
- `tests/` — automated readiness tests
- `Dockerfile` and `docker-compose.yml` — container delivery
- `k8s/fota-readiness.yaml` — hardened Kubernetes deployment and service

## Security and production scope

This application demonstrates a readiness gate only. A production FOTA platform would additionally require authenticated metadata, digitally signed packages, certificate validation, secure key storage, anti-rollback controls, secure boot, recovery behavior, and OEM-specific safety requirements.

## Author

Harold L. R. Watkins — automotive diagnostics, software verification, and connected-vehicle cybersecurity.

## License

MIT
