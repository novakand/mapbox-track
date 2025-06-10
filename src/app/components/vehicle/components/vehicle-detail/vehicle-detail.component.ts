import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, delay, filter, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { VehicleService } from '../../services/vehicle.service';
import { Input as RouterInput } from '@angular/core'
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DatePicker } from 'primeng/datepicker';
import { TimelineModule } from 'primeng/timeline';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MapService } from '../../../maps/services/map-service';
import { LoadProgressService } from '../../../../services/load-progress.service';
import { IPointInfo } from '../../interfaces/point-info.interface';
import { MsToKmhPipe } from '../../../../pipes/ms-to-km.pipe';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { SafeDatePipe } from '../../../../pipes/safe-date.pipe';
@Component({
    selector: 'app-vehicle-detail',
    templateUrl: './vehicle-detail.component.html',
    styleUrls: ['./vehicle-detail.component.scss'],
    imports: [
        CommonModule,
        DrawerModule,
        ButtonModule,
        ToggleSwitchModule,
        DatePicker,
        TimelineModule,
        FormsModule,
        ReactiveFormsModule,
        MsToKmhPipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleDetailComponent implements OnInit, OnDestroy {

    @RouterInput() id!: string;

    private _isMapSidebar = signal(true);
    public form: FormGroup;
    public data: IPointInfo = {
        timestamp: '–',
        latitude: null,
        longitude: null,
        altitude: null,
        speed: null
    };
    public isSmallScreen: boolean;
    public isLargeScreen: boolean;
    public item: any;
    public isVisible = true;
    public formFields = [
        { formControlName: 'start', color: '#9C27B0', placeholder: 'Start date time' },
        { formControlName: 'end', color: '#673AB7', placeholder: 'End date time' },
    ];
    private _getTrack$ = new Subject<any>();
    private _destroy$ = new Subject<boolean>();

    constructor(
        private _fb: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private vehicleService: VehicleService,
        private router: Router,
        private _vehicleService: VehicleService,
        private _loadProgressService: LoadProgressService,
        public mapService: MapService,
        private breakpointObserver: BreakpointObserver,

    ) {
        this.data = {
            timestamp: '–',
            latitude: null,
            longitude: null,
            altitude: null,
            speed: null
        };
        this._buildForm();
        this._listenGetTrack();
        this._watchForFormValueChanges();
        this._watchForIsRepeatChanges();
        this._watchForPointValueChanges();

        this.breakpointObserver
            .observe(['(min-width: 992px)', '(max-width: 767px)'])
            .pipe(delay(100))
            .subscribe((state: BreakpointState) => {
                this.isLargeScreen = state.breakpoints['(min-width: 992px)'];
                this.isSmallScreen = state.breakpoints['(max-width: 767px)'];
                this._cdr.detectChanges();
            });
    }

    public onClose() {
        this.isVisible = false;
        this.onHide();
        this._cdr.markForCheck();
    }

    public toggleSideBar(): void {
        this._isMapSidebar.update(current => !current);
    }

    public isMapSidebar = computed(() => this._isMapSidebar());

    public containerClass = computed(() => {
        return {
            'sidebar-active': this.isMapSidebar(),
        };
    });

    private _listenGetTrack(): void {
        this._getTrack$
            .pipe(
                delay(10),
                tap(() => this._loadProgressService.show(1)),
                map(() => this._buildParams()),
                switchMap(({ start, end, isRepeat }) =>
                    this._vehicleService.getVehicleTrack(this.id, start, end, isRepeat)
                ),
                takeUntil(this._destroy$),
            )
            .subscribe();
    }


    private _buildParams(): { start: string; end: string; isRepeat: boolean } {
        const { start, end, isRepeat } = this.form.getRawValue() as {
            start: Date | string;
            end: Date | string;
            isRepeat: boolean;
        };

        const toIsoSeconds = (date: Date): string =>
            date.toISOString().split('.')[0] + 'Z';

        const now = new Date();
        const nowIso = toIsoSeconds(now);

        const todayMidnight = new Date(now);
        todayMidnight.setHours(0, 0, 0, 0);
        const startOfDayIso = toIsoSeconds(todayMidnight);

        return {
            start: isRepeat ? startOfDayIso : toIsoSeconds(new Date(start)),
            end: isRepeat ? nowIso : toIsoSeconds(new Date(end)),
            isRepeat
        };
    }


    private _watchForFormValueChanges() {
        this.form.valueChanges
            .pipe(
                filter(() => this.form.valid),
                debounceTime(600),
                tap(() => this._getTrack$.next(this.form.value))
            )
            .subscribe()
    }


    private _watchForPointValueChanges() {
        this.mapService.currentTrackPoint$
            .pipe(
                delay(100),
                // filter(Boolean),
                takeUntil(this._destroy$)
            )
            .subscribe((point: any) => {
                const [lng, lat] = point?.geometry?.coordinates ?? [null, null];
                this.data = {
                    timestamp: point?.properties?.timestamp ?? '–',
                    latitude: lat,
                    longitude: lng,
                    altitude: point?.properties?.altitude ?? null,
                    speed: point?.properties?.speed ?? null
                } as any;
                this._cdr.detectChanges();
            });
    }


    private _watchForIsRepeatChanges(): void {
        this.form.get('isRepeat')!
            .valueChanges
            .pipe(
                takeUntil(this._destroy$),
            )
            .subscribe(isRepeat => {
                const startCtrl = this.form.get('start')!;
                const endCtrl = this.form.get('end')!;

                if (isRepeat) {
                    startCtrl.disable({ emitEvent: false });
                    endCtrl.disable({ emitEvent: false });
                } else {
                    startCtrl.enable({ emitEvent: false });
                    endCtrl.enable({ emitEvent: false });
                }

            });
    }

    public ngOnInit() {
        this.getById();
       this._getTrack$.next(null)
        
    }

    public getById() {
        this.vehicleService.getById(this.id)
            .pipe(
                tap((data) => this.item = data)
            )
            .subscribe()
    }

    public onHide() {
        this.router.navigate(['/']);
        this.data = {
            timestamp: '–',
            latitude: null,
            longitude: null,
            altitude: null,
            speed: null
        };
        this._cdr.markForCheck();
        this._cdr.detectChanges();
    }

    public ngOnDestroy(): void {
        this.mapService.remove$.next(true);
        this.data = {
            timestamp: '–',
            latitude: null,
            longitude: null,
            altitude: null,
            speed: null
        };
        this._cdr.markForCheck();
        this._destroy$.next(true);
        this._destroy$.complete();
    }

    private _buildForm(): void {
        const now = new Date();
        const midnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0, 0, 0, 0
        );

        this.form = this._fb.group({
            start: [{ value: midnight, disabled: true }, [Validators.required]],
            end: [{ value: now, disabled: true }, [Validators.required]],
            isRepeat: [true, [Validators.required]],
        });
    }

}
