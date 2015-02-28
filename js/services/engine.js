manywho.engine = (function (manywho) {

    var waiting = {};

    function processObjectDataRequests(components, flowKey) {

        var requestComponents = manywho.utils.convertToArray(components).filter(function (component) {

            return component.objectDataRequest != null;

        });

        return $.when.apply($, requestComponents.map(function (component) {
            
            var limit = manywho.settings.global('paging.' + component.componentType);
            return manywho.engine.objectDataRequest(component.id, component.objectDataRequest, flowKey, limit)

        }));

    }

    function isAuthorized(response, flowKey) {

        if (!manywho.authorization.isAuthorized(response, flowKey)) {

            return $.Deferred().reject(response).promise();

        }

        return response;

    }

    function initializeWithAuthorization(callback, navigationElementReferences, currentStreamId, flowKey) {

        var self = this;
        var authenticationToken = manywho.state.getAuthenticationToken(flowKey);
        var invokeRequest = manywho.json.generateInvokeRequest(
            manywho.state.getState(flowKey),
            'FORWARD',
            null,
            null,
            manywho.settings.flow('annotations', flowKey),
            null,
            manywho.settings.flow('mode', flowKey)
        );

        manywho.utils.removeLoadingIndicator('loader');
        manywho.component.appendFlowContainer(flowKey);
        manywho.state.setLoading('main', { message: 'Initializing...' }, flowKey);
        self.render(flowKey);

        manywho.ajax.invoke(invokeRequest, manywho.utils.extractTenantId(flowKey), authenticationToken)
            .then(function (response) {

                return isAuthorized(response, flowKey);

            })
            .then(function (response) {
                
                self.parseResponse(response, manywho.model.parseEngineResponse, flowKey);

                manywho.state.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);

                manywho.collaboration.initialize(manywho.settings.flow('collaboration.isEnabled', flowKey), flowKey);
                manywho.collaboration.join('user', flowKey);

                var deferreds = [];

                if (navigationElementReferences && navigationElementReferences.length > 0) {
                    deferreds.push(manywho.ajax.getNavigation(response.stateId, response.stateToken, navigationElementReferences[0].id, manywho.utils.extractTenantId(flowKey)));
                }

                if (currentStreamId) {
                    // Add create social stream ajax call to defereds here
                }

                return $.when.apply($, deferreds);

            }, function (response) {

                if (manywho.state.getSessionData(flowKey) != null) {

                    manywho.authorization.authorizeBySession(response.authorizationContext.loginUrl, flowKey, callback);

                } else {

                    // Authorization failed, retry
                    manywho.authorization.invokeAuthorization(response, flowKey, callback);

                }

            })
            .then(function (navigation, stream) {

                if (navigation) {

                    manywho.model.parseNavigationResponse(navigationElementReferences[0].id, navigation, flowKey);

                }

                if (stream) {
                    // TODO                    
                }

            })
            .then(function () {

                manywho.state.setLoading('main', null, flowKey);

                self.render(flowKey);

            })
            .then(function () {

                return processObjectDataRequests(manywho.model.getComponents(flowKey), flowKey);

            });
        
    }
 
    function joinWithAuthorization(callback, flowKey) {

        var self = this;
        var authenticationToken = manywho.state.getAuthenticationToken(flowKey);
        var state = manywho.state.getState(flowKey);

        manywho.utils.removeLoadingIndicator('loader');
        manywho.component.appendFlowContainer(flowKey);
        manywho.state.setLoading('main', { message: 'Joining...' }, flowKey);
        self.render(flowKey);

        manywho.ajax.join(state.id, manywho.utils.extractTenantId(flowKey), authenticationToken)
            .then(function (response) {

                return isAuthorized(response, flowKey);

            })
            .then(function (response) {

                self.parseResponse(response, manywho.model.parseEngineResponse, flowKey);

                manywho.state.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);

                manywho.collaboration.initialize(manywho.settings.flow('collaboration.isEnabled', flowKey), flowKey);
                manywho.collaboration.join('user', flowKey);

                var deferreds = [response];

                if (response.navigationElementReferences && response.navigationElementReferences.length > 0) {
                    deferreds.push(manywho.ajax.getNavigation(response.stateId, response.stateToken, response.navigationElementReferences[0].id, manywho.utils.extractTenantId(flowKey)));
                }

                if (response.currentStreamId) {
                    // Add create social stream ajax call to defereds here
                }

                return $.when.apply($, deferreds);

            }, function (response) {

                if (manywho.state.getSessionData(flowKey) != null) {

                    manywho.authorization.authorizeBySession(response.authorizationContext.loginUrl, flowKey, callback);

                } else {

                    // Authorization failed, retry
                    manywho.authorization.invokeAuthorization(response, flowKey, callback);

                }

            })
            .then(function (response, navigation, stream) {

                if (navigation) {

                    manywho.model.parseNavigationResponse(response.navigationElementReferences[0].id, navigation[0], flowKey);

                }

                if (stream) {
                    // TODO                    
                }

            })
            .then(function () {

                manywho.state.setLoading('main', null, flowKey);

                self.render(flowKey);

            })
            .then(function () {

                return processObjectDataRequests(manywho.model.getComponents(flowKey), flowKey);

            });

    }

    function moveWithAuthorization(callback, invokeRequest, flowKey) {

        var self = this;
        var authenticationToken = manywho.state.getAuthenticationToken(flowKey);
        
        manywho.ajax.invoke(invokeRequest, manywho.utils.extractTenantId(flowKey), authenticationToken)
            .then(function (response) {

                return isAuthorized(response, flowKey);

            })
            .then(function (response) {

                self.parseResponse(response, manywho.model.parseEngineResponse, flowKey);
                manywho.collaboration.move(flowKey);

                manywho.callbacks.execute(flowKey, response.invokeType, null, [response]);
                
                if (manywho.utils.isModal(flowKey)) {
                                        
                    var parentFlowKey = manywho.model.getParentForModal(flowKey);
                    
                    if (manywho.utils.isEqual(response.invokeType, 'done', true)) {

                        manywho.model.setModal(parentFlowKey, null);                        

                    }

                    self.render(parentFlowKey);

                }
                else {

                    manywho.state.setLoading('main', null, flowKey);

                    self.render(flowKey);

                }

                processObjectDataRequests(manywho.model.getComponents(flowKey), flowKey);

            }, function (response) {

                manywho.authorization.invokeAuthorization(response, flowKey, callback);

            });

    }
    
    function setIsWaiting(invokeType, flowKey) {

        waiting[flowKey] = manywho.utils.isEqual(invokeType, 'wait', true);

    }

    function getIsWaiting(flowKey) {

        return waiting[flowKey];

    }

    return {

        initialize: function(tenantId, flowId, flowVersionId, container, stateId, authenticationToken, options) {

            options = options || {};

            if (stateId) {

                this.join(tenantId, flowId, flowVersionId, container, stateId, authenticationToken, options);
                
            }
            else {

                var initializationRequest = manywho.json.generateInitializationRequest(
                    { id: flowId, versionId: flowVersionId },
                    stateId,
                    options.annotations,
                    options.inputs,
                    options.mode,
                    options.reportingMode
                );

                var self = this;

                manywho.ajax.initialize(initializationRequest, tenantId, authenticationToken)
                    .then(function (response) {
                        
                        var flowKey = manywho.utils.getFlowKey(tenantId, flowId, flowVersionId, response.stateId, container);

                        if (options.authentication != null && options.authentication.sessionId != null) {

                            manywho.state.setSessionData(options.authentication.sessionId, options.authentication.sessionUrl, flowKey);

                        }

                        manywho.model.initializeModel(flowKey);
                        manywho.settings.initializeFlow(options, flowKey);
                        manywho.state.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);

                        initializeWithAuthorization.call(self,
                            {
                                execute: initializeWithAuthorization,
                                context: self,
                                args: [response.navigationElementReferences, response.currentStreamId, flowKey],
                                name: 'invoke',
                                type: 'done'
                            },
                            response.navigationElementReferences,
                            response.currentStreamId,
                            flowKey);

                    });

            }

        },

        move: function(outcome, flowKey) {

            // Validate all of the components on the page here...
            // In the model.js, there are componentInputResponseRequests entries for each component
            // that needs to be validated. If a component does not validate correctly, it should
            // prevent the 'move' and also indicate in the UI which component has failed validation

            if(manywho.utils.isModal(flowKey)) {

                parentFlowKey = manywho.model.getParentForModal(flowKey);
                manywho.state.setLoading('main', { message: 'Executing...' }, parentFlowKey);
                this.render(parentFlowKey);

            } else {

                manywho.state.setLoading('main', { message: 'Executing...' }, flowKey);
                this.render(flowKey);

            }

            var invokeRequest = manywho.json.generateInvokeRequest(
                manywho.state.getState(flowKey),
                'FORWARD',
                outcome.id,
                manywho.state.getPageComponentInputResponseRequests(flowKey),
                manywho.settings.flow('annotations', flowKey),
                manywho.state.getGeoLocation(),
                manywho.settings.flow('mode', flowKey)
            );

            moveWithAuthorization.call(this,
                {
                    execute: moveWithAuthorization,
                    context: this,
                    args: [invokeRequest, flowKey],
                    name: 'invoke',
                    type: 'done'
                },  
                invokeRequest,
                flowKey);
               
        },

        sync: function(flowKey) {

            // Validate all of the components on the page here...
            // In the model.js, there are componentInputResponseRequests entries for each component
            // that needs to be validated. If a component does not validate correctly, it should
            // prevent the 'move' and also indicate in the UI which component has failed validation

            var invokeRequest = manywho.json.generateInvokeRequest(
                manywho.state.getState(flowKey),
                'SYNC',
                null,
                manywho.state.getPageComponentInputResponseRequests(flowKey),
                manywho.settings.flow('annotations', flowKey),
                null,
                manywho.settings.flow('mode', flowKey)
            );
            var self = this;
            
            return manywho.ajax.invoke(invokeRequest, manywho.utils.extractTenantId(flowKey))
                .then(function (response) {

                    self.parseResponse(response, manywho.model.parseEngineSyncResponse, flowKey);
                    return processObjectDataRequests(manywho.model.getComponents(flowKey), flowKey);

                });

        },

        navigate: function(navigationId, navigationElementId, flowKey) {

            manywho.state.setLoading('main', { message: 'Navigating...' }, flowKey);
            this.render(flowKey);

            var invokeRequest = manywho.json.generateNavigateRequest(
                manywho.state.getState(flowKey),
                navigationId,
                navigationElementId,
                manywho.settings.flow('annotations', flowKey),
                null);

            moveWithAuthorization.call(this,
                {
                    execute: moveWithAuthorization,
                    context: this,
                    args: [invokeRequest, flowKey],
                    name: 'invoke',
                    type: 'done'
                },
                invokeRequest,
                flowKey);

        },

        join: function (tenantId, flowId, flowVersionId, container, stateId, authenticationToken, options) {

            var self = this;
            var flowKey = manywho.utils.getFlowKey(tenantId, flowId, flowVersionId, stateId, container);

            if (options.authentication != null && options.authentication.sessionId != null) {

                manywho.state.setSessionData(options.authentication.sessionId, options.authentication.sessionUrl, flowKey);

            }

            manywho.model.initializeModel(flowKey);
            manywho.settings.initializeFlow(options, flowKey);
            
            manywho.state.setAuthenticationToken(authenticationToken, flowKey);
            manywho.state.setState(stateId, null, null, flowKey);

            joinWithAuthorization.call(this,
                {
                    execute: joinWithAuthorization,
                    context: this,
                    args: [flowKey],
                    name: 'invoke',
                    type: 'done'
                },
                flowKey);
                        
        },

        objectDataRequest: function(id, request, flowKey, limit, search, orderBy, orderByDirection, page) {

            var self = this;

            manywho.state.setLoading(id, { message: 'Loading...' }, flowKey);
            self.render(flowKey);

            return manywho.ajax.dispatchObjectDataRequest(request, manywho.utils.extractTenantId(flowKey), manywho.state.getAuthenticationToken(flowKey), limit, search, orderBy, orderByDirection, page)
                .then(function (response) {

                    manywho.state.setLoading(id, null, flowKey);

                    var component = manywho.model.getComponent(id, flowKey);
                    component.objectData = response.objectData;
                    component.objectDataRequest.hasMoreResults = response.hasMoreResults;
                    
                })
               .fail(function (xhr, status, error) {

                   manywho.state.setLoading(id, { error: error }, flowKey);

               })
               .always(function () {

                   self.render(flowKey);

               });

        },
        
        parseResponse: function(response, responseParser, flowKey) {

            responseParser.call(manywho.model, response, flowKey);

            manywho.state.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);
            manywho.state.refreshComponents(manywho.model.getComponents(flowKey), flowKey);

            if (manywho.settings.flow('replaceUrl', flowKey)) {
                manywho.utils.replaceBrowserUrl(response);
            }

            setIsWaiting(response.invokeType, flowKey);
            manywho.engine.ping(flowKey);

        },

        ping: function (flowKey) {

            if (getIsWaiting(flowKey)) {

                var state = manywho.state.getState(flowKey);
                var self = this;

                manywho.ajax.ping(manywho.utils.extractTenantId(flowKey), state.id, state.token, manywho.state.getAuthenticationToken(flowKey))
                    .then(function (response) {

                        if (response)
                        {

                            self.join(state.id);

                        }
                        else {

                            setTimeout(function () { self.ping(); }, 10000);

                        }

                    });

            }

        },

        render: function (flowKey) {

            if(manywho.utils.isModal(flowKey)) {

                flowKey = manywho.model.getParentForModal(flowKey);

            }

            React.render(React.createElement(manywho.component.getByName('main'), {flowKey: flowKey}), document.getElementById(flowKey));

        }

    }

})(manywho);
