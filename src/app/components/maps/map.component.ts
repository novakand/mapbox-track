import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { delay, filter, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { LngLatBounds } from 'mapbox-gl';
import { MapZoomControlComponent } from './components/map-zoom-control/map-zoom-control.component';
import { MapService } from './services/map-service';
import { MapFullscreenComponent } from './components/map-fullscreen/map-fullscreen.component';
import { MapSidebarComponent } from './components/map-sidebar/map-sidebar.component';
import { MapSettingsControlComponent } from './components/map-settings-control/map-settings-control.component';
import mapboxgl from 'mapbox-gl';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { DeckDirective } from './components/deck/directives/deck.directive';
import { ScenegraphLayerDirective } from './components/deck/directives/scene-graph-layer.directive';
import { LoadProgressService } from '../../services/load-progress.service';
import { LayoutService } from '../../services/layout.service';
import { MapComponent as NgxMapComponent, LayerComponent, GeoJSONSourceComponent, ImageComponent, PopupComponent } from 'ngx-mapbox-gl';
import { MapSidebarBottomComponent } from './components/map-sidebar-bottom/map-sidebar-bottom.component';
import { MapLegendControlComponent } from './components/map-legend-control/map-legend-control.component';
import { VehicleService } from '../vehicle/services/vehicle.service';
import { featureCollection, } from "@turf/helpers";
import { Feature, FeatureCollection, GeoJsonProperties, LineString, Point } from 'geojson';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        ChipModule,
        SkeletonModule,
        NgxMapComponent,
        GeoJSONSourceComponent,
        LayerComponent,
        ImageComponent,
        MapZoomControlComponent,
        MapFullscreenComponent,
        MapSidebarComponent,
        MapSettingsControlComponent,
        MapSidebarBottomComponent,
        MapLegendControlComponent,
        DeckDirective,
        ScenegraphLayerDirective,
        PopupComponent,
        TranslateModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnDestroy, OnInit {

    public scenegraphLayerOpts: any;
    public lineLayerOpts: any;
    public pathLayerOpts: any;
    public tripsLayerOpts: any;
    public previousDarkTheme;
    public previousMenuMode
    public mapOptions: any;
    public center: any;
    public bounds: any;
    public isShowPopup: boolean;
    public position: number[] = [];
    public zoom: number = 0;
    public map: any;
    public clusterData: any;
    public isVisible = false;
    public isVisibleSidebarBottom = false;
    public zoomChanges$ = new Subject<boolean>();
    public trackData: Feature<Point, GeoJsonProperties>[] | null = null;
    public trackTimestamps: string[] = [];
    public playbackIdx = 0;
    public playbackIntervalId: any = null;
    public isAutoPan = false;
    public playSpeed = 1;
    public destroy$ = new Subject<boolean>();
    public playbackState = false;
    public isEnded = false;
    public layouts: Record<string, any> = {
        'track-path-layer': { visibility: 'visible', 'line-join': 'round', 'line-cap': 'round' },
        'track-points-full-layer': { visibility: 'none' },
        'events-layer': { visibility: 'visible' },
        'track-points-hikvision': {
            visibility: 'none',
            'icon-allow-overlap': true,
            'icon-size': 0.25,
            'icon-image': 'square'
        },
        'track-points-iridium': {
            visibility: 'none',
            'icon-allow-overlap': true,
            'icon-size': 0.25,
            'icon-image': 'triangle'
        }
    };

    public segmentsGeoJson: FeatureCollection<LineString> | null = null;
    public headingGeoJson: FeatureCollection<LineString> | null = null;
    public pointsGeoJson: FeatureCollection<Point> | null = featureCollection([]);
    public eventsGeoJson: FeatureCollection<Point> | null = null;

    public eventIcons = [
        { name: 'Takeoff', url: 'assets/icons/reserved.png' },
        { name: 'Landing', url: 'assets/icons/landing.png' },
        { name: 'drop', url: 'assets/icons/drop.png' },
        { name: 'get', url: 'assets/icons/get.png' }
    ];

    public waypointsIcons = [
        { name: 'square', url: 'assets/icons/square.png' },
        { name: 'triangle', url: 'assets/icons/triangle.png' },
    ];

    public modelScenegraphUrl = 'assets/models/test.glb';
    public isMoving = false;
    public isMapLoad = false;
    public selectedPoint: GeoJSON.Feature<GeoJSON.Point> | any;
    public cursorStyle: string;
    public allClusters: any[] = [];
    public prevVehicleId;
    public didFitBoundsInRepeat;
    public _isRepeat;
    public shouldFitBounds;
    public playIndex;
    public baseLayers = localStorage.getItem('style');
    public selectedBaseLayers = (this.baseLayers && JSON.parse(this.baseLayers)) ? JSON.parse(this.baseLayers) : { name: 'Streets', code: 'streets-v12' };
    public style = 'mapbox://styles/mapbox/' + this.selectedBaseLayers.code;

    constructor(
        public cdr: ChangeDetectorRef,
        public mapService: MapService,
        private _loadProgressService: LoadProgressService,
        public layoutService: LayoutService,
        private _vehicleService: VehicleService,
        private ngZone: NgZone,
        private messageService: MessageService,
        private translate: TranslateService,
    ) {

        this.previousDarkTheme = this.layoutService.config().darkTheme;
        this.mapOptions = {
            projection: 'mercator',
            minZoom: 3,
            zoom: [3],
            center: [29.095028, 55.635322],
            pitch: undefined,
            style: this.style,
            centerWithPanTo: true,
            movingMethod: 'jumpTo'
        }

        const baseLayers = localStorage.getItem('baseLayers');
        const selectedBaseLayers = (baseLayers && JSON.parse(baseLayers)) ? JSON.parse(baseLayers) : { name: 'Улицы-2', code: 'streets-v12' };
        this.style = 'mapbox://styles/mapbox/' + selectedBaseLayers.code;

        this._watchForLayoutOverlayChanges();
        this._watchForTrackChanges();
        this._watchForRemoveChanges();
    }

    private _watchForRemoveChanges() {
        this.mapService.remove$
            .pipe(
                filter(Boolean),
                tap(() => this.remove()),
                takeUntil(this.destroy$),
            )
            .subscribe();
    }

    public getPropertiesKeys(point: any): string[] {
        return point?.properties ? Object.keys(point?.properties) : [];
    }

    public calculateAngle(point1, point2) {
        const [lng1, lat1] = point1;
        const [lng2, lat2] = point2;
        const deltaLng = lng2 - lng1;
        const deltaLat = lat2 - lat1;
        const angleRad = Math.atan2(deltaLng, deltaLat);
        const angleDeg = (angleRad * 180) / Math.PI;
        return (angleDeg + 360) % 360;
    }


    public calcAvgAltitude(a, b): number {
        const altA = a.altitude != null ? a.altitude : 0;
        const altB = b.altitude != null ? b.altitude : 0;
        return (altA + altB) / 2;
    }

    public remove(): void {
        this.segmentsGeoJson = null;
        this.headingGeoJson = null;
        this.pointsGeoJson = null;
        this.eventsGeoJson = null;
        this.scenegraphLayerOpts = null;
        this._stopPlayback();
        this.playbackIdx = 0;
        this.playbackState = false;
        this.playSpeed = 1;
        this.isAutoPan = false;
        this.trackData = null;
        this.trackTimestamps = [];
        this.trackData = null;
        this.cdr.markForCheck();
        this.mapService.currentTrackPoint$.next(null);
        this.cdr.markForCheck();
    }

    private _hasValidFeatures = (p: any): boolean => {
        return p != null &&
            typeof p === 'object' &&
            !!p.vehicleId &&
            Array.isArray(p.data?.features) &&
            p.data.features.length > 0;
    };

    public onLayerClick(event) {
        this.selectedPoint = null;
        this.selectedPoint = (<any>event).features[0];
    }

    public onCloseInfoBox() {
        this.selectedPoint = null;
    }

    private _watchForTrackChanges(): void {

        this._vehicleService.track$
            .pipe(
                filter(Boolean),
                takeUntil(this.destroy$),
                switchMap(p =>
                    of(p).pipe(
                        delay(3000),
                        tap(p => {
                            const features = p.data?.features as any[] | undefined;
                            if (!features || features.length === 0) {
                                this.remove();
                                if (!p.isRepeat) {
                                    this.messageService.add({
                                        key: 'notfound',
                                        summary: this.translate.instant('toast.notfound.nodata.summary'),
                                        detail: this.translate.instant('toast.notfound.nodata.detail')
                                    });
                                }
                                this._loadProgressService.hide(999);
                                return;
                            }
                        }),
                        filter(p => this._hasValidFeatures(p)),
                        tap(p => {
                            !p.isRepeat && this._stopPlayback();
                            const features = p.data.features as Feature<Point, GeoJsonProperties>[];
                            this.trackData = features;
                            this.trackTimestamps = features.map(f => f.properties!['timestamp'] as string);
                            this.playbackIdx = p.isRepeat ? features.length - 1 : 0;

                            this.mapService.currentTrackPoint$.next(features[this.playbackIdx]);
                            this._setupFlags(p.vehicleId, p.isRepeat);

                            this.cdr.markForCheck();
                        }),
                        map(p => p.data.features as Feature<Point, GeoJsonProperties>[]),
                        tap(features => this._buildSegments(features)),
                        tap(features => this._buildPoints(features)),
                        tap(features => this._buildEvents(features)),
                        tap(features => {
                            this._buildModelLayer(features, this.playbackIdx);

                        }),
                    )
                )
            )
            .subscribe({
                next: (features: any) => {
                    this._loadProgressService.hide(999);
                    this._applyFitBounds(features);
                    this.cdr.markForCheck();
                },
                error: err => {
                    console.error('Unhandled error in subscription:', err);
                }
            });

    }

    public onTimelineChange(idx: number): void {
        this._stopPlayback();
        if (!this.trackData || !this.trackData.length) {
            return;
        }

        if (this.isAutoPan) {
            const coords = this.trackData[this.playbackIdx].geometry.coordinates as [number, number];
            this.moveMapCamera(coords);
        }
        if (this.trackData && idx >= this.trackData.length - 1) {
            this.onPlayStateChange(false);
        }
        this.playbackIdx = Math.max(0, Math.min(idx, this.trackData.length - 1));
        this.mapService.currentTrackPoint$.next(this.trackData[this.playbackIdx]);
        const slice = this.trackData.slice(0, this.playbackIdx + 1);

        this._buildSegments(slice);
        this._buildPoints(slice);
        this._buildEvents(slice);
        this._buildModelLayer(slice, this.playbackIdx);
        this._applyFitBounds(slice);
        this.cdr.markForCheck();

    }

    public onSpeedMultiplierChange(mult: number): void {
        this.playSpeed = mult;
        if (this.playbackIntervalId) {
            clearInterval(this.playbackIntervalId);
            this.playbackIntervalId = null;
            this._startPlayback();
        }
    }


    private _drawFrame(idx: number) {
        const slice = this.trackData!.slice(0, idx + 1);
        this.mapService.currentTrackPoint$.next(this.trackData![idx]);
        this._buildSegments(slice);
        this._buildPoints(slice);
        this._buildEvents(slice);
        this._buildModelLayer(slice, idx);
        if (this.isAutoPan) {
            const [lng, lat] = slice[slice.length - 1].geometry.coordinates as [number, number];
            this.moveMapCamera([lng, lat]);
        }
    }


    public onPlayStateChange(isPlaying: boolean): void {
        this.playbackState = isPlaying;
        this.cdr.detectChanges();

        if (isPlaying) {
            if (this.isEnded) {
                this.playbackIdx = 0;
            }
            this._startPlayback();
        } else {
            this._stopPlayback();
        }

        this.cdr.detectChanges();
    }


    private _startPlayback(): void {
        if (!this.trackData?.length) return;

        // 1) Сбрасываем флаг окончания и чистим старый таймер
        this.isEnded = false;
        if (this.playbackIntervalId) {
            clearInterval(this.playbackIntervalId);
            this.playbackIntervalId = null;
        }

        // 2) Отрисовать текущий кадр (на случай, если playbackIdx сброшен в onPlayStateChange)
        this._drawFrame(this.playbackIdx);

        // 3) Запустить цикл анимации
        this.playbackIntervalId = setInterval(() => {
            if (this.playbackIdx < this.trackData!.length - 1) {
                this.playbackIdx++;
                this._drawFrame(this.playbackIdx);
            } else {
                this.isEnded = true;
                this._stopPlayback();
            }
        }, 1000 / this.playSpeed);
    }


    private _stopPlayback(): void {
        if (this.playbackIntervalId) {
            clearInterval(this.playbackIntervalId);
            this.playbackIntervalId = null;
        }
        this.playbackState = false;
        this.cdr.markForCheck();
    }


    public onAutoPanChange(enabled: boolean): void {
        this.isAutoPan = enabled;
        if (this.isAutoPan && this.trackData?.[this.playbackIdx]) {
            this.moveMapCamera(this.trackData[this.playbackIdx].geometry.coordinates);
        }
    }

    private _easeInOutCubic(t: number): number {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    private _buildModelLayer(
        features: Feature<Point, GeoJsonProperties>[],
        idx: number
    ) {
        const pt = features[idx];
        if (!pt) {
            this.scenegraphLayerOpts = null;
            return;
        }

        const rawSpeed = (pt.properties!['speed'] as number) || 0;
        const computedSpeed = rawSpeed > 0
            ? rawSpeed
            : 0;

        const transitionSettings = {
            duration: 100,
            easing: this._easeInOutCubic.bind(this)
        };
        this.scenegraphLayerOpts = {
            id: 'model-layer',
            data: [pt],
            scenegraph: this.modelScenegraphUrl,
            pickable: true,
            _lighting: 'pbr',
            sizeScale: 6,
            sizeMinPixels: 4,
            sizeMaxPixels: 1.8,
            getPosition: (d: any) => [d.geometry.coordinates[0], d.geometry.coordinates[1], 0],
            getOrientation: (d: any) => [0, -(d.properties.direct_angle ?? 0) + 180, 90],
            getColor: (d: any) => d.properties.suspicious ? [255, 0, 0] : [255, 255, 255],
            _animations: { '*': { speed: computedSpeed }, loop: true },
            updateTriggers: { _animations: computedSpeed },
            transitions: {
                getPosition: transitionSettings,
                getOrientation: transitionSettings
            }
        };
        this.cdr.detectChanges();
    }


    private _setupFlags(vehicleId: string, isRepeat: boolean): void {
        if (this.prevVehicleId !== vehicleId) {
            this.prevVehicleId = vehicleId;
            this.didFitBoundsInRepeat = false;
        }
        this._isRepeat = isRepeat;
        this.shouldFitBounds = isRepeat
            ? !this.didFitBoundsInRepeat
            : true;
        if (isRepeat) {
            this.didFitBoundsInRepeat = true;
        }
    }

    private _buildSegments(features: Feature<Point, GeoJsonProperties>[]): void {
        const segmentFeatures: Feature<LineString, GeoJsonProperties>[] = [];

        for (let i = 0; i < features.length - 1; i++) {
            const a = features[i].properties!['altitude'] ?? 0;
            const b = features[i + 1].properties!['altitude'] ?? 0;
            const avgAlt = (a + b) / 2;

            const curr = (features[i].geometry as any).coordinates as [number, number];
            const next = (features[i + 1].geometry as any).coordinates as [number, number];

            segmentFeatures.push({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [curr, next]
                },
                properties: { avgAltitude: avgAlt }
            });
        }

        this.segmentsGeoJson = {
            type: 'FeatureCollection',
            features: segmentFeatures
        };
    }

    private _buildPoints(
        features: Feature<Point, GeoJsonProperties>[]
    ): void {
        const pointFeatures: Feature<Point, GeoJsonProperties>[] = features.map(f => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: f.geometry.coordinates as [number, number]
            },
            properties: { ...f.properties }
        }));

        this.pointsGeoJson = {
            type: 'FeatureCollection',
            features: pointFeatures
        };
        const isVisible = this.layouts['track-points-hikvision'].visibility === 'visible';
        this.onChangesLayers('track-points-hikvision', isVisible);
        this.onChangesLayers('track-points-iridium', isVisible)
        this.cdr.detectChanges();
    }

    private _buildEvents(
        features: Feature<Point, GeoJsonProperties>[]
    ): void {
        const iconFeatures: Feature<Point, GeoJsonProperties>[] = [];
        let lastFly: string | null = null;

        features.forEach((f, idx) => {
            const prev = features[idx - 1];
            const coords = f.geometry.coordinates as [number, number];

            if (f.properties?.['fly'] && f.properties['fly'] !== lastFly &&
                ['Takeoff', 'Landing'].includes(f.properties['fly'])) {
                iconFeatures.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: coords },
                    properties: { iconName: f.properties['fly'], ...f.properties }
                });
                lastFly = f.properties['fly'];
            }

            if (f.properties?.['waterfall'] === 'active' &&
                prev?.properties?.['waterfall'] !== 'active') {
                iconFeatures.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: coords },
                    properties: { iconName: 'drop', ...f.properties }
                });
            }

            if (f.properties?.['waterup'] === 'active' &&
                f.properties?.['waterup'] !== prev?.properties?.['waterup']) {
                iconFeatures.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: coords },
                    properties: { iconName: 'get', ...f.properties }
                });
            }
        });

        this.eventsGeoJson = {
            type: 'FeatureCollection',
            features: iconFeatures
        };
    }


    private _applyFitBounds(pts: Feature<Point>[]): void {
        if (!this.map || !this.shouldFitBounds || pts.length < 2) {
            return;
        }
        const coords: [number, number][] = pts.map(f =>
            f.geometry.coordinates as [number, number]
        );

        const bounds = coords.reduce(
            (b: LngLatBounds, c) => b.extend(c),
            new LngLatBounds(coords[0], coords[0])
        );

        this.map.fitBounds(bounds, {
            padding: 200,
            maxZoom: 15,
            duration: 1000
        });

        this.shouldFitBounds = false;
    }


    public addLayersGraphs(data: GeoJSON.FeatureCollection<GeoJSON.Point>): void {
        if (!data || !Array.isArray(data.features) || data.features.length === 0) {
            this.scenegraphLayerOpts = null;
            return;
        }

        this.scenegraphLayerOpts = {
            id: 'scenegraph-layer-single',
            data: data.features,
            scenegraph: this.modelScenegraphUrl,
            sizeScale: 2,
            pickable: true,
            sizeMinPixels: 10,
            getPosition: (d: GeoJSON.Feature<GeoJSON.Point>) => d.geometry.coordinates,
            getTranslation: [0, 0, 0],
            getOrientation: (d: any) => [0, 90, 90],
            visible: true,
            _lighting: 'pbr',
        };

        this.cdr.markForCheck();
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
        this.remove();

        this.map = null;
    }

    public ngOnInit(): void {
    }

    public onChangeSettings(event: any): void {
        this.isVisible = !this.isVisible;
    }

    public onChangeSidebarBottom(event: any) {
        this.isVisibleSidebarBottom = event;
    }

    public onVisibleChangeSidebar(event) {
        this.isVisible = event;
    }


    public onLayerMouseMove(event: any, type): void {
        this.selectedPoint = null;
        this.selectedPoint = (<any>event).features[0];
        this.selectedPoint.properties.typeBox = type;
        this.cdr.detectChanges();
    }

    public onLayerMouseOut(event: any): void {
        this.selectedPoint = null;
        this.cdr.detectChanges();
    }

    public onlayerChange(event): void {
        const { code, visible } = event || {};
        this.onChangesLayers(code, visible)
    }

    public onChangesLayers(code: string, visible: boolean): void {
        const visibility: 'visible' | 'none' = visible ? 'visible' : 'none';
        if (code === 'track-points-full-layer') {
            ['track-points-hikvision', 'track-points-iridium'].forEach((subLayer) => {
                if (this.layouts[subLayer]) {
                    this.layouts[subLayer] = {
                        ...this.layouts[subLayer],
                        visibility
                    };
                }
            });
        } else {
            if (this.layouts[code]) {
                this.layouts[code] = {
                    ...this.layouts[code],
                    visibility
                };
            }
        }
    }

    public getBounds(coordinates: any): any {
        return coordinates?.reduce((bounds: any, coord: any) => {
            return bounds?.extend(<any>coord);
        }, new LngLatBounds(coordinates[0], coordinates[0]));
    }


    public _watchForLayoutOverlayChanges(): void {
        this.layoutService.overlayChanages
            .pipe(
                takeUntil(this.destroy$),
                delay(50),
            )
            .subscribe(() => {
                this.onMapResize();
            });
    }


    public fitBounds(coordinates): void {
        this.map?.fitBounds(this.getBounds(coordinates), {
            padding: { top: 120, bottom: 120, left: 120, right: 120 }
        });
    }

    public removeAllScenegraphLayers(): void {
        this.scenegraphLayerOpts = null;
        this.cdr.markForCheck();
    }

    public onHover(info, event): void { }

    public calculateAdjustedAltitude(zoom, adjustmentFactor = 5) {
        const earthCircumference = 40075017;
        const tileSize = 512;
        const baseAltitude = earthCircumference / (Math.pow(2, zoom) * tileSize);
        return baseAltitude * adjustmentFactor;
    }

    public moveMapCamera(coordinates: any): void {
        const altitude = this.calculateAdjustedAltitude(10);
        const camera = this.map.getFreeCameraOptions();
        camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
            { lng: coordinates[0], lat: coordinates[1] },
            altitude
        );

        camera.lookAtPoint({
            lng: coordinates[0],
            lat: coordinates[1]
        });

        this.map && this.map.setFreeCameraOptions(camera);
    }

    public onChangesVisibleLayers(key: any, visible: any = 'none'): void {
        this.layouts[key] = { visibility: visible };
        this.cdr.detectChanges();
    }

    public onRender(event: any): void {
        event?.target?.resize();
    }

    public onMapload(map: any): void {
        this.map = map.target;
        this.map.dragRotate.disable();
        this.map.touchZoomRotate.disableRotation();
        this.map.doubleClickZoom.disable();
        this.map.keyboard.disableRotation();
        this.isMapLoad = true;
        this.mapService.load$.next(this.map);
        this.cdr.detectChanges();
    }

    public buildIcons(item: any): void {
        const img = new Image(38, 72);
        img.onload = () => this.map.addImage(item.name, img);
        img.src = `${location.origin}${item.src}`;
    }

    public onMapResize(): void {
        this.ngZone.run(() => {
            this.map?.resize();
            this.cdr.detectChanges();
        });
    }

}