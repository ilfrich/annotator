import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { mixins } from "quick-n-dirty-react"

const style = {
    icon(desiredFrame, numFrames) {
        const baseStyle = {
            padding: "5px",
            border: "1px solid #333",
            borderRadius: "2px",
            marginRight: "8px",
            minWidth: "18px",
        }
        if (desiredFrame < 0 || desiredFrame === numFrames) {
            return {
                ...baseStyle,
                cursor: "not-allowed",
                color: "#aaa",
            }
        }
        return {
            ...baseStyle,
            ...mixins.clickable,
        }
    },
    frameIndicator: {
        ...mixins.smallFont,
        width: "50px",
        textAlign: "center",
        marginLeft: "-8px",
        paddingTop: "5px",
    },
    overlapIcon(desiredFrame, numFrames) {
        const baseStyle = {
            marginLeft: "-1px",
        }
        if (desiredFrame < 0 || desiredFrame === numFrames) {
            return {
                ...baseStyle,
                color: "#aaa",
            }
        }
        return baseStyle
    },
    overlap: {
        position: "absolute",
        top: "6px",
        left: "14px",
    },
}

const FrameControl = ({ image, currentFrame, switchFrame }) => {
    const goBack = () => {
        if (currentFrame === 0) {
            return
        }
        switchFrame(currentFrame - 1)
    }
    const goForward = () => {
        if (currentFrame === image.numFrames - 1) {
            return
        }
        switchFrame(currentFrame + 1)
    }
    const goStart = () => {
        switchFrame(0)
    }
    const goEnd = () => {
        switchFrame(image.numFrames - 1)
    }

    return (
        <div style={mixins.flexRow}>
            <div style={mixins.relative}>
                <div style={style.icon(currentFrame - 1, image.numFrames)} onClick={goStart}>
                    <FontAwesomeIcon icon="chevron-left" style={style.overlapIcon(currentFrame - 1, image.numFrames)} />
                    <div style={style.overlap}>
                        <FontAwesomeIcon icon="chevron-left" />
                    </div>
                </div>
            </div>
            <div>
                <FontAwesomeIcon
                    icon="chevron-left"
                    style={style.icon(currentFrame - 1, image.numFrames)}
                    onClick={goBack}
                />
            </div>
            <div style={style.frameIndicator}>
                {currentFrame + 1} / {image.numFrames}
            </div>
            <div>
                <FontAwesomeIcon
                    icon="chevron-right"
                    style={style.icon(currentFrame + 1, image.numFrames)}
                    onClick={goForward}
                />
            </div>
            <div style={mixins.relative}>
                <div style={style.icon(currentFrame + 1, image.numFrames)} onClick={goEnd}>
                    <FontAwesomeIcon
                        icon="chevron-right"
                        style={style.overlapIcon(currentFrame + 1, image.numFrames)}
                    />
                    <div style={style.overlap}>
                        <FontAwesomeIcon icon="chevron-right" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FrameControl
