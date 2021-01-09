/**
 * Root controller for all backend controllers 
 */

import { Controller, ClassOptions, ChildControllers } from '@overnightjs/core';
import * as controllers from './Index';

const controllerInstances = [];
for (const c in controllers) {
    if (controllers.hasOwnProperty(c)) {
        const controller = (controllers as any)[c];
        controllerInstances.push(new controller());
    }
}

@Controller('api')
@ClassOptions({ mergeParams: true })
@ChildControllers(controllerInstances)
export class ApiController{}