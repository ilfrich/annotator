import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import mixins from "../../mixins"
import util from "../../util"
import common from "../../tools/common"

const SPEED = {
    max: 1500,
    min: 100,
}
const DEFAULT_WIDTH = [250, 500, 750]

const style = {
    image(current, currentFrame, start, markFrames) {
        if (current === currentFrame && markFrames) {
            return {
                border: "2px solid #f00",
            }
        }
        if (current === start && markFrames) {
            return {
                border: "2px solid #0f0",
            }
        }
        return {
            border: "2px solid #f3f3f3",
        }
    },
    controls: {
        padding: "10px",
    },
    controlOptions: {
        paddingTop: "10px",
        display: "grid",
        gridTemplateColumns: "120px 120px",
        gridColumnGap: "5px",
    },
    toolBoxHeader: {
        fontSize: "10px",
        fontWeight: "600",
        textDecoration: "underline",
        paddingBottom: "4px",
    },
    expand: {
        ...mixins.icon,
        background: "rgba(200, 200, 200, 0.5)",
        position: "absolute",
        top: "5px",
        left: "5px",
    },
}

class FramePlayer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            speed: util.getLocalStorageNumber("defaultSpeed", 500),
            frames: util.getLocalStorageNumber("defaultFrames", 5),
            windowWidth: DEFAULT_WIDTH[0],
            frameNumbers: [],
            current: null,
            start: null,
            end: null,
            playing: false,
            markFrames: true,
        }

        this.changeSpeed = this.changeSpeed.bind(this)
        this.changeFrames = this.changeFrames.bind(this)
        this.changeWindowWidth = this.changeWindowWidth.bind(this)
        this.pause = this.pause.bind(this)
        this.resume = this.resume.bind(this)
        this.toggleMarkFrames = this.toggleMarkFrames.bind(this)
        this.mouseMove = this.mouseMove.bind(this)
        this.timer = null
    }

    componentDidMount() {
        this.setFrameNumbers()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.currentFrame !== this.props.currentFrame || prevState.frames !== this.state.frames) {
            this.setFrameNumbers()
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    setFrameNumbers() {
        this.pause()
        const { image, currentFrame } = this.props
        const { frames } = this.state

        const result = []
        const start = Math.max(0, currentFrame - frames)
        const end = Math.min(image.numFrames - 1, currentFrame + frames)

        for (let i = start; i <= end; i += 1) {
            result.push(i)
        }
        this.setState({
            frameNumbers: result,
            current: start,
            start,
            end,
        })
        this.resume()
    }

    pause() {
        if (this.timer != null) {
            clearInterval(this.timer)
            this.setState({
                playing: false,
            })
        }
    }

    resume() {
        this.timer = setInterval(() => {
            this.setState(oldState => {
                let newValue = oldState.current + 1
                if (oldState.current === oldState.end) {
                    newValue = oldState.start
                }
                return {
                    ...oldState,
                    current: newValue,
                }
            })
        }, this.state.speed)
        this.setState({
            playing: true,
        })
    }

    toggleMarkFrames() {
        this.setState(oldState => ({
            ...oldState,
            markFrames: !oldState.markFrames,
        }))
    }

    changeSpeed(ev) {
        const newSpeed = SPEED.max + SPEED.min - parseInt(ev.target.value, 10)
        this.setState({ speed: newSpeed })
        this.pause()
        this.resume()
        localStorage.setItem("defaultSpeed", newSpeed)
    }

    changeFrames(ev) {
        const frames = parseInt(ev.target.value, 10)
        this.setState({ frames })
        localStorage.setItem("defaultFrames", frames)
    }

    changeWindowWidth() {
        this.setState(oldState => {
            let newIndex = DEFAULT_WIDTH.indexOf(oldState.windowWidth) + 1
            if (newIndex === DEFAULT_WIDTH.length) {
                newIndex = 0
            }
            return {
                ...oldState,
                windowWidth: DEFAULT_WIDTH[newIndex],
            }
        })
    }

    mouseMove(ev) {
        const { image } = this.props
        const { windowWidth } = this.state
        const zoom = windowWidth / image.width
        const mousePos = common.getMousePos(this.image, ev, zoom)
        this.props.redraw(mousePos)
    }

    render() {
        const { image, currentFrame } = this.props
        const { current, windowWidth, start, frames, speed, playing, markFrames } = this.state

        if (current == null) {
            return null
        }

        return (
            <div style={mixins.relative}>
                <div style={style.expand} onClick={this.changeWindowWidth}>
                    <FontAwesomeIcon icon="expand" />
                </div>
                <img
                    src={`/image/${image.projectId}/${image._id}/${current}`}
                    width={windowWidth}
                    style={style.image(current, currentFrame, start, markFrames)}
                    onMouseMove={this.mouseMove}
                    onMouseOut={() => {
                        this.props.redraw()
                    }}
                    ref={el => {
                        this.image = el
                    }}
                />
                <div style={style.controls}>
                    <div>
                        {/* pause/resume button and player progress indicator */}
                        <div style={mixins.icon} onClick={playing ? this.pause : this.resume}>
                            {playing ? <FontAwesomeIcon icon="pause" /> : <FontAwesomeIcon icon="play" />}
                        </div>
                        <div style={mixins.icon} onClick={this.toggleMarkFrames}>
                            {this.state.current}
                        </div>
                    </div>
                    <div style={style.controlOptions}>
                        {/* controls for speed and num frames */}
                        <div style={style.toolBoxHeader}>Prev/Next Frames</div>
                        <div style={style.toolBoxHeader}>Speed</div>
                        <div>
                            <input
                                type="number"
                                style={mixins.textInput}
                                onChange={this.changeFrames}
                                step={1}
                                min={1}
                                max={Math.min(10, image.numFrames)}
                                defaultValue={frames}
                            />
                        </div>
                        <div>
                            <input
                                type="range"
                                min={SPEED.min}
                                max={SPEED.max}
                                step={100}
                                onChange={this.changeSpeed}
                                defaultValue={SPEED.max + SPEED.min - speed}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default FramePlayer
