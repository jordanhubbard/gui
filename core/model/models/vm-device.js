var AbstractModel = require("core/model/abstract-model").AbstractModel;

exports.VmDevice = AbstractModel.specialize({
    _config: {
        value: null
    },
    config: {
        set: function (value) {
            if (this._config !== value) {
                this._config = value;
            }
        },
        get: function () {
            return this._config;
        }
    },
    _name: {
        value: null
    },
    name: {
        set: function (value) {
            if (this._name !== value) {
                this._name = value;
            }
        },
        get: function () {
            return this._name;
        }
    },
    _properties: {
        value: null
    },
    properties: {
        set: function (value) {
            if (this._properties !== value) {
                this._properties = value;
            }
        },
        get: function () {
            return this._properties;
        }
    },
    _type: {
        value: null
    },
    type: {
        set: function (value) {
            if (this._type !== value) {
                this._type = value;
            }
        },
        get: function () {
            return this._type;
        }
    }
}, {
    propertyBlueprints: {
        value: [{
            mandatory: true,
            name: "config",
            valueType: "object"
        }, {
            mandatory: false,
            name: "name",
            valueType: "String"
        }, {
            mandatory: true,
            name: "properties",
            valueType: "object"
        }, {
            mandatory: true,
            name: "type",
            valueObjectPrototypeName: "VmDeviceType",
            valueType: "object"
        }]
    },
    userInterfaceDescriptor: {
        value: {
            collectionInspectorComponentModule: {
                id: 'ui/controls/viewer.reel'
            },
            collectionNameExpression: "'Devices'",
            inspectorComponentModule: {
                id: 'ui/inspectors/virtual-machine-device.reel'
            },
            creatorComponentModule: {
                id: 'ui/inspectors/virtual-machine-device.reel'
            },
            nameExpression: "_isNew.defined() && _isNew ? 'New Device' : name"
        }
    }
});