# Patient Browser

# Table of Contents
- [Welcome to patient-browser](#patient-browser)
- [How to deploy](#how-to-deploy)
- [Using patient-browser](#using-patient-browser)

## Welcome to Patient Browser

The LinuxForHealth Patient Browser is an easy to use, standalone application that allows easy access to data stored in a FHIR server.  The UI displays the data at the top level organized by patient.  You can then drill into other resources related to that patient.  Navigation is page by page or patient by patient.

The LinuxForHealth Patient Browser app is based on the [SMART on FHIR Patient Browser](https://github.com/smart-on-fhir/patient-browser)

## How to deploy

Instructions for a default deployment configuration are provided below where the Patient Browser application is deployed in a separate container to that of the FHIR server.

Instructions are provided [here](https://github.com/LinuxForHealth/patient-browser/tree/master/security/README.md) for a configuration to securely deploy the Patient Browser Application as a servlet in the same container as a FHIR server where the Patient Browser application will be just an additional protected resource to the FHIR server on Liberty.

Instructions are provided [here](https://github.com/LinuxForHealth/patient-browser/tree/master/security/README-Health-Data-Access-Pattern_Integration.md) for a configuration to securely deploy the Patient Browser Application by integrating with a FHIR server protected by a SMART App Launch authorization server that is built on Keycloak, as per the [Health Data Access Reference Implementation](https://github.com/LinuxForHealth/health-patterns/tree/main/data-access).

## Default Deployment Configuration 

### Pre-Requisites

- Kubernetes cluster 1.10+
- Helm 3.0.0+
- A running FHIR server (with the `$everything` operation)

### Checkout the Code

Git clone this repository and `cd` into the `chart` directory.

```bash
git clone https://github.com/LinuxForHealth/patient-browser
cd patient-browser/chart
```

### Install the Chart

In order to install the helm chart, you must provide the URL of a FHIR server and the base ingress hostname.

**Important:**
- The FHIR server URL needs to be reachable from your browser, i.e. from your computer
- The FHIR server needs to be unauthenticated. When deploying along with [Health Patterns](https://github.com/LinuxForHealth/health-patterns), there is a FHIR Proxy Chart that can remove the authentication of an IBM FHIR server. **Note:** although these instructions are for an unauthenticated FHIR server, there are some additional options [here](https://github.com/LinuxForHealth/patient-browser/tree/master/security).
- In order to expose the FHIR server, an ingress can be created by including ingress.class and ingress.hostname values.

```bash
helm install fhir-ui . --set fhirServer=https://{my-fhir-server} --set ingress.hostname={INGRESS_HOSTNAME}
```

`INGRESS_HOSTNAME` refers to the pre-determined domain name that will be used to access your FHIR Patient Browser instance.

## Using patient-browser

Access your FHIR UI at: `https://<<INGRESS_HOSTNAME>>/patient-browser/`

### Uninstallation

To uninstall/delete the `fhir-ui` deployment:

```bash
helm delete fhir-ui
```

Further details can be found in `src/README.md`
