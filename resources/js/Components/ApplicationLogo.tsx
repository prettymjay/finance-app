import { HTMLAttributes } from 'react';

export default function ApplicationLogo(props: HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/img/ag-logo.jpg"
            alt="AG Logo"
            className={`${props.className ?? ''}`.trim()}
        />
    );
}
