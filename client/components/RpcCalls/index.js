
import React, { Component, PropTypes } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import _ from 'lodash';
import marked from 'marked';
import formatJson from 'format-json';

import Toggle from 'material-ui/Toggle/Toggle';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import CallIcon from 'material-ui/svg-icons/communication/call';
import AssignmentIcon from 'material-ui/svg-icons/action/assignment';
import InputIcon from 'material-ui/svg-icons/action/input';

import styles from './style.css';
import rpcData from '../../data/rpc.json';
import RpcNav from '../RpcNav';

const rpcMethods = _.sortBy(rpcData.methods, 'name');

export default class RpcCalls extends Component {

  constructor (...args) {
    super(...args);
    this.state = {};
  }

  renderClear () {
    if (!this.props.rpc.prevCalls.length) {
      return;
    }

    return (
      <a
        {...this._test('prev-calls-remove')}
        title='Clear RPC calls history'
        onClick={::this.props.actions.resetRpcPrevCalls}
        className={styles.removeIcon}
        >
        <i className='icon-trash'></i>
      </a>
    );
  }

  render () {
    return (
      <div className='dapp-flex-content'>
        <main className='dapp-content'>
          <div className='dapp-container'>
            <div className='row'>
              <div className='col col-6'>
                <h1><span>RPC</span> Requests</h1>
              </div>
              <div className='col col-6'>
                <RpcNav/>
              </div>
            </div>
          </div>
          <div style={{clear: 'both'}}></div>
          <div className='dapp-container'>
            <div className='row'>
              <div className='col col-6'>
                {this.renderForm()}
              </div>
              <div className='col col-6' {...this._test('prev-calls-container')}>
                {this.renderClear()}
                <h2 className={styles.header}>History</h2>
                <div className={`${styles.history} row`}>
                  {this.renderPrevCalls()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  renderPrevCalls () {
    const {prevCalls} = this.props.rpc;

    if (!prevCalls.length) {
      return (
        <div>
          <h3 className={styles.historyInfo} {...this._test('no-prev-calls')}>
            Fire up some RPC calls and the results will be here.
          </h3>
        </div>
      );
    }
    return prevCalls.map(
      (c, idx) => (
        <div
          key={idx}
          className={styles.call}
          {...this._test(`prev-call-${c.callNo}`)}
          >
          <span className={styles.callNo}>#{c.callNo}</span>
          <pre>{c.name}({c.params.toString()})</pre>
          <pre className={styles.response}>{c.response}</pre>
          {this.renderPrevCallsToolbar(prevCalls[idx])}
        </div>
      )
    );
  }

  renderForm () {
    return (
      <div>
        <Toggle
          className={styles.jsonToggle}
          onToggle={::this.onJsonToggle}
          label='JSON'
        />
        <h2 className={styles.header}>
          <label htmlFor='selectedMethod'>
            Call Method
          </label>
        </h2>
        {this.renderJsonEditor()}
        {this.renderFormEditor()}
        <button
          className={`dapp-block-button ${styles.button}`}
          onClick={() => ::this.onRpcFire() }
          >
          Fire!
        </button>
      </div>
    );
  }

  renderFormEditor () {
    if (this.state.jsonMode) {
      return;
    }

    const {selectedMethod} = this.props.rpc;
    return (
      <div className='row'>
        {this.renderMethodList()}
        <h3>Parameters</h3>
        {this.renderInputs()}
        <h3>Returns</h3>
        {this.renderMarkdown(selectedMethod.returns)}
      </div>
    );
  }

  renderJsonEditor () {
    if (!this.state.jsonMode) {
      return;
    }

    let errorClass = this.state.jsonEditorError ? styles.jsonEditorError : '';

    return (
      <div className='row'>
        <textarea
          onChange={::this.onJsonEditorChange}
          className={`${styles.jsonEditor} ${errorClass}`}
          value={this.state.jsonEditorValue}
          />
          {this.renderJsonEditorError()}
      </div>
    );
  }

  renderJsonEditorError () {
    if (!this.state.jsonEditorError) {
      return;
    }

    return (
      <div className={styles.jsonEditorErrorMsg}>{this.state.jsonEditorError}</div>
    );
  }

  renderMethodList () {
    const methods = rpcMethods.map(m => m.name);

    const {selectedMethod} = this.props.rpc;
    return (
      <div>
        <AutoComplete
          style={{marginTop: 0}}
          searchText={selectedMethod.name}
          floatingLabelText='Method name'
          dataSource={methods}
          onNewRequest={::this.handleMethodChange}
        />
        <div>
          {this.renderMarkdown(selectedMethod.desc)}
        </div>
      </div>
    );
  }

  renderMarkdown (val) {
    if (!val) {
      return;
    }

    return (
      <div dangerouslySetInnerHTML={{__html: marked(val)}} />
    );
  }

  handleMethodChange (name) {
    let method = rpcMethods.find(m => m.name === name);
    this.props.actions.selectRpcMethod(method);
  }

  onRpcFire (method = this.props.rpc.selectedMethod) {
    let params;

    if (this.state.jsonMode) {
      try {
        method = JSON.parse(this.state.jsonEditorValue);
      } catch (err) {
        // todo [adgo] 26.04.2016 - setup error handling and error toast
        this.props.actions.addToast('error parsing json, check console');
        return console.error('error parsing JSON: ', this.state.jsonEditorValue, err);
      }
      params = method.params;
    } else {
      params = method.params.map(p => this.state[`params_${p}`]);
    }

    this.props.actions.fireRpc({
      method: method.name,
      outputFormatter: method.outputFormatter,
      inputFormatters: method.inputFormatters,
      params: params
    });
  }

  setCall (call) {
    let method = _.find(rpcMethods, {name: call.name});
    this.props.actions.selectRpcMethod(method);

    // and set parameter values
    method.params.map((param, idx) => {
      this.setState({
        [`params_${param}`]: call.params[idx]
      });
    });
  }

  setAndCall (call) {
    this.setCall(call);
    let method = _.find(rpcMethods, {name: call.name});
    this.onRpcFire(method);
  }

  renderPrevCallsToolbar (call) {
    return (
      <div className={styles.callActionsWrap}>
        <IconButton className={styles.callActionsButton}><MoreVertIcon /></IconButton>
        <div className={styles.callActions}>
          <IconButton className={styles.callAction} onClick={() => ::this.setCall(call)} tooltip='Set' tooltipPosition='top-left'>
            <InputIcon className={styles.callActionIcon} />
          </IconButton>
          <IconButton className={styles.callAction} onClick={() => ::this.setAndCall(call)} tooltip='Fire again' tooltipPosition='top-left'>
            <CallIcon className={styles.callActionIcon} />
          </IconButton>
          <CopyToClipboard
            text={JSON.stringify(call)}
            onCopy={() => this.props.actions.addToast('Method copied to clipboard!')}
            >
            <IconButton className={styles.callAction} tooltip='Copy to clipboard' tooltipPosition='top-left'>
              <AssignmentIcon className={styles.callActionIcon}/>
            </IconButton>
          </CopyToClipboard>
        </div>
      </div>
    );
  }

  renderInputs () {
    let {selectedMethod} = this.props.rpc;

    if (!selectedMethod.params || !selectedMethod.params.length) {
      return (
        <span>none</span>
      );
    }

    return _.find(rpcMethods, {name: selectedMethod.name})
            .params.map(
              p => (
                <TextField
                  key={p}
                  inputStyle={{marginTop: 0}}
                  fullWidth
                  hintText={p}
                  hintStyle={{maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap'}}
                  value={this.state[`params_${p}`]}
                  onChange={(evt) => this.setState({
                    [`params_${p}`]: evt.target.value
                  })}
                />
              )
            );
  }

  onJsonEditorChange (evt) {
    const {value} = evt.target;

    try {
      JSON.parse(value);
      this.setState({jsonEditorError: null});
    } catch (err) {
      this.setState({jsonEditorError: 'invalid json'});
    }

    this.setState({
      jsonEditorValue: value
    });
  }

  setJsonEditorValue () {
    const {selectedMethod} = this.props.rpc;
    const method = {
      name: selectedMethod.name,
      params: selectedMethod.params.map(p => this.state[`params_${p}`]),
      inputFormatters: selectedMethod.inputFormatters,
      outputFormatter: selectedMethod.outputFormatter
    };
    this.setState({
      jsonEditorValue: formatJson.plain(method)
    });
  }

  onJsonToggle () {
    if (!this.state.jsonMode) {
      this.setJsonEditorValue();
    }
    this.setState({jsonMode: !this.state.jsonMode});
  }

}

RpcCalls.propTypes = {
  rpc: PropTypes.shape({
    prevCalls: PropTypes.array.isRequired,
    selectedMethod: PropTypes.object.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    fireRpc: PropTypes.func.isRequired,
    addToast: PropTypes.func.isRequired,
    selectRpcMethod: PropTypes.func.isRequired,
    resetRpcPrevCalls: PropTypes.func.isRequired
  }).isRequired
};
