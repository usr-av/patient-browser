# Patient Browser

# Table of Contents
- [Welcome to patient-browser](#patient-browser)
- [How to deploy](#how-to-deploy)
- [Using patient-browser](#using-patient-browser)

## Welcome to Patient Browser

The Alvearie Patient Browser is an easy to use, standalone application that allows easy access to data stored in a FHIR server.  The UI displays the data at the top level organized by patient.  You can then drill into other resources related to that patient.  Navigation is page by page or patient by patient.

The Alvearie Patient Browser app is based on the [SMART on FHIR Patient Browser](https://github.com/smart-on-fhir/patient-browser)

## How to deploy

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

Access your FHIR UI at: `http://<<INGRESS_HOSTNAME>>/index.html`

### Uninstallation

To uninstall/delete the `fhir-ui` deployment:

```bash
helm delete fhir-ui
```

Further details can be found in `src/README.md`
