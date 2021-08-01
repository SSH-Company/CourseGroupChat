import React, { FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, notification } from 'antd';
import { BASE_URL } from '../BaseUrl';
import axios from 'axios';
import './index.scss';

const VerifyAccount:FunctionComponent = () => {
    const props: any = useParams()
    const [status, setStatus] = useState()
    const [message, setMessage] = useState('')
    const [showResend, setShowResend] = useState(false);

    useEffect(() => {
        if (props.userId?.length > 0 && props.token?.length > 0) {
            axios.get(`${BASE_URL}/api/auth/verify`, { params: { userId: props.userId, token: props.token } })
                .then(res => {
                    const status = res.data.status;
                    switch (status) {
                        case 'success':
                            setMessage('Your account has been verified!')
                            break;
                        case 'expired':
                            setMessage('This verification link has expired.')
                            setShowResend(true)
                            break;
                        default:
                            break;
                    }
                    setStatus(status);
                })
                .catch(err => {
                    console.error(err);
                    setShowResend(true);
                    notification.open({
                        message: 'Error',
                        description: 'Unable to find this verification id. Please try resending the verification link.',
                        type: 'error'
                    });
                })
        }
    }, [props])

    const handleResend = () => {
        if (props.userId?.length > 0) {
            axios.post(`${BASE_URL}/api/auth/resend-verification`, { userId: props.userId })
                .then(res => {
                    const email = res.data.email;
                    setMessage(`Verification email has been sent to ${email}!`);
                    setShowResend(false);
                })
                .catch(err => {
                    console.error(err);
                    setShowResend(true);
                    notification.open({
                        message: 'Error',
                        description: 'Unable to send verification link. Please try contacting an admin.',
                        type: 'error'
                    });
                })
        }
    }
    
    return (
        <div className="header-background screen-center">
            <div className="col-md-18" style={{ textAlign: 'center', color: 'black' }}>
                <h1 className="display-3">
                    {status && message}
                    {showResend && <Button size="large" onClick={handleResend}>Click here to re-send verification email</Button>}
                </h1>
            </div>
        </div>
    )
}

export default VerifyAccount


