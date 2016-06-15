import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import componentsData from '../../components.data.js';
import AppBar from 'material-ui/AppBar';
import styles from './Header.css';

export default class Header extends Component {

  render () {
    return (
      <div className={ styles.container }>
        <AppBar
          title='Dapps React UI'
          showMenuIconButton={ false }
        />
        <nav>
          <Link to={ '/welcome' } activeClassName='active'>Welcome</Link>
          { this.renderComponentsLinks() }
        </nav>
      </div>
    );
  }

  renderComponentsLinks () {
    return componentsData.map(c => {
      return (
        <span className={ styles.link } key={ c.name }>
          <Link to={ '/' + c.name } activeClassName='active'>{ c.name }</Link>
        </span>
      )
    });
  }

}
