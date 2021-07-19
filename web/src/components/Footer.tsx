import React, {FunctionComponent} from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const Foot:FunctionComponent = () => {
    return (
        <Footer >
            <div>
                Cirkle
            </div>
            <div>
                Company
            </div>
            <div>
                Download
            </div>
            <div>
                Privacy
            </div>
        </Footer>
    )
}

export default Foot;