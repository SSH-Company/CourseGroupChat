import React from 'react';
import { Subtract } from 'utility-types';
import { MDCRippleFoundation } from '@material/ripple/foundation';
import { MDCRippleAdapter } from '@material/ripple/adapter';
export interface RippledComponentProps<T> {
    unbounded?: boolean;
    disabled?: boolean;
    style?: React.CSSProperties;
    className?: string;
    onMouseDown?: React.MouseEventHandler<T>;
    onMouseUp?: React.MouseEventHandler<T>;
    onTouchStart?: React.TouchEventHandler<T>;
    onTouchEnd?: React.TouchEventHandler<T>;
    onKeyDown?: React.KeyboardEventHandler<T>;
    onKeyUp?: React.KeyboardEventHandler<T>;
    onFocus?: React.FocusEventHandler<T>;
    onBlur?: React.FocusEventHandler<T>;
    computeBoundingRect?: (surface: T) => ClientRect;
}
export interface RippledComponentState {
    classList: Set<string>;
    style: React.CSSProperties;
}
export interface InjectedProps<S, A = Element> extends RippledComponentProps<S> {
    initRipple?: React.Ref<S> | ((surface: S | null, activator?: A | null) => void);
}
declare type ActivateEventTypes<S> = React.MouseEvent<S> | React.TouchEvent<S> | React.KeyboardEvent<S> | React.FocusEvent<S>;
export interface RippledComponentInterface<Surface, Activator = Element> {
    foundation?: MDCRippleFoundation;
    isComponentMounted: boolean;
    isTouched: boolean;
    initializeFoundation: (surface: Surface, activator?: Activator) => void;
    handleFocus: React.FocusEventHandler<Surface>;
    handleBlur: React.FocusEventHandler<Surface>;
    handleMouseDown: React.MouseEventHandler<Surface>;
    handleMouseUp: React.MouseEventHandler<Surface>;
    handleTouchStart: React.TouchEventHandler<Surface>;
    handleTouchEnd: React.TouchEventHandler<Surface>;
    handleKeyDown: React.KeyboardEventHandler<Surface>;
    handleKeyUp: React.KeyboardEventHandler<Surface>;
    activateRipple: (e: ActivateEventTypes<Surface>) => void;
    deactivateRipple: () => void;
    classes: string;
    style: React.CSSProperties;
    displayName: string;
    createAdapter: (surface: Surface, activator?: Activator) => MDCRippleAdapter;
    updateCssVariable: (varName: string, value: string | null) => void;
    componentDidMount: () => void;
    componentWillUnmount: () => void;
    render: () => JSX.Element;
}
export declare function withRipple<P extends InjectedProps<Surface, Activator>, Surface extends Element = Element, Activator extends Element = Element>(WrappedComponent: React.ComponentType<P>): React.ComponentType<Subtract<P, InjectedProps<Surface, Activator>> & RippledComponentProps<Surface>>;
export {};
