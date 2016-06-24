require('../../../core/extras/string');
require('montage/core/extras/string');
var FS = require('../fs-promise');
var Path = require('path');
var beautify = require('js-beautify').js_beautify;

var MODULE_FILE_TEMPLATE = "<REQUIRES>\n\nexports.<EXPORT_NAME> = Montage.specialize(<PROTOTYPE_DESCRIPTOR>);";
var REQUIRE_TEMPLATE = 'var <MODULE_NAME> = require("<MODULE_ID>").<MODULE_NAME>;';
var PROPERTY_TEMPLATE = '_<PROPERTY_NAME>:{value:null},<PROPERTY_NAME>:{set: function (value) {if (this._<PROPERTY_NAME> !== value) {this._<PROPERTY_NAME> = value;}}, get: function () {return this._<PROPERTY_NAME>;}}';
var PROPERTY_OBJECT_TEMPLATE = '_<PROPERTY_NAME>:{value:null},<PROPERTY_NAME>:{set: function (value) {if (this._<PROPERTY_NAME> !== value) {this._<PROPERTY_NAME> = value;}}, get: function () {return this._<PROPERTY_NAME> || (this._<PROPERTY_NAME> = new <MODULE_NAME>());}}';

var ModelObject = function ModelObject (descriptor) {
    this.name = descriptor.root.properties.name;
    this.fileName = _toFileName(descriptor.root.properties.name, "-");
    this.requires = [
        {
            name: "Montage",
            moduleId: "montage/core/core"
        }
    ];

    this.requiresMap = new Map ();
    this.requiresMap.set("montage", true);
    this.properties = [];
};

var createModelWithDescriptor = exports.createModelWithDescriptor = function createModelWithNameAndDescriptor (descriptor) {
    var model = new ModelObject(descriptor),
        propertyBlueprints = descriptor.root.properties.propertyBlueprints,
        property, propertyDescriptor, i , length;

    if (propertyBlueprints) {
        for (i = 0, length = propertyBlueprints.length; i < length; i++) {
            property = descriptor[propertyBlueprints[i]["@"]];

            propertyDescriptor = {
                name: property.properties.name,
                type: property.properties.valueType,
                mandatory: !!property.properties.mandatory
            };

            if (property.properties.valueObjectPrototypeName) {
                propertyDescriptor.objectPrototypeName = property.properties.valueObjectPrototypeName;

                if (!model.requiresMap.has(propertyDescriptor.objectPrototypeName)) {
                    model.requiresMap.set(propertyDescriptor.objectPrototypeName, true);

                    model.requires.push({
                        name: propertyDescriptor.objectPrototypeName,
                        moduleId: "core/model/models/" + _toFileName(propertyDescriptor.objectPrototypeName, "-")
                    });
                }
            }

            model.properties.push(propertyDescriptor);
        }
    }

    return model;
};


function _toFileName (name, separator) {
    return name.split(/(?=[A-Z])/).join(separator).toLowerCase();
}


ModelObject.prototype.toJS = function () {
    var PROTOTYPE_DESCRIPTOR = "", REQUIRES = "",
        i, length, property, _require;

    for (i = 0, length = this.properties.length; i < length; i++) {
        property = this.properties[i];

        if (property.objectPrototypeName && this.requiresMap.has(property.objectPrototypeName)) {
            PROTOTYPE_DESCRIPTOR += ((PROPERTY_OBJECT_TEMPLATE.replace(/<PROPERTY_NAME>/ig, property.name))
                .replace(/<MODULE_NAME>/ig, property.objectPrototypeName));
        } else {
            PROTOTYPE_DESCRIPTOR += PROPERTY_TEMPLATE.replace(/<PROPERTY_NAME>/ig, property.name);
        }

        if (length - 1 !== i) {
            PROTOTYPE_DESCRIPTOR += ",";
        }
    }

    PROTOTYPE_DESCRIPTOR = "{" + PROTOTYPE_DESCRIPTOR + "}";

    for (i = 0, length = this.requires.length; i < length; i++) {
        _require = this.requires[i];

        REQUIRES += ((REQUIRE_TEMPLATE.replace(/<MODULE_NAME>/ig, _require.name)).replace(/<MODULE_ID>/ig, _require.moduleId));
    }

    return ((MODULE_FILE_TEMPLATE.replace(/<EXPORT_NAME>/ig, this.name))
        .replace(/<PROTOTYPE_DESCRIPTOR>/ig, PROTOTYPE_DESCRIPTOR)
        .replace(/<REQUIRES>/ig, REQUIRES));
};

exports.saveModelsAtPath = function saveModelsAtPath (models, path) {
    var files = [];

    for (var i = 0, length = models.length; i < length; i++) {
        files.push(saveModelWithPathAndFileName(models[i], path));
    }

    return Promise.all(files);
};

var saveModelWithPathAndFileName = exports.saveModelWithPathAndFileName = function (model, path) {
    path = Path.join(path, model.fileName + ".js");

    if (global.verbose) {
        console.log("writing " + path);
    }

    return FS.writeFileAtPathWithData(path, beautify(model.toJS(), {
        space_after_anon_function: true,
        end_with_newline: true
    }));
};
