
import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, identity, Observable, of, Subject } from 'rxjs';
import { catchError, map, repeat, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IVehicle } from '../interfaces/vehicle.interface';
import { HttpClientService } from '../../../services/http-client.service';

@Injectable({ providedIn: 'root' })
export class VehicleService {
    public token = '27afb877422133945a0f5241bc649145bd928fa17ca239d23b942850a770cd06'
    public track$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        private _http: HttpClientService,

    ) { }

    public findAll(): Observable<IVehicle[]> {

        const now = new Date();
        const formattedStart = now.toISOString();
        const formattedEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

        const mock: any[] = [
            { id: '22216', name: 'ID: 22216', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: true, isRepeat: true, color: '#1abc9c' },
            { id: '24121', name: 'ID: 24121', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#e74c3c' },
            { id: '24488', name: 'ID: 24488', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#3498db' },
            { id: '27067', name: 'ID: 27067', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#2ecc71' },
            { id: '07322', name: 'ID: 07322', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#f39c12' },
            { id: '07496', name: 'ID: 07496', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#9b59b6' },
            { id: '07321', name: 'ID: 07321', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#34495e' },
        ];
        return of(mock);
    }


    public getById(id: string): Observable<IVehicle | undefined> {
        return this.findAll().pipe(
            map(vehicles => vehicles.find(v => v.id === id))
        );
    }

    public getVehicleTrack(
        id: string,
        start: string,
        end: string,
        isRepeat = false
    ) {
        return defer(() => {
            const currentEnd = isRepeat
                ? new Date().toISOString().split('.')[0] + 'Z'
                : end;

            const params = new URLSearchParams({
                token: this.token,
                vehicle_id: id,
                start,
                end: currentEnd,
            });
            return this._http.get(`${environment.apiUri}tracking?${params.toString()}`);
        }).pipe(
            map(response => response),
            catchError(error => error),
            retry({ delay: 15000 }),
            isRepeat ? repeat({ delay: 15000 }) : identity,
            tap(data => this.track$.next({ vehicleId: id, data, isRepeat }))
        );
    }
}



