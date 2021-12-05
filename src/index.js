import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import NotFound from "./NotFound/NotFound";
import Admin from "./Admin/Admin"
import User from "./User/User";
import {BrowserRouter, Route, Switch} from "react-router-dom"

const routes = (
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={App} />
            <Route path={"/admin"} component={Admin}/>
            <Route path="/user/:name" component={User}/>
            <Route component={NotFound}/>
        </Switch>
    </BrowserRouter>
);
ReactDOM.render(routes, document.getElementById('root'))


