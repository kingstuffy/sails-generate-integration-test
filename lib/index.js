/**
 * Created by sirstuffy on 7/27/2016.
 */

/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash'),
    pluralize = require('pluralize');
_.defaults = require('merge-defaults'),
    _.str = require('underscore.string');


/**
 * sails-generate-integration-test
 *
 * Usage:
 * `sails generate integration-test`
 *
 * @description Generates a integration-test
 * @help See http://links.sailsjs.org/docs/generators
 */

module.exports = {


    before: require('./before'),


    /**
     * The files/folders to generate.
     * @type {Object}
     */

    targets: {
        './test/integration/controllers/:filename': {template: 'controller.template'},
        './test/fixtures/:modelPlural.json': {template: 'fixture.template'}
    },


    /**
     * The absolute path to the `templates` for this generator
     * (for use with the `template` helper)
     *
     * @type {String}
     */
    templatesDirectory: require('path').resolve(__dirname, '../templates')
};


/**
 * INVALID_SCOPE_VARIABLE()
 *
 * Helper method to put together a nice error about a missing or invalid
 * scope variable. We should always validate any required scope variables
 * to avoid inadvertently smashing someone's filesystem.
 *
 * @param {String} varname [the name of the missing/invalid scope variable]
 * @param {String} details [optional - additional details to display on the console]
 * @param {String} message [optional - override for the default message]
 * @return {Error}
 * @api private
 */

function INVALID_SCOPE_VARIABLE(varname, details, message) {
    var DEFAULT_MESSAGE =
        'Issue encountered in generator "integration-test":\n' +
        'Missing required scope variable: `%s`"\n' +
        'If you are the author of `sails-generate-integration-test`, please resolve this ' +
        'issue and publish a new patch release.';

    message = (message || DEFAULT_MESSAGE) + (details ? '\n' + details : '');
    message = util.inspect(message, varname);

    return new Error(message);
}
