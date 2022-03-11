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

export default class AreaChart extends PureComponent {
  render() {
    const { metaData, scale } = this.props
    console.log(metaData)

    return (
      <div>
        <Chart height={400} data={metaData} scale={scale} forceFit>
          <Axis name="key" />
          <Axis name="value" />
          <Legend />
          <Tooltip
            crosshairs={{
              type: "line"
            }}
          />
          <Geom type="areaStack" position="key*value" color="pod" />
          <Geom type="lineStack" position="key*value" size={2} color="pod"  />
        </Chart>
      </div>
    )
  }
}
