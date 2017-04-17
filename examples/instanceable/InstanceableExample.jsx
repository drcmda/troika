import React from 'react'
import {Canvas3D, Group3DFacade, ListFacade, PerspectiveCamera3DFacade} from '../../src/index'
import {InstanceableSphere, NonInstanceableSphere} from './Sphere'

const ORIGIN = {x:0, y:0, z:0}

class OrbitingCamera extends PerspectiveCamera3DFacade {
  lookAt = ORIGIN

  afterUpdate() {
    let {azimuth=0, inclination=0, radius=1} = this
    this.x = Math.cos(azimuth) * Math.sin(inclination) * radius
    this.y = Math.cos(inclination) * radius
    this.z = Math.sin(azimuth) * Math.sin(inclination) * radius
    super.afterUpdate()
  }
}


export default React.createClass({
  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },

  getInitialState() {
    return {
      useInstancing: true,
      objectCount: 50000,
      data: []
    }
  },

  componentWillMount() {
    this._generateData()
  },

  _generateData() {
    let data = new Array(this.state.objectCount)
    for (let i = data.length; i--;) {
      data[i] = {
        id: `sphere${i}`,
        x: Math.random() * 1000 - 500,
        y: Math.random() * 1000 - 500,
        z: Math.random() * 1000 - 500,
        color: i % 3 === 2 ? 0x990000 : i % 3 === 1 ? 0x009900 : 0x000099
      }
    }
    this.setState({data})
  },

  _onSliderChange(e) {
    this.setState({[e.target.name]: +e.target.value})
  },

  _onInstancingToggle(e) {
    this.setState({useInstancing: !this.state.useInstancing})
  },

  _onSphereOver(e) {
    this.setState({hoveredId: e.target.id})
    cancelAnimationFrame(this._unhoverTimer)
  },

  _onSphereOut(e) {
    this._unhoverTimer = requestAnimationFrame(() => {
      this.setState({hoveredId: null})
    })
  },

  render() {
    let state = this.state
    let {width, height} = this.props

    return (
      <div>
        <Canvas3D
          antialias
          width={ width }
          height={ height }
          lights={ [
            { type: 'ambient', color: 0x666666 },
            { type: 'directional', color: 0xffffff, x: 1, y: 1, z: 1 },
            { type: 'directional', color: 0xffffff, x: -1, y: -1, z: -1 }
          ] }
          camera={ {
            class: OrbitingCamera,
            far: 10000,
            radius: 2000,
            azimuth: 0, inclination: 0,
            animation: [{
              from: {azimuth: 0},
              to: {azimuth: Math.PI * 2},
              duration: 20000,
              iterations: Infinity,
              paused: !!state.hoveredId
            }, {
              from: {inclination: 0},
              to: {inclination: Math.PI / 1.1},
              direction: 'alternate',
              easing: 'easeInOutSine',
              duration: 8000,
              iterations: Infinity,
              paused: !!state.hoveredId
            }]
          } }
          objects={ {
            key: 'main',
            class: Group3DFacade,
            children: {
              key: 'items',
              class: ListFacade,
              data: state.data,
              template: {
                key: (d) => d.id,
                class: state.useInstancing ? InstanceableSphere : NonInstanceableSphere,
                id: (d) => d.id,
                color: d => d.id === state.hoveredId ? 0xffffff : d.color,
                x: d => d.x,
                y: d => d.y,
                z: d => d.z,
                radius: d => d.id === state.hoveredId ? 10 : 6,
                onMouseOver: () => this._onSphereOver,
                onMouseOut: () => this._onSphereOut
              }
            }
          } }
        />

        <div className="example_desc">
          <p>Demonstrates the usage of Instanceable3DFacade for fast rendering of thousands of similar objects.</p>
        </div>

        <div className="example_controls">
          <div>
            Number of objects: <input
              type="range"
              name="objectCount"
              onChange={ this._onSliderChange }
              value={ state.objectCount }
              min="100"
              max="100000"
            /> { state.objectCount } {
              state.objectCount !== state.data.length ? (
                <button onClick={ this._generateData } >Regenerate</button>
              ) : null
            }
          </div>
          <div>
            Use instancing: <input type="checkbox" checked={ state.useInstancing } onChange={ this._onInstancingToggle } />
          </div>
        </div>
      </div>
    )
  }
})
