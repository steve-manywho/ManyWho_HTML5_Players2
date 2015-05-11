(function (manywho) {

    var play = React.createClass({

        render: function () {

            return React.DOM.div({}, [
                React.DOM.div({ className: 'form-group row' }, [
                    React.DOM.label({ htmlFor: 'name' }, [
                        'Component Name',
                        React.DOM.span({ className: 'input-required' }, ' *')
                    ]),
                    React.DOM.input({ ref: 'name', className: 'form-control', id: 'name', type: 'text', required: 'required' })
                ]),
                React.DOM.div({ className: 'form-group row' }, [
                    React.DOM.label({ htmlFor: 'content' }, [
                        'Link to media file',
                        React.DOM.span({ className: 'input-required' }, ' *')
                    ]),
                    React.DOM.input({ ref: 'content', className: 'form-control', id: 'content', type: 'text', required: 'required' })
                ]),
                React.DOM.div({ className: 'form-group row' }, [
                    React.DOM.label({ htmlFor: 'loop' }, [
                        'Loop',
                        React.DOM.span({ className: 'input-required' }, ' *')
                    ]),
                    React.DOM.input({ ref: 'loop', className: 'form-control', id: 'loop', type: 'number', required: 'required' })
                ]),
                React.DOM.div({ className: 'form-group row' }, [
                    React.DOM.label({ htmlFor: 'timeout' }, [
                        'Timeout',
                        React.DOM.span({ className: 'input-required' }, ' *')
                    ]),
                    React.DOM.input({ ref: 'timeout', className: 'form-control', id: 'timeout', type: 'number', required: 'required' })
                ]),
                React.DOM.div({ className: 'form-group row' }, [
                    React.DOM.label({ htmlFor: 'recordingType' }, [
                        'Recording Type',
                        React.DOM.span({ className: 'input-required' }, ' *')
                    ]),
                    React.DOM.select({ ref: 'recordingType', className: 'form-control', id: 'recordingType', required: 'required', placeholder: 'Please choose an option' }, [
                        React.DOM.option({}, 'auto'),
                        React.DOM.option({}, 'voice'),
                        React.DOM.option({}, 'call')
                    ])
                ]),
                React.DOM.div({ className: 'form-group row' }, [
                    React.DOM.input({ ref: 'interruptOnDTMF', id: 'interruptOnDTMF', type: 'checkbox' }),
                    React.DOM.label({ htmlFor: 'interruptOnDTMF' }, 'Interrupt on DTMF')
                ])
            ]);

        }

    });

    manywho.layout.registerComponent('play', play);

})(manywho);