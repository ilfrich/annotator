import React from "react"
import { Popup, mixins } from "quick-n-dirty-react"

const style = {
    slider: {
        marginTop: "3px",
        width: "140px",
        height: "20px",
    },
    sliderLegend: {
        width: "140px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        fontStyle: "italic",
        fontSize: "11px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gridColumnGap: "20px",
    },
    label: {
        ...mixins.label,
        textDecoration: "none",
        marginTop: "0px",
    },
    transparencyNumber: {
        cursor: "forbidden",
        width: "50px",
        display: "inline-block",
        textAlign: "center",
        marginLeft: "15px",
    },
    checkboxGrid: {
        display: "grid",
        gridTemplateColumns: "30px 1fr",
        gridRowGap: "10px",
    },
}

class SettingsPopup extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            transparency: 0.5,
        }

        this.save = this.save.bind(this)
        this.changeTransparency = this.changeTransparency.bind(this)
    }

    componentDidMount() {
        this.setState({
            transparency: 1.0 - this.props.settings.ANTR_TRANSPARENCY,
        })
    }

    changeTransparency(ev) {
        const value = parseFloat(ev.target.value)
        this.setState({
            transparency: value,
        })
    }

    save() {
        const settings = {
            ANTR_SAVE_FRAME_NEXT: this.saveNextFrame.checked,
            ANTR_OUTLINE_ONLY: this.outlineOnly.checked,
            ANTR_TRANSPARENCY: 1.0 - this.state.transparency,
        }
        this.props.saveSettings(settings)
    }

    render() {
        return (
            <Popup title="Annotation Settings" cancel={this.props.toggle} ok={this.save}>
                <div style={style.grid}>
                    {/* transparency */}
                    <div>
                        <div>
                            <label style={mixins.label}>Transparency of Annotations</label>
                        </div>
                        <div style={mixins.flexRow}>
                            <div>
                                <input
                                    ref={el => {
                                        this.transparency = el
                                    }}
                                    type="range"
                                    min="0"
                                    max="1"
                                    step={0.1}
                                    value={this.state.transparency}
                                    style={style.slider}
                                    onChange={this.changeTransparency}
                                />
                            </div>
                            <div style={style.transparencyNumber}>
                                <input
                                    type="text"
                                    disabled
                                    value={this.state.transparency.toFixed(1)}
                                    style={mixins.textInput}
                                />
                            </div>
                        </div>
                        <div style={style.sliderLegend}>
                            <div>solid</div>
                            <div style={mixins.right}>invisible</div>
                        </div>
                    </div>
                    {/* outline */}
                    <div style={style.checkboxGrid}>
                        <div>
                            <input
                                type="checkbox"
                                id="outline-only"
                                defaultChecked={this.props.settings.ANTR_OUTLINE_ONLY}
                                ref={el => {
                                    this.outlineOnly = el
                                }}
                            />
                        </div>
                        <div>
                            <label style={style.label} htmlFor="outline-only">
                                Show only outline of annotations
                            </label>
                        </div>
                        <div>
                            <input
                                type="checkbox"
                                id="save-frame-switch"
                                defaultChecked={this.props.settings.ANTR_SAVE_FRAME_NEXT}
                                ref={el => {
                                    this.saveNextFrame = el
                                }}
                            />
                        </div>
                        <div>
                            <label style={style.label} htmlFor="save-frame-switch">
                                Save annotations when navigating to different frame (frame sets only)
                            </label>
                        </div>
                    </div>
                    {/* save on frame nav */}
                </div>
            </Popup>
        )
    }
}

export default SettingsPopup
