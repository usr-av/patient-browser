# How to securely deploy the Patient Browser Application in same container as a FHIR server

## Introduction

Instructions are provided below for a configuration to securely deploy the Patient Browser Application as a servlet in the same container as a FHIR server. The Patient Browser application will be an additional protected resource to the FHIR server on Liberty. Users with correct security role to access the Patient Browser application are configured within the Liberty basic user registry.

The base FHIR deployment used is as per helm chart [here](https://github.com/Alvearie/alvearie-helm/blob/main/charts/ibm-fhir-server/README.md) but configured to include deployment of the Patient Browser application as a protected servlet resource running on the same Liberty server and in the same container.

## Pre-requisites

- Kubernetes cluster 1.10+
- Helm 3.0.0+
- Docker Hub repository created with name \<docker username>/local-fhir-server and logged in to docker hub from command line (using docker login -u \<docker username>)

## Deployment

### Checkout the Patient Browser Code

Git clone this repository and `cd` into this directory.

```bash
git clone https://github.com/Alvearie/patient-browser
```

Run the following to refresh the build;
```bash
npm i
```
  
  
### Package Patient Browser application as a war - Patient-Browser.war

Modify default.json5 in the build/config directory to have following path to FHIR server configured;

https://\<INGRESS_HOSTNAME>/fhir-server/api/v4

`cd` to the security directory and create the Patient-Browser.war by running;

```bash
./build_war.sh
```

Note the creation of Patient-Browser.war in the same directory.

### Build and Push Docker Image for full deployment (FHIR server + Patient Browser war )

Build docker image;

```bash
docker build . -t <docker username>/local-fhir-server:<tag number>
```

Push docker image;

```bash
docker push <docker username>/local-fhir-server:<tag number>
```

### Deploy FHIR chart with required configuration 

Deploy passing in required parameters including pointing at required docker image \<docker username>/local-fhir-server:<tag number> by running the following;

```bash
helm repo add alvearie https://alvearie.io/alvearie-helm
export POSTGRES_PASSWORD=$(openssl rand -hex 20)
helm upgrade --install --render-subchart-notes ibm-fhir-server alvearie/ibm-fhir-server --set postgresql.postgresqlPassword=${POSTGRES_PASSWORD} 
--namespace <namespace> --set ingress.hostname=<INGRESS_HOSTNAME> --set 'ingress.annotations.nginx\.ingress\.kubernetes\.io/backend-protocol=HTTPS' --set image.repository=<docker username>/local-fhir-server --set image.tag=<tag number>  
  
```

### Accessing the Patient Browser Deployment

URL to access deployment is -> https://\<INGRESS_HOSTNAME>/patient-browser

### Getting credentials
  
Get the pod name of running deployment using;

```bash
kubectl get pods -n <your namespace>
```

Get credentials by running the following;

```bash
kubectl exec -it <pod name> -n paul-dev bash
cat server.xml | grep -A2 FHIR_USER_PASSWORD
```

