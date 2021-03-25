import React, { createRef } from 'react';

export const navigationRef = createRef<any>();

export function navigate(name, params) {
    navigationRef.current?.navigate(name, params);
}