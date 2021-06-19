import React, { FunctionComponent } from 'react';
import { Button } from 'antd';
import './index.scss';
import 'antd/dist/antd.css';

const HomePage:FunctionComponent = () => {
    return (
        <div className="header-background screen-center" >
            <div className="jumbotron">
                <div className="col-md-18" style={{ textAlign: 'center', color: 'black' }}>
                    <h1 className="display-4">Cirkle!</h1>
                    <p className="lead">Our Community</p>
                    <p className="lead">
                        <Button style={{ marginRight: 10 }} size="large">App Store</Button>
                        <Button size="large">Play Store</Button>
                    </p>
                </div>
            </div>
        </div>
    )
} 

export default HomePage


