# How to securely deploy the Patient Browser Application in same container as a FHIR server

## Introduction

Instructions are provided below for a configuration to securely deploy the Patient Browser Application as a servlet in the same container as a FHIR server. THe Patient Browser application will be, an additional protected resource to the FHIR server, deployed on Liberty. Users with correct security role to access the Patient Browser application are configured within the Liberty basic user registry.

THe base FHIR deployment used is as per helm chart [here](https://github.com/Alvearie/health-patterns/blob/main/helm-charts/fhir/chart/README.md) but modified to include deployment of the Patient Browser application as a protected servlet resource running on the same LIberty server and in the same container.

## Pre-requisites

- Kubernetes cluster 1.10+
- Helm 3.0.0+
- Docker Hub repository created with name <docker username>/local-fhir-server and logged in to docker hub from command line (using docker login -u <docker usernmame>)

## Deployment

### Checkout the Patient Browser Code

Git clone this repository and `cd` into this directory.

```bash
git clone https://github.com/Alvearie/patient-browser
```

### Package Patient Browser application as a war - Patient-Browser.war

Modify default.json5 in the build/config directory to have following path to FHIR server configured;

http://127.0.0.1:8080/fhir-server/api/v4

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

### Modifications to FHIR server chart

Git clone this repository and `cd` into this directory.

```bash
git clone https://github.com/Alvearie/health-patterns.git
cd health-patterns/helm-charts/fhir/chart
```

Modify values.yaml to point to full deployment docker image as illustrated below;

```
image:
  repository: <docker username>/ibm-fhir-server
  pullPolicy: IfNotPresent
  tag: <tag number>
```

`cd` into config directory and modify server.xml as follows.

Include the following web application definition;

```
<webApplication contextRoot="patient-browser" id="patient-browser" location="Patient-Browser.war" name="patient-browser">
        <application-bnd>
                        <security-role name="FHIRUsersRole">
                                <group name="FHIRUsers"/>
                        </security-role>
        </application-bnd>
    </webApplication>
```

Modify the <webAppSecurity> element as follows;

```
<webAppSecurity allowFailOverToBasicAuth="true" singleSignonEnabled="true"/>
```

### Deploy modified chart

`cd` back to chart directory and deploy chart with release name fhir;

```bash
helm install fhir .
```

### Accessing the Patient Browser Deployment

To access the deployment outside the cluster at this URL -> http://127.0.0.1:8080/patient-browser need to do port mapping for 8080 as follows;

Get the <pod name> of running deployment using;

```bash
kubectl get pods -n <your namespace>
```

Get credentials by running the following;

```bash
kubectl exec -it <pod name> -n paul-dev bash
cat server.xml | grep -A2 FHIR_USER_PASSWORD
```

and run the following to enable the required port forwarding;

```bash
kubectl --namespace paul-dev port-forward <pod name> 8080:8080
```
