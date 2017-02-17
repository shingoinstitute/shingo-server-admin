/**
 * Passport configuration
 *
 * This is the configuration for your Passport.js setup and it where you'd
 * define the authentication strategies you want your application to employ.
 *
 * Authentication scopes can be set through the `scope` property.
 *
 * For more information on the available providers, check out:
 * http://passportjs.org/guide/providers/
 */

console.log('SF_ENV', process.env.SF_ENV);

module.exports.passport = {

  forcedotcom: {
    name: 'forcedotcom',
    protocol: 'oauth',
    strategy: require('passport-forcedotcom').Strategy,
    options: {
      clientID: process.env.SF_CLIENT,
      clientSecret: process.env.SF_SECRET,
      callbackURL: process.env.SF_CALLBACK,
      authorizationURL: process.env.SF_ENV + '/services/oauth2/authorize',
      tokenURL: process.env.SF_ENV + '/services/oauth2/token'
    }
  }

};