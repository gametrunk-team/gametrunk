'use strict';

/**
 * Challenge Model
 */

module.exports = function(sequelize, DataTypes) {
    var Challenge = sequelize.define('challenge', {
        scheduledTime: DataTypes.DATE,
        challengerUserId: DataTypes.INTEGER,
        challengeeUserId: DataTypes.INTEGER,
        winnerUserId: DataTypes.INTEGER,
        accepted: DataTypes.BOOLEAN
    },{
        timestamps: true,
        paranoid: true,
        associate: function(models) {
            if (models.article) {
                Challenge.hasMany(models.article);
            }
    }
    });

    return Challenge;
};
