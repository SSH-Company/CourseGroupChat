import React from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import { Layout } from 'antd';
import Home from './home/Index';
import About from './home/About';
import Contact from './home/Contact';
import VerifyAccount from './home/VerifyAccount';
import ResetPassword from './home/ResetPassword';
import Privacy from './home/Privacy';
import TnC from './home/TnC';
import NavBar from './components/NavBar';
import Foot from './components/Footer';

import './App.scss';

const { Header, Footer, Content } = Layout;

function App() {
    return (
        <React.Fragment>
            <Layout className="layout">
                <NavBar />
                <Router>
                    <Switch>
                        <Route exact path="/" component={Home}/>
                        <Route exact path="/about" component={About} />
                        <Route exact path="/contact" component={Contact} />
                        <Route exact path="/privacy" component={Privacy} />
                        <Route exact path="/terms-and-conditions" component={TnC} />
                        <Route exact path="/verify/:userId/:token" component={VerifyAccount}/>
                        <Route exact path="/resetPassword/:userId/:token" component={ResetPassword}/>
                        <Route path="/" component={() => React.createElement(() => <h1>404 not found</h1>, {})}/>
                    </Switch>
                </Router>
                <Foot />
            </Layout>
        </React.Fragment>
    );
}

export default App;




