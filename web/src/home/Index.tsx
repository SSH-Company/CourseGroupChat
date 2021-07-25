import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'antd';
import './index.scss';
import 'antd/dist/antd.css';

const Home:FunctionComponent = () => {
    const history = useHistory();
    const routeChange = () => {
        let path = '/about';
        history.push(path);
    }
    
    return (
        <div className="header-background screen-center">
            <div className='jumbotron'>
                <div className="col-md-18" style={{ textAlign: 'center', color: 'black' }}>
                        <h1 className="display-4">Cirkle!</h1>
                        <p className="lead">Our Community</p>
                        <p className="lead">
                            <Button style={{ marginRight: 10 }} size="large">App Store</Button>
                            <Button style={{ marginRight: 10 }} size="large">Play Store</Button>
                            <Button size="large" onClick={routeChange}>Learn More!</Button>
                        </p>                
                </div>
            </div>
        </div>
    )
} 

export default Home