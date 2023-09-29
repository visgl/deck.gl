import React, {Component} from 'react';
import {GITHUB_TREE, MAPBOX_STYLES} from '../constants/defaults';
import App from 'website-examples/carto-sql/app';

import {makeExample} from '../components';

const INDEXES = {
  'Total Spend': 'txn_amt',
  'Total Transactions': 'txn_cnt',
  'Total Accounts': 'acct_cnt',
  'Average Ticket Size': 'avg_ticket'
};
const INDUSTRIES = {
  'Total Retail': 'ret',
  'Total Apparel': 'app',
  Accommodations: 'acc',
  'Automotive Fuel': 'aut',
  'Eating Places': 'eap',
  'Grocery and Food Stores': 'gro'
};

class CartoSQLDemo extends Component {
  static title = 'Mastercard Index In New York';

  static code = `${GITHUB_TREE}/examples/website/carto-sql`;

  static parameters = {
    index: {
      displayName: 'Index',
      type: 'select',
      options: Object.keys(INDEXES),
      value: 'Total Spend'
    },
    industry: {
      displayName: 'Industry',
      type: 'select',
      options: Object.keys(INDUSTRIES),
      value: 'Total Retail'
    }
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo() {
    return (
      <div>
        <p>Mastercard Index January 2020.</p>
        <p>
          A locations’s index shows how it ranks against all the other locations in the area. The
          number represents the percentile, for example, a 900 spend index means a location has
          higher spend than 90% of locations.
        </p>
        <div style={{height: 8, width: '100%', display: 'flex', flexDirection: 'row'}}>
          <div style={{flex: '0 0 14.28%', background: 'rgb(254, 246, 181)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(255, 221, 154)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(255, 194, 133)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(255, 166, 121)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(250, 138, 118)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(241, 109, 122)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(225, 83, 131)'}} />
        </div>
        <div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
          <div style={{width: '14.28%'}}>0</div>
          <div style={{width: '14.28%'}}>25</div>
          <div style={{width: '14.28%'}}>50</div>
          <div style={{width: '14.28%'}}>100</div>
          <div style={{width: '14.28%'}}>300</div>
          <div style={{width: '14.28%'}}>500</div>
          <div style={{width: '14.28%'}}>1000</div>
        </div>
        <p>
          Data source: <a href="https://carto.com/solutions/mastercard/">MasterCard</a>
        </p>
      </div>
    );
  }

  render() {
    const {params} = this.props;
    const index = INDEXES[params.index.value];
    const industry = INDUSTRIES[params.industry.value];

    return <App {...this.props} mrliIndex={index} industry={industry} />;
  }
}

export default makeExample(CartoSQLDemo);
