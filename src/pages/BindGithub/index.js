import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import globalUtil from '../../utils/global';
@connect()
export default class CreateCheck extends PureComponent {
    constructor(props) {}

    UNSAFE_componentWillMount() {
        var params = this.props.match.params;
        this
            .props
            .dispatch({
                type: 'global/bindGithub',
                payload: {
                    code: params.code,
                    state: params.state
                },
                callback: () => {
                    this
                        .props
                        .dispatch(routerRedux.replace(`/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/create/code/github`))
                }
            })
    }
    render() {
        return null;
    }
}