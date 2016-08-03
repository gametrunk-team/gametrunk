/**
 * Created by breed on 8/3/16.
 */

'use strict';

angular.module('core').factory('Card', function ($http, Deckster) {
        console.log("deckster factory");

        var Card = function (cardData) {
            return this.setData(cardData);
        };

        Card.prototype.setData = function (cardData) {
            angular.extend(this, cardData);
            // this.onResize = DataManager.defaultOnResize;
            // this.loadData = DataManager.defaultLoadData;
            // this.reloadView = DataManager.defaultOnReload;
            return this;
        };

        Card.prototype.onResize = function (card) {
            card.resizeCardViews();
        };

        Card.prototype.loadData = function (card, callback) {
            card.showSpinner();

            var cardOptions = card.options.getCurrentViewOptions(card.currentSection);
            var cardType = card.options.getCurrentViewType(card.currentSection);

            if (cardType === 'drilldownView') {
                cardType = cardOptions.viewType;
            }

            var loadData = function (data) {
                var transformData = function (data) {
                    data = DataManager.transformDataForCard(data, cardType, cardOptions);
                    setSeriesColors(card, data.series);
                    callback && callback(data);
                    card.hideSpinner();
                };

                if (cardOptions.preDataTransform) {
                    cardOptions.preDataTransform(card, data, transformData);
                } else {
                    transformData(data);
                }
            };

            if(cardType !== 'table') {
                var filters = {};
                $http.get(cardOptions.apiUrl, {
                    params: filters
                }).then(function (response) {
                    loadData(response.data);
                }).finally(function () {
                    card.hideSpinner();
                });
            } else {
                // callback && callback();
                card.hideSpinner();
            }
        };

        Card.prototype.reloadView = function (card) {
            var view = Deckster.views[card.options.getCurrentViewType(card.currentSection)];
            if (view.reload) {
                view.reload(card, card.currentSection);
            }
        };

        Card.prototype.isNew = function () {
            return !angular.isDefined(this.id);
        };

        Card.prototype.getCurrentViewType = function (section) {
            return this[section + 'ViewType'];
        };

        /**
         * Get the view options of associated with the currentSection.
         * If the view is a drilldownView it gets the view options associated with the
         * active view.
         *
         * @param section
         * @returns {*}
         */
        Card.prototype.getCurrentViewOptions = function (section) {
            var viewOptions = this[section + 'ViewOptions'];
            if (this.getCurrentViewType(section) === 'drilldownView') {
                return viewOptions.views[viewOptions.activeView];
            } else {
                return viewOptions;
            }
        };
        
        Card.dataFormatter = {
            'name': nameFormatter,
            'date': dateFormatter,
            'title': titleFormatter,
            'titleKeepSymbols': titleKeepSymbolsFormatter,
            'default': titleFormatter,
            'caps': capsFormatter,
            'capsNoCommas': capsNoCommasFormatter,
            'currency': currencyFormatter,
            'none': function(val) {return val;}
        };

        
        function capsFormatter(val) {
            return val.toUpperCase();
        }
        
        function capsNoCommasFormatter(val) {
            if (typeof val === 'string' || val instanceof String) {
                val = val.replace(',', '');
                return val.toUpperCase();
            }
            return val;
        }
        
        // Used to title-ize values
        function titleFormatter (val, unformat) {
            if(unformat) {
                return _.snakeCase(val);
            } else {
                return _.startCase(val);
            }
        }
        
        // Used to title-ize values without removing symbolic characters (other than _)
        function titleKeepSymbolsFormatter (val) {
            return _.map(_.words(val, /[^\s_]+/g), function(word){
                return _.capitalize(word);
            }).join(' ');
        }
        
        // Used to format name values
        function nameFormatter (val, unformat) {
            var parts;
        
            // If it is comma separated assume that its in the form lastname, firstname
            if (unformat){
                if (val && val.match(/\s/g)) {
                    parts = val.split(' ');
                    return (parts[1].trim() + ', ' + parts[0].trim()).toLowerCase();
                } else {
                    return val.toLowerCase();
                }
            } else if (val === true || val === false) {
                return val;
            } else {
                if (val && val.match(/.*,.*/g)) {
                    parts = val.split(',');
                    return _.startCase([parts[1].trim(), parts[0].trim()].join(' '));
                } else {
                    return _.startCase(val);
                }
            }
        }
        
        function currencyFormatter(val, decimalPlaces) {
            if(_.isFinite(val)) {
                return $filter('currency')(val, '$', decimalPlaces || 0);
            } else {
                return val;
            }
        }
        
        // Used to format date values
        function dateFormatter (date, format) {
            return moment(new Date(date)).format(format);
        }
        
        Card.prototype.getDataFormatter = function (format) {
            if (_.isEmpty(format)) {
                return Card.dataFormatter['default'];
            } else if (_.isString(format)) {
                return Card.dataFormatter[format];
            } else {
                return Card.dataFormatter[format.type];
            }
        };

        return Card;
    });
