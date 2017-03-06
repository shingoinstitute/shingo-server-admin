/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');
var request = require('request');

function SetExpires(user){
  if(user){
    // Set the time that the token expires to 90 minutes from when it was issued
    var expires = new Date(parseInt(user.access_token.issued_at));
    var m = expires.getMinutes();
    expires.setMinutes(m + 90);
    user.access_token.expires = expires;
  }

  return user;
}

function Authed(user){
  if(!user || !user.access_token || !user.access_token.expires) return false;
  var now = new Date();
  var expires = new Date(user.access_token.expires);
  return user && expires >= now;
}

module.exports = {	

  /**
   * `AuthController.login()`
   */
  login: function (req, res, next) {
    if(Authed(req.session.user)) return res.redirect('/');
    passport.authenticate('forcedotcom')(req, res, next);
  },

  /**
   * `AuthController.logout()`
   */
  logout: function (req, res) {
    req.session.user = {};
    req.session.user.authenticated = false;
    sails.log.debug('logout out called');
    return res.redirect('/');
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

      req.session.user = SetExpires(user);
      req.session.user.authenticated = true;
      return res.redirect('/');
    })(req, res, next);
  },

  /**
   * 'AuthController.me()'
   */
  me: function(req, res, next){
    var now = new Date();
    if(Authed(req.session.user)) {
      return res.json(req.session.user);
    } else {
      req.session.user = {};
      req.session.user.authenticated = false;
      return res.json(req.session.user);
    }
  }
};

