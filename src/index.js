import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { Provider } from "react-redux";
import STORE from "./redux";
import PatientDetail from "./components/PatientDetail";
import PatientList from "./components/PatientList";
import { Router, Route, Switch } from "react-router";
import createHistory from "history/createHashHistory";
import jQuery from "jquery";
import Keycloak from "keycloak-js";
import JSON5 from "json5";
import { parseQueryString } from "./lib";

window.$ = window.jQuery = jQuery;

let authEnabled = false;
const DEFAULT_CONFIG = "default";
let { config, ...params } = parseQueryString(window.location.search);

jQuery.ajax({
  url: `./config/${config || DEFAULT_CONFIG}.json5`,
  dataType: "text",
  cache: false,
  async: false,
  success: (json) => {
    json = JSON5.parse(json);
    authEnabled = json.authEnabled;
  },
});

if (authEnabled) {
  let keycloak = new Keycloak("config/keycloak.json");

  keycloak.onTokenExpired = function () {
    keycloak.updateToken().then((refreshed) => {
      if (refreshed) {
        sessionStorage.setItem("access-token", keycloak.token);
      }
    });
  };

  keycloak
    .init({
      onLoad: "login-required",

      scope: "patient/*.read",
    })
    .then(function (authenticated) {
      if (authenticated) {
        sessionStorage.setItem("access-token", keycloak.token);

        const history = createHistory();

        ReactDOM.render(
          <Provider store={STORE}>
            <Router history={history}>
              <Switch>
                <App>
                  <Route path="/" component={PatientList} exact />
                  <Route path="/patient/:index" component={PatientDetail} />
                </App>
              </Switch>
            </Router>
          </Provider>,
          document.getElementById("main")
        );

        $(function () {
          $("body").tooltip({
            selector: ".patient-detail-page [title]",
          });
        });
      }
    })
    .catch(function () {
      alert(
        "Failed to initialize KeyCloak adapter. Check KeyCloak config file."
      );
    });
} else {
  const history = createHistory();

  ReactDOM.render(
    <Provider store={STORE}>
      <Router history={history}>
        <Switch>
          <App>
            <Route path="/" component={PatientList} exact />
            <Route path="/patient/:index" component={PatientDetail} />
          </App>
        </Switch>
      </Router>
    </Provider>,
    document.getElementById("main")
  );

  $(function () {
    $("body").tooltip({
      selector: ".patient-detail-page [title]",
    });
  });
}
