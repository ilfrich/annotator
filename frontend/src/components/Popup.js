import React from "react"
import mixins from "../mixins"

const style = {
    backdrop: zIndex => ({
        zIndex: `${zIndex || 600}`,
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100%",
        display: "block",
        background: "rgba(33, 33, 33, 0.7)",
    }),
    popup: zIndex => ({
        zIndex: `${zIndex ? zIndex + 1 : 601}`,
        position: "fixed",
        top: "100px",
        left: "25%",
        width: "50%",
        margin: "auto",
        background: "#eee",
    }),
    title: {
        background: "#004",
        color: "#fff",
        borderBottom: "1px solid #ccc",
        padding: "30px",
        fontSize: "20px",
    },
    body: {
        padding: "30px",
        maxHeight: "450px",
        overflowY: "scroll",
    },
    buttons: {
        padding: "30px",
        textAlign: "right",
    },
}

/**
 * Renders a popup on a backdrop with a custom tile and injectable body and a set of buttons.
 * @param {{yes: function, no: function, ok: function, cancel: function, title: string, children: array, zIndex: number}} props:
 * the properties passed into this component. Either provide ('yes' and 'no') keys or ('ok' and 'cancel') keys. The
 * 'zIndex' is optional and defaults to 600.
 * @returns {object} a React component's rendering
 */
const Popup = props => {
    return (
        <div>
            <div style={style.backdrop(props.zIndex)} onClick={props.no || props.cancel} />
            <div style={style.popup(props.zIndex)}>
                <div style={style.title}>{props.title}</div>
                <div style={style.body}>{props.children}</div>
                <div style={style.buttons}>
                    {/* delete dialog */}
                    {props.yes != null && props.no != null
                        ? [
                              <button key="yes" type="button" style={mixins.button} onClick={props.yes}>
                                  Yes
                              </button>,
                              <button key="no" type="button" style={mixins.inverseButton} onClick={props.no}>
                                  No
                              </button>,
                          ]
                        : null}
                    {/* ok dialog */}
                    {props.ok != null && props.cancel != null
                        ? [
                              <button key="ok" type="button" style={mixins.button} onClick={props.ok}>
                                  Ok
                              </button>,
                              <button key="cancel" type="button" style={mixins.inverseButton} onClick={props.cancel}>
                                  Cancel
                              </button>,
                          ]
                        : null}
                </div>
            </div>
        </div>
    )
}

export default Popup
