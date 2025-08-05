
import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, identity, interval, Observable, of, Subject, throwError, catchError, map, repeat, retry, scan, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IVehicle } from '../interfaces/vehicle.interface';
import { HttpClientService } from '../../../services/http-client.service';

@Injectable({ providedIn: 'root' })
export class VehicleService {
    public token = '27afb877422133945a0f5241bc649145bd928fa17ca239d23b942850a770cd06'
    public track$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public _fakeState = {};

    constructor(
        private _http: HttpClientService,

    ) {

      //  this.startFakeTrack('22952');
    }

    public findAll(): Observable<IVehicle[]> {

        const now = new Date();
        const formattedStart = now.toISOString();
        const formattedEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

        const mock: any[] = [
            { id: '22952', name: 'ID: 22952', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: true, isRepeat: true, color: '#CB0000' },
            // { id: '22216', name: 'ID: 22216', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: true, isRepeat: true, color: '#1abc9c' },
            // { id: '24121', name: 'ID: 24121', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#e74c3c' },
            // { id: '24488', name: 'ID: 24488', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#3498db' },
            // { id: '27067', name: 'ID: 27067', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#2ecc71' },
            // { id: '07322', name: 'ID: 07322', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#f39c12' },
            // { id: '07496', name: 'ID: 07496', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#9b59b6' },
            // { id: '07321', name: 'ID: 07321', startDateTime: formattedStart, endDateTime: formattedEnd, speed: 4, active: false, isRepeat: true, color: '#34495e' },
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
            const now = new Date();
            const isoNow = now.toISOString().split('.')[0] + 'Z';
            const midnight = new Date(now);
            midnight.setHours(0, 0, 0, 0);
            const isoStartOfDay = midnight.toISOString().split('.')[0] + 'Z';

            const currentStart = isRepeat ? isoStartOfDay : start;
            const currentEnd = isRepeat ? isoNow : end;

            const params = new URLSearchParams({
                token: this.token,
                vehicle_id: id,
                start: currentStart,
                end: currentEnd
            });

            return this._http.get(`${environment.apiUri}tracking?${params.toString()}`);
        }).pipe(
            map(response => response),
            retry({ count: 2, delay: 15000 }),
            isRepeat ? repeat({ delay: 15000 }) : identity,
            tap(data => this.track$.next({ vehicleId: id, data, isRepeat }))
        );
    }




    startFakeTrack(vehicleId) {
        // Если для этого vehicleId уже есть состояние — не запускаем второй раз
        if (this._fakeState[vehicleId]) {
            return;
        }

        // Задаём «начальную» точку (например, Москва: lng=37.6176, lat=55.7558, altitude=150)
        const initialState = {
            // coordinates: [lng, lat, altitude]
            prevPoint: {
                coordinates: [37.6176, 55.7558, 150],
                altitude: 150,
                speed: 0,
                direct_angle: null,
                waterfall: null,
                waterup: null,
                fly: 'reserved',
                timestamp: new Date().toISOString()
            },
            // Накапливаем все исторические Feature'ы
            features: []
        };
        this._fakeState[vehicleId] = initialState;

        // RxJS-поток, каждые 1000 мс приращаем prevPoint и пушим очередной Feature
        interval(10000)
            .pipe(
                // scan аккумулирует состояние { prevPoint, features }
                scan((acc, idx) => {
                    const p = acc.prevPoint;
                    const next = this.movePoint(p, idx);

                    // Собираем геометрию и свойства в Feature
                    const feature: any = {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            // next.coordinates = [newLng, newLat, newAltitude]
                            coordinates: [
                                next.coordinates[0],
                                next.coordinates[1],
                                next.coordinates[2]
                            ]
                        },
                        properties: {
                            timestamp: next.timestamp,
                            speed: next.speed,
                            direct_angle: next.direct_angle,
                            altitude: next.altitude,
                            waterfall: next.waterfall,
                            waterup: next.waterup,
                            fly: next.fly,
                            vehicle_id: vehicleId
                        }
                    };

                    // Добавляем новый feature в массив
                    //@ts-ignore
                    acc.features.push(feature);
                    // Заменяем prevPoint, чтобы на следующем шаге двигаться от этой точки
                    //@ts-ignore
                    acc.prevPoint = next;
                    return acc;
                }, { prevPoint: initialState.prevPoint, features: initialState.features }),

                // Преобразуем в формат, который ждёт MapService:
                map(acc => {
                    return {
                        vehicleId,
                        isRepeat: true,
                        data: {
                            type: 'FeatureCollection',
                            features: acc.features.slice() // копия массива, чтобы никто не мутировал напрямую
                        }
                    };
                }),

                // При каждом тике пушим в BehaviorSubject
                tap(payload => {
                    //@ts-ignor

                    this.track$.next(payload);
                })
            )
            .subscribe();
    }

    movePoint(prev, idx) {
        const meters = 500;
        const [prevLng, prevLat] = prev.coordinates;

        // Смещение по широте/долготе (~500 м)
        const deltaLat = meters / 111320; // ≈ 0.00449°
        let newLat = prevLat;
        let newLng = prevLng;

        if (idx % 2 === 0) {
            // «на север» (широта)
            newLat = prevLat + deltaLat;
        } else {
            // «на восток» (долгота, с учётом cos(lat))
            newLng = prevLng + meters / (111320 * Math.cos(prevLat * Math.PI / 180));
        }

        // altitude в диапазоне [0, 1000]:
        const newAltitude = Math.abs(Math.sin(idx / 10)) * 1000;

        // скорость: синусоида, max ≈ 25 м/с
        const newSpeed = Math.abs(Math.sin(idx / 5)) * 25;

        // направление: 0° (север) или 90° (восток)
        const direct_angle = (idx % 2 === 0) ? 0 : 90;

        // fly: «reserved» первые 5 точек, «landing» следующие 5, и так далее
        const fly = (idx % 10 < 5) ? 'Takeoff' : 'Landing';

        // waterfall: активируется каждые 7 точек
        let waterfall = null;
        if (idx % 7 === 0) {
            //@ts-ignore
            waterfall = 'active';
            //@ts-ignore
        } else if (idx % 7 === 1) {
            //@ts-ignore
            waterfall = 'inactive';
        }

        // waterup: активируется каждые 11 точек
        let waterup = null;
        if (idx % 11 === 0) {
            //@ts-ignore
            waterup = 'active';
            //@ts-ignore
        } else if (idx % 11 === 1) {
            //@ts-ignore
            waterup = 'inactive';
        }

        return {
            coordinates: [newLng, newLat, newAltitude],
            altitude: newAltitude,
            speed: newSpeed,
            direct_angle,
            waterfall,
            waterup,
            fly,
            timestamp: new Date().toISOString()
        };
    }
}



