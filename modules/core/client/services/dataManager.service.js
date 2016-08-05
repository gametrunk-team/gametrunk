/**
 * Created by breed on 8/3/16.
 */


'use strict';

angular.module('core').factory('DataManager', function ($http, $q, Formatters) {

    var DataManager = {};
    DataManager.fiscalYearStart = new Date('4/4/2015'); // TODO: This needs to be pulled from a DB at some point.
    DataManager.fiscalYearEnd = new Date('4/6/2016');
    var dbColumnMetadata = null;

    DataManager.colorMap = {
        white: '#ffffff',
        headcount: '#7cb5ec',
        hires: '#8dce39',
        vterminations: '#f7a35c',
        iterminations: '#de546b'
    };

    DataManager.query = function (queryParams) {
        var deferred = $q.defer();

        $http.post('/api/data/query/', queryParams).then(function (response) {
            deferred.resolve(response.data);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var _query = function _query(queryParams, callback) {
        DataManager.query(queryParams).then(function (jsonResultSet) {
            callback(jsonResultSet || []);
        }, function () {
            callback([]);
        });
    };

    DataManager.externalAPI = function (queryParams) {
        var deferred = $q.defer();

        $http.post('/api/data/externalAPI/', queryParams).then(function (response) {
            deferred.resolve(response.data);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };

    DataManager.transformDataForCard = function (data, cardType, cardOptions) {
        setDefaultTransformOptions(cardOptions);
        // TODO: after setting defaults this might be a good place for validating the dataTransform options of the card json
        var transform = cardOptions.customDataTransformer || dataTransformer[cardType];
        return transform(data, cardOptions);
    };

    function setDefaultTransformOptions(options) {
        options.dataTransform = _.merge({}, options.dataTransform);
        options.dataTransform.titleFormats = _.merge({
            category: 'default',
            series: 'default',
            categoryX: 'default',
            categoryY: 'default'
        }, options.dataTransform.titleFormats);
    }

    DataManager.generateAutocompleteConfig = function (apiUrl, nameColumn, valueColumn, titleName, formatter, selected, dependsOnFilters, dependedByFilters, selections, allowClear) {
        return {
            name: nameColumn,
            titleName: titleName,
            nameColumn: nameColumn,
            valueColumn: valueColumn,
            displayName: '<%= ' + nameColumn + ' %>',
            displayNameFormatter: formatter,
            selectedFilter: selected && selected[nameColumn] ? selected : null,
            autocomplete: {
                apiUrl: apiUrl
            },
            dependsOnFilters: dependsOnFilters,
            dependedByFilters: dependedByFilters,
            selections: selections,
            allowClear: allowClear
        };
    };

    // DataManager.getHistogramControls = function () {
    //   return {
    //     rightControlsContent: 'components/deckster/views/histogramChart/histogramChart-controls.html',
    //     selectedFilter: 10,
    //     selectedBinNumber: 10,
    //     changeBinNumber: function (card, binNumber) {
    //       var templateVariables = card.options.getTemplateVariables();
    //       var viewOptions = card.options.getCurrentViewOptions(card.currentSection);
    //       viewOptions.controls.selectedBinNumber = binNumber;
    //       templateVariables.binClause = binNumber;
    //       FilterService.createFilteredQuery(card, templateVariables);
    //     }
    //   }
    // };

    DataManager.getLayerManagerClauses = function (layerManCol, layerManName) {
        return {
            managerType: layerManCol,
            managerClause: layerManCol + " ~ '" + layerManName + "'",
            activeClause: "employment_status = 'active'"
        };
    };

    var setSeriesColors = function setSeriesColors(card, series) {
        var seriesColors = card.$deckster.options.seriesColorMap;
        _.each(series, function (series) {
            var seriesName = series.name;
            if (_.contains(_.keys(seriesColors), seriesName)) {
                series.color = seriesColors[seriesName];
            }
        });
    };

    DataManager.loadSummaryBarData = function (deck, callback) {
        if (deck.summaryBar.apiUrl) {
            var filters = deck.getSelectedFiltersJSON();

            $http.get(deck.summaryBar.apiUrl, {
                params: filters
            }).then(function (response) {
                var data = response.data;

                if (deck.summaryBar.postQuery) {
                    deck.summaryBar.postQuery(deck, data);
                }

                callback(data);
            });
        } else {
            console.info("No endpoint found for card");
        }
    };

    DataManager.defaultLoadData = function (card, callback) {
        card.showSpinner();

        // get current view metadata
        var cardOptions = card.options.getCurrentViewOptions(card.currentSection);
        var cardType = card.options.getCurrentViewType(card.currentSection);

        //Adjust some property locations if this is a drillable card
        if (cardType === 'drilldownView') {
            cardType = cardOptions.viewType;
        }

        // create the initial query (passing in null for filters to set default values)
        if (!cardOptions.query && cardOptions.queryTemplate) {
            //setting date range on the filters
            var date = {
                start: card.$deckster.options.startDate,
                end: card.$deckster.options.endDate,
                maxEndDate: card.$deckster.options.maxEndDate
            };

            var selectedFilter = card.$deckster.options.getSelectedFiltersJSON();
            selectedFilter.date_range = date;
            // FilterService.createFilteredQuery(card, selectedFilter, {reloadContent: false});
        }

        // load card controls
        //if(!_.isUndefined(cardOptions.controls) && _.isFunction(cardOptions.controls.loadControls)) {
        //  cardOptions.controls.loadControls(card);
        //}

        var loadData = function loadData(data) {
            var transformData = function transformData(data) {
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

        if (cardOptions.query) {
            _query(cardOptions.query, function (data) {
                loadData(data);
            }, function () {
                card.hideSpinner();
            });
        } else if (cardOptions.apiUrl) {
            if (cardType !== 'table') {
                // var filters = angular.merge(card.$deckster.options.getSelectedFiltersJSON(), card.options.drilldownFilters || {});
                var filters = {};
                $http.get(cardOptions.apiUrl, {
                    params: filters
                }).then(function (response) {
                    loadData(response.data);
                }).finally(function () {
                    card.hideSpinner();
                });
            } else {
                callback && callback();
                card.hideSpinner();
            }
        } else {
            console.info("No endpoint found for card");
        }
    };

    DataManager.defaultOnResize = function (card) {
        card.resizeCardViews();
    };

    DataManager.defaultOnReload = function (card) {
        var view = Deckster.views[card.options.getCurrentViewType(card.currentSection)];
        if (view.reload) {
            view.reload(card, card.currentSection);
        }
    };

    DataManager.getLastUpdated = function (card, callback) {
        $http.post('/api/data/lastUpdated/', card.lastUpdated || {}).then(function (response) {
            var date = response.data;
            callback(date ? moment(date).toDate() : null);
        });
    };
    //
    // DataManager.promise = $http.post('/api/data/queryColumnMetadata/').then(function (response) {
    //   dbColumnMetadata = response.data;
    // });

    // DataManager.getPostgresDate = function (date) {
    //   return DateUtils.getFormattedDateFromDate(date);
    // };

    var dataTransformer = {
        'barChart': chartDataTransformer,
        'columnChart': chartDataTransformer,
        'columnRangeChart': columnRangeDataTransformer,
        'lineChart': chartDataTransformer,
        'splineChart': chartDataTransformer,
        'areaChart': chartDataTransformer,
        'pieChart': percentageChartDataTransformer,
        'donutChart': percentageChartDataTransformer,
        'geoMap': geoMapDataTransformer,
        'table': tableDataTransformer,
        'quadChart': quadChartDataTransformer,
        'heatmapChart': heatmapChartDataTransformer,
        'boxPlot': boxPlotDataTransformer,
        'histogramChart': chartDataTransformer,
        'scatterPlotChart': scatterPlotDataTransformer
    };

    function scatterPlotDataTransformer(data, options) {
        var dataTransform = options.dataTransform;
        var categoryTitleFormatter = getDataFormatter(dataTransform.titleFormats.category);
        var legends = _.uniq(_.map(data, function (point) {
            return categoryTitleFormatter(point[dataTransform.legendPivot], dataTransform.titleFormats.category.format);
        }));

        var symbols = _.keys(Highcharts.SVGRenderer.prototype.symbols);
        options.legendSymbols = {};
        _.each(legends, function (legendItem, index) {
            options.legendSymbols[legendItem] = symbols[index % symbols.length];
        });

        var myData = {};
        _.each(data, function (point) {
            var legendKey = categoryTitleFormatter(point[dataTransform.legendPivot], dataTransform.titleFormats.category.format);
            var name = categoryTitleFormatter(point[dataTransform.nameColumn], dataTransform.titleFormats.category.format);
            myData[name] = myData[name] || { name: name, data: [], marker: { symbol: 'circle' } };
            myData[name].data.push({
                y: _.isNaN(point[dataTransform.yAxisColumn]) ? 0 : parseFloat(point[dataTransform.yAxisColumn]),
                x: _.isNaN(point[dataTransform.xAxisColumn]) ? 0 : parseFloat(point[dataTransform.xAxisColumn]),
                name: name,
                marker: {
                    symbol: options.legendSymbols[legendKey]
                }
            });
        });

        myData = _.values(myData);
        return { query: options.query, series: myData };
    }

    /**
     * Transform data for injecting into a box plot
     * @param data
     * @param options
     */

    function boxPlotDataTransformer(data, options) {
        var dataTransform = options.dataTransform;
        var categoryTitleFormatter = getDataFormatter(dataTransform.titleFormats.category);
        var categoryData;

        if (dataTransform.row === 'category') {
            categoryData = _.map(_.pluck(data, dataTransform.nameColumn), function (week) {
                return categoryTitleFormatter(week, dataTransform.titleFormats.category.format);
            });
        } else {
            categoryData = _.pluck(data, dataTransform.nameColumn);
        }

        var seriesData = _.map(data, function (row) {
            var lowerLimit = parseFloat(row.lower_limit);
            var upperLimit = parseFloat(row.upper_limit);

            if (row.min <= lowerLimit) {
                row.min = lowerLimit;
            }
            if (row.max >= upperLimit) {
                row.max = upperLimit;
            }
            return _.map([row.min, row.q1, row.median, row.q3, row.max], parseFloat);
        });

        var meanData = _.map(data, function (meanValue) {

            if (dataTransform.row === 'category') {
                meanValue[dataTransform.nameColumn] = categoryTitleFormatter(meanValue[dataTransform.nameColumn], dataTransform.titleFormats.category.format);
            }

            return _.map([categoryData.indexOf(meanValue[dataTransform.nameColumn]), parseFloat(meanValue.mean)]);
        });
        return {
            name: 'Hourly Distribution By Week',
            data: seriesData,
            categories: categoryData,
            mean: meanData
        };
    }

    /**
     *  Note: below is a way to inject various series attributes into the series object before processing. Simply make a
     *  JSON object in the summaryViewOptions that looks like:
     *  seriesOptions: {
   *    name:{
   *      'Data item name #1':
   *        {seriesAttributeName: seriesAttributeValue (e.g.pointPadding: 0.3, pointPlacement: -0.15)},
   *      'Data item name #2':
   *        {seriesAttributeName: seriesAttributeValue}
   *    }
   *  }
     * @param series
     * @param options
     */
    var applySeriesOptions = function applySeriesOptions(series, options) {
        if (options.seriesOptions) {
            //Creates an array corresponding to what we want our series to look like. It is unsorted at this point
            _.each(series, function (seriesItem) {
                if (options.seriesOptions.name[seriesItem.name]) {
                    seriesItem = _.merge(seriesItem, options.seriesOptions.name[seriesItem.name]);
                    var names = _.map(_.keys(options.seriesOptions.name), function (key) {
                        return key;
                    });
                    seriesItem.order = names.indexOf(seriesItem.name);
                }
                return seriesItem;
            });

            //This is to get the series into the order specified in the seriesOptions object
            series.sort(function (a, b) {
                if (a.order > b.order) {
                    return 1;
                }
                if (a.order < b.order) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });
        }
    };

    /**
     * Transform data for injecting into a basic chart (i.e. bar chart, line chart)
     * @param data
     * @param options
     * @returns {{query: *, categories: *, series: *}}
     */
    function chartDataTransformer(data, options) {

        var categories = [];
        var series = [];

        var dataTransform = options.dataTransform;

        // if first row is empty data, then delete it from consideration
        var firstRow = data[0];
        data = dataTransform.emptyRow ? data.slice(1) : data;

        // var categoryTitleFormatter = getDataFormatter(dataTransform.titleFormats.category);
        // var seriesTitleFormatter = getDataFormatter(dataTransform.titleFormats.series);

        var nameColumn = dataTransform.nameColumn;

        if (dataTransform.row === 'series') {
            categories = _.map(_.keys(_.omit(firstRow, dataTransform.nameColumn)), function (category) {
                //return categoryTitleFormatter(category, dataTransform.titleFormats.category.format);
                return category;
            });
            _.forEach(data, function (obj) {
                series.push({
                    //name: seriesTitleFormatter(obj[dataTransform.nameColumn], dataTransform.titleFormats.series.format),
                    name: obj[dataTransform.nameColumn],
                    data: _.map(_.values(_.omit(obj, dataTransform.nameColumn)), Number)
                });
            });
        } else if (dataTransform.row === 'category') {
            console.log(data);
            categories = _.map(data, function (obj) {
                //return categoryTitleFormatter(obj[dataTransform.nameColumn], dataTransform.titleFormats.category.format);
                return obj[nameColumn];
            });
            _.forOwn(firstRow, function (value, key) {
                if (key !== nameColumn) {
                    series.push({
                        //name: seriesTitleFormatter(key, dataTransform.titleFormats.series.format),
                        name: key,
                        data: _.map(_.pluck(data, key), Number),
                        visible: !_.includes(options.nonVisibleSeries, key)
                    });
                }
            });
        }

        applySeriesOptions(series, options);

        return {
            query: options.query,
            categories: categories,
            series: series
        };
    }

    /**
     * Transform data for injecting into a quad chart
     * @param data
     * @param options
     * @returns {{data: *}}
     */
    function quadChartDataTransformer(data, options) {

        // TODO: fillin with whatever makes sense when it makes sense

        return { data: data };
    }

    /**
     * Transform data for injecting into a columnRange chart
     * @param data
     * @param options
     * @returns {{query: *, categories: *, series: *}}
     */
    function columnRangeDataTransformer(data, options) {
        var series = [];

        var dataTransform = options.dataTransform;

        var categoryTitleFormatter = getDataFormatter(dataTransform.titleFormats.category);
        var seriesTitleFormatter = getDataFormatter(dataTransform.titleFormats.series);

        var categories = _.map(data, function (obj) {
            return categoryTitleFormatter(obj[dataTransform.nameColumn], dataTransform.titleFormats.category.format);
        });

        _.forEach(dataTransform.seriesMap, function (seriesInfo) {
            var seriesName = seriesInfo.name;
            series.push({
                name: seriesTitleFormatter(seriesName, dataTransform.titleFormats.series.format),
                data: _.map(data, function (row) {
                    var returnData = [];
                    // If only a single series column is defined, then store it individually.
                    // This is needed for laying point data on top of the columnrange chart.
                    if (!_.isUndefined(seriesInfo.seriesColumn)) {
                        returnData = [row[seriesInfo.seriesColumn]];
                    } else {
                        returnData = [row[seriesInfo.minColumn], row[seriesInfo.maxColumn]];
                    }
                    return returnData;
                })
            });
        });

        applySeriesOptions(series, options);

        return { query: options.query, categories: categories, series: series };
    }

    function getDataFormatter(format) {
        if (_.isEmpty(format)) {
            return Formatters.dataFormatter['default'];
        } else if (_.isString(format)) {
            return Formatters.dataFormatter[format];
        } else {
            return Formatters.dataFormatter[format.type];
        }
    };

    DataManager.getDataFormatter = getDataFormatter;

    /**
     * Transform data for injecting into a pergentage chart (i.e. donut chart, pie chart)
     * @param data
     * @param options
     * @returns {{query: *, data: *}}
     */
    function percentageChartDataTransformer(data, options) {
        var dataTransform = options.dataTransform;
        var transformedData;

        var categoryTitleFormatter = getDataFormatter(dataTransform.titleFormats.category);

        if (dataTransform.row === 'series') {
            transformedData = _.map(_.pairs(data[0]), function (pair) {
                pair[0] = categoryTitleFormatter(pair[0], dataTransform.titleFormats.category.format);
                return pair;
            });
        } else {
            transformedData = _.map(data, function (row) {
                var title = row[dataTransform.nameColumn];
                var value = _.values(_.omit(row, dataTransform.nameColumn))[0];
                return { name: categoryTitleFormatter(title), y: parseFloat(value) };
            });
        }

        applySeriesOptions(transformedData, options);

        return { query: options.query, data: transformedData };
    }

    /**
     * Transform data for injecting into a table
     * @param data
     * @param options
     */
    function tableDataTransformer(data, options) {
        //Table data transforms should be done in the table.js responseHandler
        return data;
    }

    function getDefaultColumnMetadata(col) {
        return { name: col, displayName: _.startCase(col), type: 'STRING' };
    }

    /**
     * Transform data for injecting into a map
     * @param data
     * @param options
     * @returns {*}
     */
    function geoMapDataTransformer(data, options) {
        var generateGeoJSONData = function generateGeoJSONData(geoRecs) {
            var returnGeoJSON = [];
            _.each(geoRecs, function (geoRec) {
                var latitude = geoRec.latitude;
                var longitude = geoRec.longitude;
                if (!_.isNull(latitude) && !_.isNull(longitude)) {
                    var geoPoint = {};
                    geoPoint.type = 'Feature';
                    geoPoint.properties = {};
                    // Store the returned column values in the geoPoint for later use (in the tooltip)
                    _.forEach(_.keys(geoRec), function (key) {
                        geoPoint.properties[key] = geoRec[key];
                    });
                    geoPoint.geometry = {};
                    geoPoint.geometry.type = 'Point';
                    //These are backwards due to the fact that markers require longitude first
                    geoPoint.geometry.coordinates = [longitude, latitude];
                    returnGeoJSON.push(geoPoint);
                }
            });

            return returnGeoJSON;
        };

        var geoJSONData = generateGeoJSONData(data) || [];
        return { query: options.query, geoJSONData: geoJSONData };
    }

    function getGradientColor(baseColor, percent) {
        var gradient = Math.round(180 * (1 - percent));
        var step = _.padLeft(gradient.toString(16), 2, '0');
        return baseColor.replace(/00/g, step);
    }

    function heatmapChartDataTransformer(data, options) {
        var heatmapData = [];

        if (!_.isEmpty(data)) {
            var dataTransform = options.dataTransform;

            var categoryXTitleFormatter = getDataFormatter(dataTransform.titleFormats.categoryX);
            var categoryYTitleFormatter = getDataFormatter(dataTransform.titleFormats.categoryY);

            var categoriesX = _.map(_.keys(_.omit(data[0], dataTransform.nameColumn)), function (category) {
                return category;
            });

            var categoriesY = _.map(data, function (category) {
                return category[dataTransform.nameColumn];
            });

            _.forEach(data, function (row, yIndex) {
                _.forEach(row, function (value, key) {
                    if (key != dataTransform.nameColumn) {
                        var xIndex = _.indexOf(categoriesX, key);
                        if (!options.colorMap) {
                            heatmapData.push([xIndex, yIndex, value]);
                        } else {
                            var color;
                            if (options.colorMap.addGradientForRow) {
                                var baseColor = options.colorMap[row[dataTransform.nameColumn]] || options.colorMap['default'];
                                color = value == 0 ? options.colorMap['default'] : getGradientColor(baseColor, value);
                                //                if (value === 0) {
                                //                  color = "#636363";
                                //                } else {
                                //                  color = getGradientColor(baseColor, value);
                                //                }
                            } else {
                                color = options.colorMap[value] || options.colorMap['default'];
                            }
                            heatmapData.push({ x: xIndex, y: yIndex, value: value, color: color });
                        }
                    }
                });
            });

            categoriesX = _.map(categoriesX, function (category) {
                return categoryXTitleFormatter(category, dataTransform.titleFormats.categoryX.format);
            });

            categoriesY = _.map(categoriesY, function (category) {
                return categoryYTitleFormatter(category, dataTransform.titleFormats.categoryY.format);
            });
        }

        return { query: options.query, categories: { x: categoriesX, y: categoriesY }, data: heatmapData };
    }

    // Chart Paging

    DataManager.chartPaging = {
        getPagingValuesFromClause: function getPagingValuesFromClause(pagingClause) {
            var pagingValues = {};
            pagingValues.limit = parseInt(new RegExp(/(?:LIMIT\s)(\d+)/g).exec(pagingClause)[1]);
            pagingValues.offset = parseInt(new RegExp(/(?:OFFSET\s)(\d+)/g).exec(pagingClause)[1]);
            return pagingValues;
        },

        getRecTotal: function getRecTotal(card, callback) {
            var templateVariables = card.options.getTemplateVariables();
            // Set paging totals
            // Get the original query
            var countQuery = _.cloneDeep(card.options.getCurrentViewOptions(card.currentSection).query);
            // Remove the paging clause from the query
            countQuery.json.expression = countQuery.json.expression.replace(templateVariables.cardFilter_pagingClause, '');
            // Wrap the query in a SELECT COUNT
            countQuery.json.expression = "SELECT COUNT(*) FROM (" + countQuery.json.expression + ") as countQuery";
            // Set the total records to the result
            DataManager.query(countQuery).then(function (jsonResultSet) {
                callback(parseInt(jsonResultSet[0].count));
            }, function () {
                callback(0);
            });
        },

        getPageCount: function getPageCount(card) {
            var templateVariables = card.options.getTemplateVariables();
            var pagingClauseValues = this.getPagingValuesFromClause(templateVariables.cardFilter_pagingClause);
            return Math.ceil(templateVariables.cardFilter_pagingRecTotal / pagingClauseValues.limit);
        },

        getCurrentPage: function getCurrentPage(card) {
            var templateVariables = card.options.getTemplateVariables();
            var pagingClauseValues = this.getPagingValuesFromClause(templateVariables.cardFilter_pagingClause);
            return pagingClauseValues.offset / pagingClauseValues.limit + 1;
        }

    };

    return DataManager;
});
//# sourceMappingURL=DataManager.service.js.map
