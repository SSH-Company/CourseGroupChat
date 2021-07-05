import React from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import { Layout } from 'antd';

import Home from './home/Index';
import About from './home/About';
import Contact from './home/Contact';
import VerifyAccount from './home/VerifyAccount';
import ResetPassword from './home/ResetPassword';
import NoMatch from './home/NoMatch';
import NavBar from './components/NavBar';
import Foot from './components/Footer';

import './App.scss';

const { Header, Footer, Content } = Layout;

function App() {
    return (
        <React.Fragment>
            <Layout className="layout">
                <NavBar />
                <Content>Content</Content>
                <Foot />
            </Layout>
        </React.Fragment>
    );
}

export default App;




