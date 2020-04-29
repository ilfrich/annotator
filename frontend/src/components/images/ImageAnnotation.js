import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Alert from "react-s-alert"
import mixins from "../../mixins"
import util from "../../util"
import Popup from "../Popup"
import PolygonTool from "../../tools/PolygonTool"
import EraserTool from "../../tools/EraserTool"
import SplineTool from "../../tools/SplineTool"
import FreeHandTool from "../../tools/FreeHandTool"
import DownloadForm from "../forms/DownloadForm"
import FrameControl from "./FrameControl"
import FramePlayer from "./FramePlayer"
import SettingsPopup from "../forms/SettingsPopup"
import EditTool from "../../tools/EditTool"

const style = {
    slider: {
        marginTop: "3px",
        width: "230px",
        height: "20px",
    },
    wrapper: {
        paddingBottom: "100px",
    },
    canvas: (width, height, cursor) => ({
        ...cursor,
        width: `${width}px`,
        height: `${height}px`,
        position: "absolute",
        top: "0px",
        left: "0px",
        zIndex: "5",
    }),
    toolBox: {
        position: "fixed",
        bottom: "0px",
        left: "0px",
        padding: "10px 20px",
        borderTop: "1px solid #ccc",
        background: "#eee",
        width: "100vw",
        zIndex: "10",
    },
    toolboxLayout: {
        display: "grid",
        gridTemplateColumns: "250px 80px 300px 120px 200px",
        gridColumnGap: "10px",
    },
    toolBoxHeader: {
        fontSize: "10px",
        fontWeight: "600",
        textDecoration: "underline",
        paddingBottom: "4px",
    },
    settingsIcon: {
        position: "absolute",
        bottom: "2px",
        right: "55px",
        border: "1px solid #333",
        cursor: "pointer",
        display: "inline-block",
        padding: "4px 5px",
    },
    toggleAnnotation: {
        position: "absolute",
        bottom: "5px",
        right: "90px",
    },
    zoomLevel: {
        background: "#33aa66",
        fontWeight: "600",
        padding: "5px",
        display: "inline-block",
        marginLeft: "15px",
    },
    label: {
        paddingTop: "3px",
        display: "inline-block",
    },
    toolIcon: selected => ({
        ...mixins.clickable,
        padding: "5px",
        minWidth: "18px",
        border: "1px solid #333",
        borderRadius: "2px",
        marginRight: "8px",
        background: selected ? "#33aa66" : null,
    }),
    saveIcon: {
        position: "absolute",
        top: "0px",
        right: "0px",
    },
    inactiveIcon: {
        color: "#999",
        cursor: "not-allowed",
    },
    optionPanel: {
        position: "fixed",
        right: "0px",
        bottom: "100px",
        width: "220px",
        padding: "15px",
        borderLeft: "1px solid #ccc",
        borderTop: "1px solid #ccc",
        borderBottom: "1px solid #ccc",
        borderTopLeftRadius: "10px",
        borderBottomLeftRadius: "10px",
        zIndex: 10,
        background: "#f3f3f3",
    },
    framePlayer: {
        position: "fixed",
        top: "50px",
        right: "0px",
        borderLeft: "1px solid #ccc",
        borderTop: "1px solid #ccc",
        borderBottom: "1px solid #ccc",
        borderTopLeftRadius: "10px",
        borderBottomLeftRadius: "10px",
        zIndex: 10,
        padding: "5px 5px 15px 5px",
        background: "#f3f3f3",
    },
}

const TOOLS = {
    polygon: {
        id: "polygon",
        label: "Draw Polygon",
        icon: "draw-polygon",
        ToolClass: PolygonTool,
    },
    freehand: {
        id: "freehand",
        label: "Freehand Tool",
        icon: "pen",
        ToolClass: FreeHandTool,
    },
    spline: {
        id: "spline",
        label: "Spline Polygon",
        icon: "splotch",
        ToolClass: SplineTool,
    },
    eraser: {
        id: "eraser",
        label: "Delete Polygon",
        icon: "eraser",
        ToolClass: EraserTool,
    },
    edit: {
        id: "edit",
        label: "Adjust Annotation",
        icon: "cut",
        ToolClass: EditTool,
    },
}

const settingKeys = ["ANTR_SAVE_FRAME_NEXT", "ANTR_OUTLINE_ONLY", "ANTR_TRANSPARENCY"]

class ImageAnnotation extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            zoom: util.getLocalStorageFloat("defaultZoom", 1.0),
            tool: null,
            polygons: [],
            changed: false,
            currentFrame: 0,
            showSettings: false,
            showAnnotations: true,
            settings: {
                ANTR_SAVE_FRAME_NEXT: false,
                ANTR_OUTLINE_ONLY: false,
                ANTR_TRANSPARENCY: 0.5,
            },
        }

        this.getWidth = this.getWidth.bind(this)
        this.getHeight = this.getHeight.bind(this)
        this.getCursor = this.getCursor.bind(this)
        this.changeZoom = this.changeZoom.bind(this)
        this.selectTool = this.selectTool.bind(this)
        this.redraw = this.redraw.bind(this)
        this.delayedRedraw = this.delayedRedraw.bind(this)
        this.handleCanvasClick = this.handleCanvasClick.bind(this)
        this.handleCanvasDown = this.handleCanvasDown.bind(this)
        this.handleCanvasUp = this.handleCanvasUp.bind(this)
        this.handleCanvasMove = this.handleCanvasMove.bind(this)
        this.addElement = this.addElement.bind(this)
        this.removeElement = this.removeElement.bind(this)
        this.init = this.init.bind(this)
        this.save = this.save.bind(this)
        this.importPolygons = this.importPolygons.bind(this)
        this.handleWheelEvent = this.handleWheelEvent.bind(this)
        this.switchFrame = this.switchFrame.bind(this)
        this.toggleSettings = this.toggleSettings.bind(this)
        this.changeSetting = this.changeSetting.bind(this)
        this.toggleAnnotations = this.toggleAnnotations.bind(this)
    }

    componentDidMount() {
        const { canvas } = this
        this.ctx = canvas.getContext("2d")
        this.init()

        // load settings
        const settingsUpdate = {}
        settingKeys.forEach(key => {
            const value = localStorage.getItem(key)
            if (value != null) {
                if (value === "true" || value === "false") {
                    settingsUpdate[key] = value === "true"
                } else {
                    const parsedValue = parseFloat(value)
                    if (!isNaN(parsedValue)) {
                        settingsUpdate[key] = parsedValue
                    } else {
                        settingsUpdate[key] = value
                    }
                }
            }
        })
        if (Object.keys(settingsUpdate).length > 0) {
            this.setState(oldState => ({
                ...oldState,
                settings: {
                    ...oldState.settings,
                    ...settingsUpdate,
                },
            }))
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.annotation == null && prevProps.annotation != null) {
            this.init()
            return
        }
        if (this.props.annotation != null && prevProps.annotation == null) {
            this.init()
            return
        }
        if (this.props.annotation == null && prevProps.annotation == null) {
            return
        }
        if (this.props.annotation._id !== prevProps.annotation._id) {
            this.init()
        }
    }

    getCursor() {
        if (this.state.tool == null) {
            return {}
        }

        const cursor = this.state.tool.getCursor()
        if (cursor == null) {
            return {}
        }

        return {
            cursor,
        }
    }

    getWidth() {
        return this.props.image.width * this.state.zoom
    }

    getHeight() {
        return this.props.image.height * this.state.zoom
    }

    init() {
        if (this.props.annotation == null) {
            this.setState({
                polygons: [],
            })
        } else if (this.props.image.numFrames == null) {
            this.setState({
                polygons: this.props.annotation.shapes,
            })
        } else if (this.props.annotation[this.state.currentFrame] == null) {
            this.setState({
                polygons: [],
            })
        } else {
            // image frames
            this.setState(oldState => ({
                polygons: this.props.annotation[oldState.currentFrame].shapes,
            }))
        }
        this.delayedRedraw()
    }

    toggleSettings() {
        this.setState(oldState => ({
            showSettings: !oldState.showSettings,
        }))
    }

    toggleAnnotations() {
        this.setState(oldState => ({
            showAnnotations: !oldState.showAnnotations,
        }))
        this.delayedRedraw()
    }

    changeSetting(updatedSettings) {
        // save in browser's local storage
        Object.keys(updatedSettings).forEach(key => {
            localStorage.setItem(key, updatedSettings[key].toString())
        })
        // update state
        this.setState({
            settings: updatedSettings,
            showSettings: false,
        })
        // redraw everything
        this.delayedRedraw()
    }

    switchFrame(newFrame) {
        if (this.state.settings.ANTR_SAVE_FRAME_NEXT && this.state.changed) {
            // save annotations
            this.save()
        }
        this.setState({
            currentFrame: newFrame,
            changed: false,
        })
        setTimeout(() => {
            this.init()
        }, 100)
    }

    changeZoom(ev) {
        const zoomLevel = parseFloat(ev.target.value)
        if (isNaN(zoomLevel)) {
            return
        }
        this.setState({
            zoom: zoomLevel,
        })
        localStorage.setItem("defaultZoom", zoomLevel)

        setTimeout(() => {
            if (this.state.tool != null) {
                this.state.tool.updateZoom(zoomLevel)
            } else {
                this.redraw()
            }
        }, 200)
    }

    /**
     * Event handler for selecting a tool from the tool box. It will update the currently selected tool accordingly and
     * perform additional operations for selecting the polygon tool when it is already selected (reset current polygon)
     * @param {string} toolId - the id of the tool that was selected
     * @returns {Function} an event handler function
     */
    selectTool(toolId) {
        return () => {
            this.setState(oldState => {
                if (oldState.tool != null && oldState.tool.id === toolId) {
                    if (oldState.tool.cancel != null) {
                        oldState.tool.cancel(true)
                    }
                    return {
                        ...oldState,
                        tool: null,
                    }
                }
                const newTool = new TOOLS[toolId].ToolClass(
                    toolId,
                    this.canvas,
                    oldState.zoom,
                    this.redraw,
                    this.addElement,
                    this.removeElement
                )
                if (toolId === TOOLS.edit.id || toolId === TOOLS.eraser.id) {
                    newTool.setPolygons([...oldState.polygons])
                }
                return {
                    ...oldState,
                    tool: newTool,
                }
            })
            setTimeout(() => {
                this.redraw()
            }, 200)
        }
    }

    /**
     * Will run a delayed re-drawing of the entire canvas content (all polygons and current polygon)
     * @param {Object} currentPosition - the current cursor position, which will render a dot, when called from the
     * FramePlayer
     */
    redraw(currentPosition = null) {
        // clean canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.lineWidth = 3

        if (this.state.showAnnotations === false) {
            return
        }

        // draw any pre-existing or already added polygons as filled polygons
        const defaultColor = `rgba(255, 0, 0, ${this.state.settings.ANTR_TRANSPARENCY})`
        this.state.polygons.forEach(polygon => {
            if (
                polygon.annotationType != null &&
                this.props.project.annotationTypes != null &&
                this.props.project.annotationTypes[polygon.annotationType] != null
            ) {
                this.ctx.fillStyle = util.hexToRgb(
                    this.props.project.annotationTypes[polygon.annotationType],
                    this.state.settings.ANTR_TRANSPARENCY
                )
            } else {
                this.ctx.fillStyle = defaultColor
            }

            this.ctx.beginPath()
            polygon.shape.forEach((coords, index) => {
                if (index === 0) {
                    this.ctx.moveTo(coords[0] * this.state.zoom, coords[1] * this.state.zoom)
                } else {
                    this.ctx.lineTo(coords[0] * this.state.zoom, coords[1] * this.state.zoom)
                }
            })

            this.ctx.closePath()

            if (this.state.settings.ANTR_OUTLINE_ONLY) {
                this.ctx.strokeStyle = this.ctx.fillStyle
                this.ctx.stroke()
            } else {
                this.ctx.fill()
            }
        })

        if (currentPosition != null) {
            // draw dot for current position
            this.ctx.fillStyle = "#ff0000"
            this.ctx.fillRect(currentPosition.x * this.state.zoom - 2, currentPosition.y * this.state.zoom - 2, 5, 5)
        }
    }

    delayedRedraw() {
        setTimeout(() => {
            if (this.state.tool != null) {
                this.state.tool.redraw()
            } else {
                this.redraw()
            }
        }, 200)
    }

    handleCanvasDown(ev) {
        if (this.state.tool == null) {
            return
        }
        if (this.state.tool.handleMouseDown != null) {
            this.state.tool.handleMouseDown(ev)
        }
    }

    handleCanvasMove(ev) {
        if (this.state.tool == null) {
            return
        }
        if (this.state.tool.handleMouseMove != null) {
            this.state.tool.handleMouseMove(ev)
        }
    }

    handleCanvasUp(ev) {
        if (this.state.tool == null) {
            return
        }
        if (this.state.tool.handleMouseUp != null) {
            this.state.tool.handleMouseUp(ev)
        }
    }

    handleCanvasClick(ev) {
        if (this.state.tool == null) {
            return
        }
        if (this.state.tool != null) {
            // polygon event handler
            if (this.state.tool.handleClick != null) {
                this.state.tool.handleClick(ev)
            }
        }
    }

    handleWheelEvent(ev) {
        ev.preventDefault()
        this.setState(oldState => {
            const { zoom } = oldState
            let newZoom = zoom - 0.5
            if (ev.deltaY < 0) {
                // zoom in
                newZoom = zoom + 0.5
                if (newZoom > 8.0) {
                    newZoom = 8.0
                }
            } else if (newZoom < 1.0) {
                newZoom = 1.0
            }
            return {
                zoom: newZoom,
            }
        })
        this.delayedRedraw()
    }

    addElement(shape) {
        this.setState(oldState => {
            const { polygons } = oldState

            if (shape.tool != null && shape.type != null) {
                // we've passed the full polygon (probably during edit)
                polygons.push(shape)
                // update edit tool with new updated polygons
                if (oldState.tool != null && oldState.tool.setPolygons != null) {
                    oldState.tool.setPolygons(polygons)
                }
            } else {
                // new element, use current tool
                polygons.push({
                    // 'session' is a tag I use to identify those polygons not saved yet
                    tool: oldState.tool.id,
                    type: "session",
                    annotationType: this.props.annotationType,
                    shape,
                })
            }

            return {
                ...oldState,
                polygons,
                changed: true,
                showAnnotations: true,
            }
        })
        this.delayedRedraw()
    }

    removeElement(shape) {
        let removeIndex = -1
        this.state.polygons.forEach((polygon, index) => {
            if (polygon.shape === shape) {
                // remove this
                removeIndex = index
            }
        })
        if (removeIndex !== -1) {
            this.setState(oldState => {
                const { polygons } = oldState
                polygons.splice(removeIndex, 1)
                return {
                    ...oldState,
                    polygons,
                    changed: true,
                }
            })
            this.delayedRedraw()
        }
    }

    importPolygons() {
        try {
            const shapes = JSON.parse(this.polygonImport.value)
            this.setState(oldState => {
                const polygons = [...oldState.polygons]
                shapes.forEach(shape => {
                    polygons.push(shape)
                })

                return {
                    ...oldState,
                    polygons,
                }
            })
            setTimeout(() => {
                this.selectTool(null)()
                this.save()
                this.redraw()
            }, 300)
        } catch {
            Alert.error("Invalid JSON")
        }
    }

    save() {
        if (this.state.tool != null && this.state.tool.cancel != null) {
            // re-add annotation in case we save while editing
            this.state.tool.cancel(true)
        }

        this.setState({
            changed: false,
        })

        const { currentFrame } = this.state

        setTimeout(() => {
            const updatedPolygons = this.state.polygons.map(old => {
                if (old.type === "session") {
                    // update flag for the new ones to 'saved'
                    return {
                        ...old,
                        type: "user",
                    }
                }
                // otherwise just map to the polygon, keep the old type
                return old
            })
            if (this.props.image.numFrames == null) {
                // update single image
                this.props.update(updatedPolygons)
            } else {
                // update frame
                this.props.update(updatedPolygons, currentFrame)
            }
        }, 100)
    }

    render() {
        return (
            <div>
                <div style={style.toolBox}>
                    <div style={style.toolboxLayout}>
                        {/* toolbox section headers */}
                        <div style={style.toolBoxHeader}>Tools</div>
                        <div style={style.toolBoxHeader}>Save</div>
                        <div style={style.toolBoxHeader}>Zoom Level</div>
                        <div style={style.toolBoxHeader}>Download</div>
                        <div style={style.toolBoxHeader}>{this.props.image.numFrames != null ? "Frames" : null}</div>
                        {/* select tool here */}
                        <div style={mixins.relative}>
                            {Object.values(TOOLS).map(tool => (
                                <FontAwesomeIcon
                                    key={tool.icon}
                                    icon={tool.icon}
                                    style={style.toolIcon(this.state.tool != null && this.state.tool.id === tool.id)}
                                    title={tool.label}
                                    onClick={this.selectTool(tool.id)}
                                />
                            ))}
                        </div>
                        {/* save button */}
                        <div>
                            {this.state.changed ? (
                                <FontAwesomeIcon
                                    icon="save"
                                    style={style.toolIcon(false)}
                                    title="Save Annotations"
                                    onClick={this.save}
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon="save"
                                    style={{ ...style.toolIcon(false), ...style.inactiveIcon }}
                                    title="Save Annotations"
                                />
                            )}
                        </div>
                        {/* zoom level */}
                        <div style={mixins.flexRow}>
                            <div>
                                <input
                                    type="range"
                                    min="0.25"
                                    max="8"
                                    step={0.25}
                                    onChange={this.changeZoom}
                                    defaultValue={this.state.zoom}
                                    style={style.slider}
                                />
                            </div>
                            <div>
                                <div style={style.zoomLevel}>{this.state.zoom}x</div>
                            </div>
                        </div>
                        {/* download options */}
                        <div>
                            <DownloadForm
                                image={this.props.image}
                                annotations={this.state.polygons}
                                imageAnnotations={this.props.annotation}
                            />
                        </div>
                        {/* frame options */}
                        <div>
                            {this.props.image.numFrames != null ? (
                                <FrameControl
                                    image={this.props.image}
                                    currentFrame={this.state.currentFrame}
                                    switchFrame={this.switchFrame}
                                />
                            ) : null}
                        </div>
                    </div>
                    <div style={mixins.relative}>
                        <div title="Toggle Annotations" style={style.toggleAnnotation}>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    onChange={this.toggleAnnotations}
                                    checked={this.state.showAnnotations === true}
                                />
                                <span className="slider round" />
                            </label>
                        </div>
                        <div style={style.settingsIcon} onClick={this.toggleSettings}>
                            <FontAwesomeIcon icon="cog" />
                        </div>
                    </div>
                </div>
                <div style={style.wrapper} className="no_selection">
                    <div style={mixins.relative} className="no_selection">
                        <img
                            className="no_selection"
                            src={`${util.getImagePath(this.props.project._id, this.props.image._id)}${
                                this.props.image.numFrames != null ? `/${this.state.currentFrame}` : ""
                            }`}
                            width={this.getWidth()}
                            height={this.getHeight()}
                        />
                        <canvas
                            className="no_selection"
                            ref={el => {
                                this.canvas = el
                            }}
                            style={style.canvas(this.getWidth(), this.getHeight(), this.getCursor())}
                            onClick={this.handleCanvasClick}
                            onMouseDown={this.handleCanvasDown}
                            onMouseUp={this.handleCanvasUp}
                            onMouseMove={this.handleCanvasMove}
                            width={this.getWidth()}
                            height={this.getHeight()}
                        />
                    </div>
                </div>
                {/* this element is a hack to get the toolbar something to select on double-click */}
                <div style={{ color: "#fff" }}>&nbsp;</div>
                {/* inject the tool's option panel into the DOM */}
                {this.state.tool != null && this.state.tool.getOptionPanel != null ? (
                    <div style={style.optionPanel}>
                        <h5>Options</h5>
                        {this.state.tool.getOptionPanel()}
                    </div>
                ) : null}
                {this.props.image.numFrames != null ? (
                    <div style={style.framePlayer}>
                        <FramePlayer
                            image={this.props.image}
                            currentFrame={this.state.currentFrame}
                            redraw={this.redraw}
                        />
                    </div>
                ) : null}
                {this.state.tool === "import" ? (
                    <Popup cancel={this.selectTool(null)} ok={this.importPolygons} title="Import Polygons">
                        <p>
                            Please provide a JSON array containing shapes (e.g. an array of arrays, where each sub-array
                            represents pixel coordinates)
                        </p>
                        <label style={mixins.label} htmlFor="import-polygons">
                            Polygons JSON Array
                        </label>
                        <textarea
                            style={{ ...mixins.textInput, height: "120px" }}
                            rows={20}
                            ref={el => {
                                this.polygonImport = el
                            }}
                        />
                    </Popup>
                ) : null}
                {this.state.showSettings === true ? (
                    <SettingsPopup
                        toggle={this.toggleSettings}
                        saveSettings={this.changeSetting}
                        settings={this.state.settings}
                    />
                ) : null}
            </div>
        )
    }
}

export default ImageAnnotation
