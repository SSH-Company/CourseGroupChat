import React, {FunctionComponent} from 'react';
import { Layout, Menu } from 'antd';
import styled from 'styled-components';

const { Header } = Layout;

const Styles = styled.div`
    .navbar {
        background-color: #EAA082;
    }

    .navbar-brand .navbar-nav .nav-link {
        color: #4C7972;

        &:hover {
            color: #265C52;
        }
    }

`;

const NavBar:FunctionComponent = () => {
    return (
        <Header>
            <div className="logo" />
            <Menu theme="dark" mode="horizontal">
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