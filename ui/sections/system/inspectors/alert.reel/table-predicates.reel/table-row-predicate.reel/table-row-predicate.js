/**
 * @module ui/table-row-port.reel
 */
var Component = require("montage/ui/component").Component,
    AlertService = require("core/service/alert-service").AlertService;

/**
 * @class TableRowPredicate
 * @extends Component
 */
exports.TableRowPredicate = Component.specialize({

    classOperators: {
        value: [
                    {
                        "label": "'=='",
                        "value": "=="
                    },
                    {
                        "label": "'!='",
                        "value": "!="
                    }
                ]
    },

    templateDidLoad: {
        value: function () {
            var self = this;
            this._service = AlertService.instance;
            this._service.listAlertClasses().then(function (alertClasses) {
                self.classValues = alertClasses.map(function (x) {
                    return {
                        label: x.id,
                        value: x.id
                    };
                });
            });
            this._service.listAlertSeverities().then(function (alertSeverities) {
                self.severityValues = alertSeverities.map(function (x) {
                    return {
                        label: x,
                        value: x
                    };
                });
            });
        }
    }
});
