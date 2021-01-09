import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import session from 'express-session';
import { ApiController } from './controllers/ApiController';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';

class CGCServer extends Server {
    private readonly SERVER_STARTED = process.env.NODE_ENV + ' Server started on port: ';

    constructor() {
        super(true);
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended:true }))
        this.app.use(
            session({
                secret: "test",
                resave: true,
                saveUninitialized: true
            })
        );
        this.setupControllers();
    }

    private setupControllers(): void {
        super.addControllers(new ApiController());
    }

    public start(port: number): void {
        this.app.use('/api', (req, res) => {
            res.json({ message: `backend started but unable to find api ${req.url}`})
        });
        this.app.use(express.static(path.join(__dirname, 'public/client')))
        this.app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '/public/client/index.html')) })
        this.app.listen(port, () => { Logger.Imp(this.SERVER_STARTED + port) });
    }
}

export default CGCServer