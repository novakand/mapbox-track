import { Injectable } from "@angular/core";
import { Feature, GeoJsonProperties, Point } from "geojson";
import { BehaviorSubject, map, Observable, of, Subject, switchMap, tap } from "rxjs";

@Injectable({ providedIn: 'root' })
export class MapService {

    public load$ = new BehaviorSubject<any>(null);
    public remove$ = new BehaviorSubject<any>(null);
    public currentTrackPoint$ = new BehaviorSubject<Feature<Point, GeoJsonProperties> | null>(null);
}
