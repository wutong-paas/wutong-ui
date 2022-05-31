import React from 'react';

export default class PublicLogin extends React.Component {
  UNSAFE_componentWillMount() {
    const href = `https://sso.wutong.com/#/login/${encodeURIComponent(
      location.href
    )}`;
    location.href = href;
  }
  componentDidMount() {}
  render() {
    return null;
  }
}
