import React, { FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../BaseUrl';
import axios from 'axios';
import './index.scss';

const VerifyAccount:FunctionComponent = () => {
    const props: any = useParams()
    const [status, setStatus] = useState('')

    useEffect(() => {
        if (props.userId?.length > 0 && props.token?.length > 0) {
            axios.get(`${BASE_URL}/api/auth/verify`, { params: { userId: props.userId, token: props.token } })
                .then(res => {
                    setStatus(res.data.status);
                })
                .catch(err => {
                    console.error(err);
                    setStatus('failed');
                })
        }
    }, [props])
    
    return (
        <div className="header-background screen-center">
            <div className="col-md-18" style={{ textAlign: 'center', color: 'black' }}>
                <h1 className="display-3">
                    {status === "success" && <>Your account has been verified!</>}
                    {status === "expired" && <>This verification link has expired.</>}
                    {status === "failed" && <>Looks like something is wrong on our end. Please try again later.</>}
                </h1>
            </div>
        </div>
    )
}

export default VerifyAccount


