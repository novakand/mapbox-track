import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, Subject, takeUntil } from 'rxjs';
import { MapService } from '../../services/map-service';
import { MapEventManager } from '../../services/map-event-manager';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'map-zoom-control',
    templateUrl: './map-zoom-control.component.html',
    styleUrls: ['./map-zoom-control.component.scss'],
    imports: [CommonModule, ButtonModule, TooltipModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapZoomControlComponent implements OnDestroy, OnInit {

    public isDisabled = false;
    private _map: any;
    private _eventManager: MapEventManager = new MapEventManager(inject(NgZone));
    private _destroy$ = new Subject<boolean>();
    private _zoom = this._eventManager.getLazyEmitter<void>('zoom');

    @Input() public isShowZoomControl = true;
    @Input() public isDisableZoomControl = false;
    @Input() public isResetZoomControl = true;
    @Input() public isDisabledZoomOut = false;
    @Input() public isDisabledZoomIn = false;
    @Input() public tooltipZoomIn = 'Приблизить';
    @Input() public tooltipZoomOut = 'Отдалить';

    constructor(
        private _mapService: MapService,
        private _cdr: ChangeDetectorRef,
    ) {
        this._watchForLoadChanges();
    }

    public ngOnInit(): void { }

    public ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();
        this._eventManager.destroy();
    }

    public onZoomOutChange(): void {
        this._map?.setZoom(this._map.getZoom() - 1);
        this._onZoomChange();
    }

    public onZoomInChange(): void {
        this._map?.setZoom(this._map.getZoom() + 1);
        this._onZoomChange();
    }

    private _watchForLoadChanges() {
        this._mapService.load$
            .pipe(
                filter(Boolean),
                takeUntil(this._destroy$),
            )
            .subscribe((data: any) => {
                this._map = data;
                this._eventManager.setTarget(this._map);
                this._watchForZoomChanges();
            });
    }

    private _watchForZoomChanges(): void {
        this._zoom
            .pipe(
                takeUntil(this._destroy$),
            )
            .subscribe(() => this._onZoomChange());
    }

    private _onZoomChange(): void {
        const zoom = this._map.getZoom();
        this.isDisabledZoomIn = zoom === this._map.getMaxZoom();
        this.isDisabledZoomOut = zoom === this._map.getMinZoom();
        this._cdr.detectChanges();
    }

}