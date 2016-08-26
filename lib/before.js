/**
 * Created by sirstuffy on 7/27/2016.
 */


var util = require('util'),
    path = require('path');
var _ = require('lodash'),
    pluralize = require('pluralize');
_.defaults = require('merge-defaults'),
    _.str = require('underscore.string');

/**
 * `before()` is run before executing any of the `targets`
 * defined below.
 *
 * This is where we can validate user input, configure default
 * scope variables, get extra dependencies, and so on.
 *
 * @param  {Object} scope
 * @param  {Function} cb    [callback]
 */

module.exports = function (scope, cb) {

    // scope.args are the raw command line arguments.
    //
    // e.g. if someone runs:
    // $ sails generate integration-test user find create update
    // then `scope.args` would be `['user', 'find', 'create', 'update']`
    if (!scope.args[0]) {
        return cb(new Error('Please provide a model for this integration-test.'));
    }

    // scope.rootPath is the base path for this generator
    //
    // e.g. if this generator specified the target:
    // './Foobar.md': { copy: 'Foobar.md' }
    //
    // And someone ran this generator from `/Users/dbowie/sailsStuff`,
    // then `/Users/dbowie/sailsStuff/Foobar.md` would be created.
    if (!scope.rootPath) {
        return cb(INVALID_SCOPE_VARIABLE('rootPath'));
    }


    // Decide the output filename for use in targets below:
    scope.model = scope.args[0];
    scope.modelCapitalized = _.str.capitalize(scope.model);
    scope.controller = scope.modelCapitalized + 'Controller';
    scope.filename = scope.controller + '.test.js';
    scope.modelPlural = pluralize(scope.model);

    var relativePathToModel = 'api/models/' + scope.modelCapitalized + '.js';

    var pathToModel = path.resolve(scope.rootPath, relativePathToModel);

    console.log(pathToModel);
    var model, invalidModelPath;
    try {
        model = require(pathToModel);
    } catch (e) {
        invalidModelPath = true;
    }

    if (invalidModelPath) {
        return cb.invalid('Sorry, Sorry this model was not found');
    }


    var requiredAttributes = _.pickBy(model.attributes, function (attribute) {
        return attribute.required;
    });


    var validationMessages = model.validationMessages;

    _.forEach(Object.keys(requiredAttributes), function (attribute) {

        if (validationMessages && validationMessages[attribute]) {

            var messages = [];
            _.forEach(validationMessages[attribute], function (value, key) {
                messages.push({
                    rule: key,
                    message: value
                })
            });
            requiredAttributes[attribute].validationMessages = messages;
        }

        return;
    });


    scope.requiredAttributes = _.map(Object.keys(requiredAttributes), function (attribute) {
        requiredAttributes[attribute].__name = attribute;
        return requiredAttributes[attribute];
    });


    scope.generateAttributeJSON = function (attributes) {
        var obj = {};
        _.forEach(attributes, function (attribute, index) {
            obj[attribute.__name] = "data";
        });

        return JSON.stringify(obj, null, '\t\t');
    };


    scope.generateMissingParamsFixture = function (attributes) {

        var obj = {};

        _.forEach(attributes, function (attribute, index) {

            var attributeName = 'no' + _.str.capitalize(attribute.__name);
            obj[attributeName] = {};

            var filteredAttributes = _.filter(attributes, function (attr) {
                return attr.__name != attribute.__name
            });
            obj[attributeName] = JSON.parse(scope.generateAttributeJSON(filteredAttributes));
        });

        return obj;
    };


    scope.generateRequiredModelFixture = function (attributes) {

        var obj = {};


        var filteredAttributes = _.filter(attributes, function (attr) {
            return attr.model;
        });

        _.forEach(filteredAttributes, function (attribute, index) {

            var attributeName = 'invalid' + _.str.capitalize(attribute.__name);
            obj[attributeName] = {};

            obj[attributeName] = JSON.parse(scope.generateAttributeJSON(attributes));
            obj[attributeName][attribute.__name] = 'invalid';

        });

        return obj;
    };


    scope.generateInvalidData = function (requiredAttributes) {
        var obj = {};
        obj.empty = {};
        obj = _.assign(obj, scope.generateMissingParamsFixture(requiredAttributes));
        obj = _.assign(obj, scope.generateRequiredModelFixture(requiredAttributes));
        return JSON.stringify(obj, null, '\t\t');
    };


    // Attach defaults
    _.defaults(scope, {
        createdAt: new Date()
    });

    scope._ = _;

    // Add other stuff to the scope for use in our templates:
    //scope.whatIsThis = 'an example file created at ' + scope.createdAt;

    // When finished, we trigger a callback with no error
    // to begin generating files/folders as specified by
    // the `targets` below.
    cb();
};