'use strict';

/**
 * News Model
 */

module.exports = function(sequelize, DataTypes) {
    var News = sequelize.define('news', {
        text: DataTypes.STRING,
        photoUrl: DataTypes.STRING,
        iconClass: DataTypes.STRING
    },{
        timestamps: true,
        paranoid: true,
        associate: function(models) {
            if (models.article) {
                News.hasMany(models.article);
            }
        }
    });

    return News;
};
