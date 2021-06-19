import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, notification } from 'antd';
import { BASE_URL } from '../BaseUrl';
import axios from 'axios';
import './index.scss';
import 'antd/dist/antd.css';

type FormData = {
    password: string;
    retypePassword: string;
}

const ResetPassword:FunctionComponent = () => {
    const { userId, token }: any = useParams()

    const layout = {
        labelCol: { span: 10 },
        wrapperCol: { span: 14 },
    };

    const tailLayout = {
        wrapperCol: { offset: 8, span: 16 },
    };

    const onFinish = (values: FormData) => {
        //check errors
        if (values.password !== values.retypePassword) {
            notification.open({
                message: 'Error',
                description: 'Passwords must match',
                type: 'error'
            })
            return;
        }

        axios.post(`${BASE_URL}/api/auth/reset-password`, { userId, token, password: values.password })
            .then(() => {
                notification.open({
                    message: 'Success!',
                    description: 'Successfully updated password! Try logging in again.',
                    type: 'success'
                })
            })
            .catch(err => {
                notification.open({
                    message: 'Error',
                    description: 'Failed to update password',
                    type: 'error'
                })
            })
    }

    return (
        <div className="header-background screen-center">
            <Form
                {...layout}
                name="basic"
                onFinish={onFinish}
            >                                               
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label="Retype Password"
                    name="retypePassword"
                    rules={[{ required: true, message: 'Please retype your password!' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default ResetPassword


