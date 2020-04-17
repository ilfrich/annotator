import React from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import mixins from "../mixins"

const style = {
    inline: {
        display: "inline",
    },
    menuLink: {
        ...mixins.noLink,
        padding: "0px 10px",
    },
    extension: {
        padding: "0px 10px",
        display: "inline-block",
    },
}

const Breadcrumb = props => (
    <h4>
        <Link to="/" style={style.menuLink} key="home">
            Home
        </Link>
        {props.project != null ? (
            <div style={style.inline}>
                <FontAwesomeIcon icon="chevron-right" />
                <Link style={style.menuLink} to={`/projects/${props.project._id}`}>
                    {props.project.name}
                </Link>
            </div>
        ) : null}
        {props.current != null ? (
            <div style={style.inline}>
                <FontAwesomeIcon icon="chevron-right" />
                <Link to={window.location.pathname} style={style.menuLink}>
                    {props.current}
                </Link>
            </div>
        ) : null}
        {props.children != null ? (
            <div style={style.inline}>
                <FontAwesomeIcon icon="chevron-right" />
                <div style={style.extension}>{props.children}</div>
            </div>
        ) : null}
    </h4>
)

export default Breadcrumb
