import { NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subscriber, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';


export class MapEventManager {
    private _pending: { observable: Observable<any>; observer: Subscriber<any> }[] = [];
    private _listeners: any[] = [];
    private _targetStream = new BehaviorSubject<any>(undefined);
    private _isHtmlElement = false;
    private _subscriptions: Subscription[] = [];

    constructor(private _ngZone: NgZone) {}

    private _clearListeners() {
        for (const event of this._listeners) {
            if (this._isHtmlElement) {
                event.target.getElement().removeEventListener(event.name, event.listener);
            } else {
                event.target.off(event.name, event.listener);
            }
        }
        this._listeners = [];
        this._subscriptions.forEach(sub => sub.unsubscribe());
        this._subscriptions = [];
    }

    getLazyEmitter<T>(name: string): Observable<T> {
        return this._targetStream.pipe(
            switchMap(target => {
                return new Observable<T>(observer => {
                    if (!target) {
                      //  const observable = new Observable<T>(obs => obs.next()!);
                       // this._pending.push({ observable, observer });
                        return;
                    }

                    const listener = (event: any) => {
                        this._ngZone.run(() => observer.next(event));
                    };

                    if (this._isHtmlElement) {
                        target.getElement().addEventListener(name, listener);
                    } else {
                        target.on(name, listener);
                    }

                    this._listeners.push({ name, listener, target });

                    return () => {
                        if (this._isHtmlElement) {
                            target.getElement().removeEventListener(name, listener);
                        } else {
                            target.off(name, listener);
                        }
                    };
                });
            }),
        );
    }

    public off(event: string): void {
        const target = this._targetStream.value;
        if (!target) return;

        const listenerIndex = this._listeners.findIndex(l => l.name === event);
        if (listenerIndex !== -1) {
            const { name, listener } = this._listeners[listenerIndex];
            if (this._isHtmlElement) {
                target.getElement().removeEventListener(name, listener);
            } else {
                target.off(name, listener);
            }
            this._listeners.splice(listenerIndex, 1);
        }
    }

    public setTarget(target: any, isHtmlElement?: boolean): void {
        this._isHtmlElement = isHtmlElement ?? false;
        const currentTarget = this._targetStream.value;

        if (target === currentTarget) {
            return;
        }

        if (currentTarget) {
            this._clearListeners();
        }

        this._targetStream.next(target);

        this._pending.forEach(subscriber => subscriber.observable.subscribe(subscriber.observer));
        this._pending = [];
    }

    public destroy(): void {
        this._clearListeners();
        this._pending = [];
        this._targetStream.complete();
    }
}