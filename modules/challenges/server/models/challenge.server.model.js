'use strict';

/**
 * Challenge Model
 */

module.exports = function(sequelize, DataTypes) {
    var Challenge = sequelize.define('challenge', {
        scheduledTime: DataTypes.DATE,
        challenger: DataTypes.INTEGER,
        challengee: DataTypes.INTEGER,
        winner: DataTypes.INTEGER,
        deleted: DataTypes.BOOLEAN
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
