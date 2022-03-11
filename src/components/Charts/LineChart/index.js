import React, { PureComponent } from 'react'
import {
  G2,
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord,
  Label,
  Legend,
  View,
  Guide,
  Shape,
  Facet,
  Util
} from 'bizcharts'

export default class LineChart extends PureComponent {
  render() {
    const { data, title, scale, xlabel, ylabel, tooltip } = this.props

    return (
      <div>
        <div style={{ textAlign: 'center', userSelect: 'none' }}>{title}</div>
        <Chart height={360} data={data} scale={scale} forceFit>
          <Axis name="timestamp" label={xlabel} />
          <Axis name="value" label={ylabel} />
          <Tooltip crosshairs={{ type: "y" }} />
          <Geom type="line" position="timestamp*value" tooltip={tooltip} color='instance' />
        </Chart>
      </div>
    )
  }
}
