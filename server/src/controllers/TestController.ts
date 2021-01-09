import {
    Controller,
    Get
} from '@overnightjs/core';
import { Request, Response } from 'express';
import * as STATUS from 'http-status-codes';

@Controller('test')
export class TestController {
    @Get("")
    private test(req: Request, res: Response) {
        const result = 'backend reached!'
        res.status(STATUS.OK).json(result);
        return;
    }
}