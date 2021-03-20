import React, { FunctionComponent } from 'react';
import { Ionicons } from 'react-native-vector-icons';

type VerifiedIconProps = {
    size?: number,
    style?: any
}

const VerifiedIcon:FunctionComponent<VerifiedIconProps> = (props) => {
    let { size = 20, style = {} } = props;
    
    return (
        <Ionicons 
            name={'checkmark-circle-sharp'} 
            color='#5bbcf0' 
            size={size} 
            style={style}
        />
    )
}

export default VerifiedIcon