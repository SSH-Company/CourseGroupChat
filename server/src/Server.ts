import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import session from 'express-session';
import { ApiController } from './controllers/ApiController';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import passport from 'passport';
import * as saml from 'passport-saml';

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

        passport.serializeUser((user, done) => {
            done(null, user);
        });
        
        passport.deserializeUser((user, done) => {
            done(null, user);
        });
        
        var samlStrategy = new saml.Strategy({
            callbackUrl: '/api/login/callback',
            entryPoint: 'https://ssh-company-dev.onelogin.com/trust/saml2/http-post/sso/f21b1a70-3579-4546-adbf-b99b593adaa2',
            issuer: 'dev-app-konnect',
            cert: `-----BEGIN CERTIFICATE-----
            MIID/DCCAuSgAwIBAgIUS/ntICPZd937UlJRhlwCQjHdkhAwDQYJKoZIhvcNAQEF
            BQAwTzEaMBgGA1UECgwRU1NIICZhbXA7IENvbXBhbnkxFTATBgNVBAsMDE9uZUxv
            Z2luIElkUDEaMBgGA1UEAwwRT25lTG9naW4gQWNjb3VudCAwHhcNMjEwMjE1MTky
            MDM5WhcNMjYwMjE1MTkyMDM5WjBPMRowGAYDVQQKDBFTU0ggJmFtcDsgQ29tcGFu
            eTEVMBMGA1UECwwMT25lTG9naW4gSWRQMRowGAYDVQQDDBFPbmVMb2dpbiBBY2Nv
            dW50IDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMAv6n2XeQoJuANv
            gRMJcR+4qNZW0VnnQgtUM0WEY4N/9HAOqBw3/W9VtCDD9ny5QuaRyrN3lfXLNvcb
            LZZLwKG5lQM5mjE5fMBXb0WR9bJ/yP39nq+vznkNfH0gtUI9SncRvoRZURx5O1jM
            hR1ax92G0ir/Ztmox56lEJ7jdTOeVv7Ilq0O+bhsk3B43ZfDwusbz9jKjmGHYsTK
            +dbU7Mv+3R7EVx2HzG5Fe4FAUyoO/vv/DUyCnGyy551ThdIphtA7Tg/rnrmSEB0g
            crzMeDadIaEVmwQPdKGlS5LDZS9kUhCJ9qOqzQd1B6439hUqVmj2RaWlyIM/BC1w
            C4MxBesCAwEAAaOBzzCBzDAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBRjC5dLEhoS
            CnbHREWoKzdmbkETOjCBjAYDVR0jBIGEMIGBgBRjC5dLEhoSCnbHREWoKzdmbkET
            OqFTpFEwTzEaMBgGA1UECgwRU1NIICZhbXA7IENvbXBhbnkxFTATBgNVBAsMDE9u
            ZUxvZ2luIElkUDEaMBgGA1UEAwwRT25lTG9naW4gQWNjb3VudCCCFEv57SAj2Xfd
            +1JSUYZcAkIx3ZIQMA4GA1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQUFAAOCAQEA
            oAl51L6n+tF8B6FYKBrKAXScAw5pUE6M/qflq8hDNIISHJKK1vuwJQqbpZCCd+wG
            g7UfS+N/N3hq9jUQFyQEzz+MUw9NhCf7YIMrDoQBvUgdTCQ5jEGg0rI4ZbjVM2ZB
            yGtC52Te9RaOR22GHb9krmCSuqJt92lXomrTU6B5QHBiLgupbxXVfxjqpWEmAY4n
            4sxeeXUjqV03QMbiteF25DtQajAIQ4VysUDimv6xNhhRPcMETm1u5uLe6e2A/inz
            DQFzARFKepYAsSMHlcsi92LJFpqXtURzLfw0UrVSrxHuvqKIyVpWBc9amcKGoXTx
            wtLjEfH4dPahKA3mIn2rHg==
            -----END CERTIFICATE-----`
        }, 
        (profile, done) => {
            return done(null, profile);
        })

        passport.use('samlStrategy', samlStrategy);
        this.app.use(passport.initialize({}));
        this.app.use(passport.session({}));
    
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
        return this.app.listen(port, () => { Logger.Imp(this.SERVER_STARTED + port) });
    }
}

export default CGCServer