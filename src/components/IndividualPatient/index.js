import React from "react";
import PropTypes from "prop-types";
import PatientImage from "../PatientImage";
import Loader from "../Loader";
import { connect } from "react-redux";
import $ from "jquery";
import DialogFooter from "../DialogFooter";
import { queryBuilder } from "../../redux/query";
import Observations from "../Fhir/Observation";
import ImmunizationList from "../Fhir/ImmunizationList";
import ConditionList from "../Fhir/ConditionList";
import Encounter from "../Fhir/Encounter";
import CarePlan from "../Fhir/CarePlan";
import Person from "../Fhir/Person";
import ResourceList from "../Fhir/ResourceList";
import {
  getErrorMessage,
  getPatientName,
  getPatientPhone,
  getPatientEmail,
  getPatientHomeAddress,
  getPatientAge,
  getPath,
  getPatientMRN,
  getAllPages,
} from "../../lib";
import "../PatientDetail/PatientDetail.less";

/**
 * Renders the individual patient details page.
 */
export class IndividualPatient extends React.Component {
  static propTypes = {
    match: PropTypes.object,
    settings: PropTypes.object,
    query: PropTypes.object,
  };

  constructor(...args) {
    super(...args);
    this.query = queryBuilder.clone();
    this.state = {
      loading: true,
      error: null,
      conditions: [],
      patient: {},
      groups: {},
      selectedSubCat: "",
      bundle: $.isEmptyObject(this.props.query.bundle)
        ? null
        : { ...this.props.query.bundle },
    };
  }

  componentDidMount() {
    this.fetch(this.props.match.params.patientId);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.match.params.patientId !== this.props.match.params.patientId) {
      this.fetch(newProps.match.params.patientId);
    }
  }

  fetch(patientId) {
    this.setState({ loading: true, patientId }, () => {
      this.fetchPatient(this.props.settings.server, patientId)
        .then((state) => {
          this.setState({
            ...state,
            error: null,
            loading: false,
          });
        })
        .catch((error) => {
          this.setState({
            loading: false,
            error,
          });
        });
    });
  }

  fetchPatient(server, patientId) {
    return (
      Promise.resolve({ ...this.state })

        // Find $everything for this patient id
        .then((state) => {
          return getAllPages({
            url: `${server.url}/Patient/${patientId}/$everything?_count=500`,
          }).then((data) => {
            let groups = {};
            data.forEach((entry) => {
              let resourceType =
                getPath(entry, "resource.resourceType") || "Other";
              let type = resourceType;

              if (type == "Observation") {
                let subCat = String(
                  getPath(entry, "resource.category.0.text") ||
                    getPath(entry, "resource.category.coding.0.code") ||
                    getPath(entry, "resource.category.0.coding.0.code") ||
                    "Other"
                ).toLowerCase();

                subCat = subCat
                  .split(/\-+/)
                  .map((token) => {
                    return token.charAt(0).toUpperCase() + token.substr(1);
                  })
                  .join(" ");
                type += " - " + subCat;
              }

              if (!Array.isArray(groups[type])) {
                groups[type] = [];
              }
              groups[type].push(entry);
            });
            state.groups = groups;
            state.patient = groups.Patient[0].resource;
            return state;
          });
        })

        // Feed the results to the app
        .then(
          (state) => Promise.resolve(state),
          (error) => Promise.reject(new Error(getErrorMessage(error)))
        )
    );
  }

  // Rendering methods -------------------------------------------------------

  renderPatient() {
    if (this.state.error) {
      return this.state.error + "";
    }

    return (
      <div className="panel panel-default patient col-xs-12">
        <div className="row">
          {this.state.loading ? <Loader /> : null}
          <div className="col-xs-2 col-sm-2 col-md-1">
            <div className="embed-responsive">
              <PatientImage
                patient={this.state.patient}
                className="embed-responsive-item"
                base={this.props.settings.server.url}
              />
            </div>
          </div>
          <div className="col-xs-10 col-md-11">
            <div className="patient-row">
              <div className="col-xs-7 patient-name">
                <h3 className="pull-left text-primary">
                  {getPatientName(this.state.patient) ||
                    (this.state.loading ? "loading..." : "Unknown")}
                </h3>
              </div>

              <div className="col-xs-5 text-right" style={{ paddingRight: 0 }}>
                <button
                  type="button"
                  className="btn btn-default btn-sm"
                  onClick={() => this.fetch(this.props.match.params.patientId)}
                >
                  <i className="fa fa-refresh" /> Reload
                </button>
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">
                Gender:
              </div>
              <div className="col-xs-8 col-sm-3 col-lg-3 text-left">
                {this.state.patient.gender ||
                  (this.state.loading ? "loading..." : "Unknown")}
              </div>
              <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">
                DOB:
              </div>
              <div className="col-xs-8 col-sm-5 col-lg-3 text-left">
                {this.state.patient.birthDate ||
                  (this.state.loading ? "loading..." : "Unknown")}
              </div>

              <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">
                Age:
              </div>
              <div className="col-xs-8 col-sm-3 col-lg-3 text-left">
                {getPatientAge(this.state.patient) ||
                  (this.state.loading ? "loading..." : "Unknown")}
              </div>
              <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">
                Email
              </div>
              <div className="col-xs-8 col-sm-5 col-lg-3 text-left">
                {getPatientEmail(this.state.patient) ||
                  (this.state.loading ? "loading..." : "Unknown")}
              </div>
              <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">
                Phone:
              </div>
              <div className="col-xs-8 col-sm-3 col-lg-3 text-left">
                {getPatientPhone(this.state.patient) ||
                  (this.state.loading ? "loading..." : "Unknown")}
              </div>
              <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">
                Address:
              </div>
              <div className="col-xs-8 col-sm-5 col-lg-3 text-left">
                {getPatientHomeAddress(this.state.patient) ||
                  (this.state.loading ? "loading..." : "Unknown")}
              </div>
              <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">
                ID:
              </div>
              <div className="col-xs-8 col-sm-3 col-lg-3 text-left">
                {this.state.patient.id ||
                  (this.state.loading ? "loading..." : "Unknown")}
              </div>
              <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">
                MRN:
              </div>
              <div className="col-xs-8 col-sm-5 col-lg-3 text-left">
                {getPatientMRN(this.state.patient) ||
                  (this.state.loading ? "loading..." : "Unknown")}
              </div>
              {this.state.patient.deceasedBoolean ||
              this.state.patient.deceasedDateTime ? (
                <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">
                  <span className="deceased-label">Deceased:</span>
                </div>
              ) : null}
              {this.state.patient.deceasedBoolean ||
              this.state.patient.deceasedDateTime ? (
                <div className="col-xs-8 col-sm-5 col-lg-3 text-left">
                  {this.state.patient.deceasedDateTime ? (
                    <span>{this.state.patient.deceasedDateTime}</span>
                  ) : (
                    <span>
                      {this.state.patient.deceasedBoolean ? "Yes" : "No"}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderResources(type) {
    let items = this.state.groups[type] || [];
    if (!items.length) {
      return (
        <p className="text-center text-muted">
          No items of type "{type}" found
        </p>
      );
    }

    if (type.indexOf("Observation") === 0) {
      return <Observations resources={items} />;
    }

    switch (type) {
      case "Immunization":
        return (
          <ImmunizationList resources={items} settings={this.props.settings} />
        );
      case "Condition":
        return (
          <ConditionList resources={items} settings={this.props.settings} />
        );
      case "Encounter":
        return <Encounter resources={items} />;
      case "CarePlan":
        return <CarePlan resources={items} />;
      case "Patient":
      case "Practitioner":
      case "RelatedPerson":
        return <Person resources={items} title={type} />;
      default:
        return (
          <ResourceList
            resources={items}
            type={type}
            settings={this.props.settings}
          />
        );
    }
  }

  render() {
    if (Object.keys(this.state.patient).length === 0 && !this.state.loading) {
      return (
        <div className="col-xs-12 text-muted text-center">
          <h3>Patient not found.</h3>
        </div>
      );
    }
    let groups = Object.keys(this.state.groups).sort();
    let selectedSubCat = this.state.selectedSubCat;
    if (!selectedSubCat || !this.state.groups[selectedSubCat]) {
      selectedSubCat = Object.keys(this.state.groups)[0] || "";
    }

    return (
      <div className="page patient-detail-page">
        <div className="container">
          {this.renderPatient()}

          {groups.length ? (
            <div className="row patient-details">
              <br />
              <div className="col-xs-12 col-sm-3">
                <ul className="list-group">
                  {groups.map((k, i) => (
                    <a
                      href="#"
                      key={i}
                      className={
                        "list-group-item" +
                        (k === selectedSubCat ? " active" : "")
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        this.setState({
                          selectedSubCat: k,
                        });
                      }}
                    >
                      <b className="badge pull-right">
                        {this.state.groups[k].length}
                      </b>
                      <b>{k}</b>
                    </a>
                  ))}
                </ul>
              </div>
              <div className="col-xs-12 col-sm-9">
                {this.renderResources(selectedSubCat)}
              </div>
            </div>
          ) : this.state.loading ? null : (
            <div className="row">
              <div className="col-xs-12 text-muted text-center">
                No additional details for this patient
              </div>
            </div>
          )}
        </div>
        {window.opener || (window.parent && window.parent !== window) ? (
          <nav className="navbar navbar-default navbar-fixed-bottom">
            <div className="container-fluid" style={{ width: "100%" }}>
              <div className="row">
                <div className="col-xs-12" style={{ paddingTop: 8 }}>
                  <DialogFooter />
                </div>
              </div>
            </div>
          </nav>
        ) : null}
      </div>
    );
  }
}

export default connect((state) => state)(IndividualPatient);
