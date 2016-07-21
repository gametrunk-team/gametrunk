'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  async = require('async'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user;

/*
Get all users
 */
exports.getAllUsers = function(req, res) {

  User.findAll().then(function(users) {
    return res.json(users);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/*
 Get opponents users
 */
exports.getOpponents = function(req, res) {

  User.findAll().then(function(users) {
    return res.json(users);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

var cloudinary = require('cloudinary');

exports.update = function(req, res, next) {
  var userInfo = req.body;

  delete req.body.roles;
  if (userInfo) {

    async.waterfall([
      function(done) {

        if (userInfo.email.toLowerCase() !== req.user.email.toLowerCase()) {
          User.findOne({
            where: {
              email: {
                like: userInfo.email
              },
              id: {
                '$ne': req.user.id
              }
            }
          }).then(function(user) {
            if (user && user.email.toLowerCase() === userInfo.email.toLowerCase()) {
              return res.status(400).send({
                message: 'Email already exists'
              });
            }
            done(null);
          }).catch(function(err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          });
        } else {
          done(null);
        }
      },
      function(done) {
        if (userInfo.username.toLowerCase() !== req.user.username.toLowerCase()) {
          User.findOne({
            where: {
              username: {
                like: userInfo.username
              },
              id: {
                '$ne': req.user.id
              }
            }
          }).then(function(user) {
            if (user && user.username.toLowerCase() === userInfo.username.toLowerCase()) {
              return res.status(400).send({
                message: 'Username already exists'
              });
            }
            done(null);
          }).catch(function(err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          });
          done(null);
        } else {
          done(null);
        }
      },
      function(done) {
        User.findOne({
          where: {
            id: req.user.id
          }
        }).then(function(user) {

          user.firstName = userInfo.firstName;
          user.lastName = userInfo.lastName;
          user.displayName = userInfo.firstName + ' ' + userInfo.lastName;
          user.username = userInfo.username;
          user.email = userInfo.email.toLowerCase();
          user.updatedAt = Date.now();

          user.save().then(function(user) {
            if (!user) {
              return res.status(400).send({
                message: 'Unable to update'
              });
            } else {
              res.json(user);
            }
          }).catch(function(err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          });

        });
        done(null);
      }
    ]);
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function(req, res) {
  User.findOne({
    where: {
      id: req.user.id
    }
  }).then(function(user) {
    if (user) {
      if (!req.file) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else {
        var oldImageId = user.profileImageURL.indexOf('/') === -1 ? user.profileImageURL : user.profileImageURL.split('/')[1];
        oldImageId = oldImageId.indexOf('.') === -1 ? oldImageId : oldImageId.split('.')[0];
        // Upload image to cloudinary
        cloudinary.uploader.upload(req.file.path, function(result) {
        }, { public_id: req.file.filename.split('.')[0]}).then(function (result) {

          // Insert new profile image url
          user.profileImageURL = "v" + result.version + "/" + result.public_id + "." + result.format;
          req.user.profileImageURL = "v" + result.version + "/" + result.public_id + "." + result.format;

          user.save().then(function(saved) {
            if (!saved) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(saved)
              });
            } else {
              // Delete old image from cloudinary
              if (oldImageId) {
                console.log(oldImageId);
                try {
                  cloudinary.v2.uploader.destroy(oldImageId,
                      function(error, result) {console.log(result); });
                } catch (e) {
                  console.log('Unable to delete the old image', e);
                }
              }
            }
          }).catch(function(err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          });

        });
      }
      res.json(user);
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });

};

exports.getProfile = function(req, res) {
  User.findOne({
    attributes: ['id', 'firstName', 'lastName', 'email', 'username'],
    where: {
      id: req.user.id
    }
  }).then(function(user) {
    res.json(user);
  }).catch(function(err) {
    res.status(400).send(err);
  });
};


/**
 * Send User
 */
exports.me = function(req, res) {
  res.json(req.user || null);
};
