/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-result-view',
    'contrail-list-model'
], function (_, QueryResultView, ContrailListModel) {

    var FlowRecordResultView = QueryResultView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                serverCurrentTime = qewu.getCurrentTime4Client(),
                queryFormModel = self.model,
                timeRange = parseInt(queryFormModel.time_range()),
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                contrailListModel;

            $.ajax({
                url: '/api/service/networking/web-server-info'
            }).done(function (resultJSON) {
                serverCurrentTime = resultJSON['serverUTCTime'];
            }).always(function() {
                var postDataObj = queryFormModel.getQueryRequestPostData(serverCurrentTime),
                    frRemoteConfig = {
                        url: "/api/qe/query",
                        type: 'POST',
                        data: JSON.stringify(postDataObj)
                    },
                    listModelConfig = {
                        remote: {
                            ajaxConfig: frRemoteConfig,
                            dataParser: function(response) {
                                return response['data'];
                            },
                            successCallback: function(resultJSON, contrailListModel, response) {
                                if (response.status === 'queued') {
                                    $('#' + cowl.QE_FLOW_RECORD_GRID_ID).data('contrailGrid').showGridMessage(response.status)
                                } else if (contrailListModel.getItems().length == 0) {
                                    $('#' + cowl.QE_FLOW_RECORD_GRID_ID).data('contrailGrid').showGridMessage('empty')
                                }
                            }
                        }
                    };

                if (timeRange !== -1) {
                    queryFormModel.to_time(serverCurrentTime);
                    queryFormModel.from_time(serverCurrentTime - (timeRange * 1000));
                }

                contrailListModel = new ContrailListModel(listModelConfig);
                modelMap[cowc.UMID_FLOW_RECORD_FORM_MODEL] = queryFormModel;
                self.renderView4Config(self.$el, contrailListModel, self.getFlowRecordResultGridTabViewConfig(postDataObj, frRemoteConfig), null, null, modelMap, function() {
                    contrailListModel.onAllRequestsComplete.subscribe(function () {
                        queryFormModel.is_request_in_progress(false);
                    });
                });
            });
        },

        getFlowRecordResultGridTabViewConfig: function (postDataObj, frRemoteConfig) {
            var self = this, viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'],
                queryFormModel = this.model,
                selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                frGridColumns = qewgc.getColumnDisplay4Grid(cowc.FLOW_RECORD_TABLE, cowc.QE_FLOW_TABLE_TYPE, selectArray);

            var frDetailsColumn = [
                {
                    id: 'fr-details', field: "", name: "", resizable: false, sortable: false, width: 30, minWidth: 30, searchable: false, exportConfig: {allow: false}, formatter: function (r, c, v, cd, dc) {
                        return '<i class="icon-external-link-sign" title="Analyze Session"></i>';
                    },
                    cssClass: 'cell-hyperlink-blue',
                    events: {
                        onClick: qewgc.getOnClickFlowRecord(self, queryFormModel)
                    }
                }
            ];

            frGridColumns = frDetailsColumn.concat(frGridColumns);

            var resultsViewConfig = {
                elementId: cowl.QE_FLOW_RECORD_TAB_ID,
                view: "TabsView",
                viewConfig: {
                    theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                    tabs: [
                        {
                            elementId: cowl.QE_FLOW_RECORD_GRID_ID,
                            title: cowl.TITLE_RESULTS,
                            iconClass: 'icon-table',
                            view: "GridView",
                            tabConfig: {
                                activate: function(event, ui) {
                                    if ($('#' + cowl.QE_FLOW_RECORD_GRID_ID).data('contrailGrid')) {
                                        $('#' + cowl.QE_FLOW_RECORD_GRID_ID).data('contrailGrid').refreshView();
                                    }
                                }
                            },
                            viewConfig: {
                                elementConfig: getFlowRecordGridConfig(frRemoteConfig, frGridColumns, pagerOptions)
                            }
                        }
                    ]
                }
            };

            return resultsViewConfig;
        },
    });

    function getFlowRecordGridConfig(frRemoteConfig, frGridColumns, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: cowl.TITLE_FLOW_RECORD
                },
                defaultControls: {
                    collapseable: true,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30,
                    defaultDataStatusMessage: false
                },
                dataSource: {
                    remote: {
                        ajaxConfig: frRemoteConfig,
                        dataParser: function(response) {
                            return response['data'];
                        },
                        serverSidePagination: true
                    }
                },
                statusMessages: {
                    queued: {
                        type: 'status',
                        iconClasses: '',
                        text: cowm.QE_QUERY_QUEUED
                    }
                }
            },
            columnHeader: {
                columns: frGridColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 100, pageSizeSelect: [100, 200, 300, 500] } })
            }
        };
        return gridElementConfig;
    };

    return FlowRecordResultView;
});