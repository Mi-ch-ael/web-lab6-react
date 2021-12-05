import React, {Component} from "react";

class NotFound extends Component {
    render() {
        return (
            <div className={"w3-container"}>
            <h3>This is not the page you are looking for.</h3>
            <p>We suggest you go to the
                &nbsp;<a className={"link-like"} href={"http://localhost:3000/"}>main page</a>&nbsp;
                to explore more.
            </p>
            </div>
        )
    }
}

export default NotFound