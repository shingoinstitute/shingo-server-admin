/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');

module.exports = {	


  /**
   * `AuthController.login()`
   */
  login: function (req, res, next) {
    passport.authenticate('forcedotcom')(req, res, next);
  },


  /**
   * `AuthController.logout()`
   */
  logout: function (req, res) {
    req.session.authenticated = false;
    req.session.user = null;
    return res.redirect('/login');
  },


  /**
   * `AuthController.auth_callback()`
   */
  auth_callback: function (req, res, next) {
    passport.authenticate('forcedotcom', function(err, user, info, state){
      if(err){
        sails.log.error('SF Callback Error: ', err);
        return res.negotiate(err);
      }
      req.session.user = user;
      req.session.authenticated = user._raw.asserted_user;
      return res.redirect('/');
    })(req, res, next);
  }
};

