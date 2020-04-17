import React from "react"
import Alert from "react-s-alert"
import { Route, Switch, withRouter } from "react-router"
import { BrowserRouter } from "react-router-dom"
import "react-s-alert/dist/s-alert-default.css"
import ProjectContainer from "./ProjectContainer"
import ProjectOverview from "./ProjectOverview"
import ImageView from "./ImageView"

const style = {
    main: {
        padding: "10px",
    },
}

const InsideApp = withRouter(() => (
    <div>
        <Alert stack={{ limit: 3 }} html />
        <div style={style.main}>
            <Switch>
                <Route path="/" exact component={ProjectContainer} />
                <Route path="/projects/:projectId" component={ProjectOverview} exact />
                <Route path="/projects/:projectId/images/:imageId" component={ImageView} exact />
            </Switch>
        </div>
    </div>
))
const App = () => (
    <BrowserRouter>
        <InsideApp />
    </BrowserRouter>
)

export default App
