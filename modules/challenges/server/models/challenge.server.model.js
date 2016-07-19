'use strict';

/**
 * Challenge Model
 */

module.exports = function(sequelize, DataTypes) {
    var Challenge = sequelize.define('challenge', {
        scheduledTime: DataTypes.DATE,
        challenger: DataTypes.INTEGER,
        challengee: DataTypes.INTEGER,
        winner: DataTypes.INTEGER
    });

    return Challenge;
};
