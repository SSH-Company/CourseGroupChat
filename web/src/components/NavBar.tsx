import React, {FunctionComponent} from 'react';
import { Layout, Menu } from 'antd';
import './NavBar.css';

const { Header } = Layout;

const NavBar:FunctionComponent = () => {
    return (
        <Header className="header" style={{backgroundColor: '#F5B398'}}>
            <div className="logo" style={{backgroundColor: '#F5B398'}}/>
            <Menu className="navbar" mode="horizontal" style={{backgroundColor: '#F5B398'}}>
                <Menu.Item key="Features">
                    Features
                </Menu.Item>
                <Menu.Item key="Download">
                    Download
                </Menu.Item>
                <Menu.Item key="Help Center">
                    Help Center
                </Menu.Item>
            </Menu>
        </Header>
    )
}

export default NavBar;