import React from 'react';

import AutoComplete from 'material-ui/AutoComplete';

import styles from './styles.css';

import {Wallet} from '../Wallet/Wallet';
import {AccountChooser} from '../AccountsChooser/AccountsChooser';
import {DappContent} from '../DappContent/DappContent';

function getCurrentPage () {
  const host = window.location.host.toString();
  return host.split('.')[0];
}

function isMainPage () {
  const host = window.location.host.toString();
  return host.indexOf('my.parity') > 0;
}

function getInitialUrl () {
  if (isMainPage()) {
    return 'local://dapp.html';
  }

  return `parity://${getCurrentPage()}`;
}

export class App extends React.Component {

  state = {
    accounts: [],
    allAccounts: [],
    url: getInitialUrl(),
    hints: [
      'local://dapp.html',
      'local://index.html',
      'parity://dapp',
      'ipfs://dapp',
      'parity://test',
      'http://ethcore.github.io/parity-web-ui/dapp.html'
    ]
  };

  changeAccount (account) {
    this.setState({
      accounts: [account]
    });
  }

  onAllAccounts (accounts) {
    this.setState({
      allAccounts: accounts
    });
  }

  onAddressChange (address) {
    this.setState({
      url: address
    });
  }

  renderTopBar () {
    if (!isMainPage()) {
      return (
        <ul>
          <li><a href='http://wallet.my.parity'>Home</a></li>
          <li><a href='http://dapp.my.parity'>Dapp</a></li>
        </ul>
      );
    }
    return (
      <AutoComplete
        fullWidth
        hintText='http://...'
        searchText={this.state.url}
        dataSource={this.state.hints}
        onNewRequest={::this.onAddressChange}
        />
    );
  }

  renderContent () {
    if (!isMainPage()) {
      return (
        <Wallet accounts={this.state.allAccounts} />
      );
    }

    return (
      <DappContent
        url={this.state.url}
        accounts={this.state.accounts}
        />
    );
  }

  render () {
    return (
      <div>
        <div className={styles.nav}>
          <div style={{flex: 1}}>
            {this.renderTopBar()}
          </div>
          <div>
            <AccountChooser
              onChange={::this.changeAccount}
              onAllAccounts={::this.onAllAccounts}
              />
          </div>
        </div>
        {this.renderContent()}
      </div>
    );
  }
}
