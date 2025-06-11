import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MapService } from '../../services/map-service';
import { delay, filter, startWith, Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
@Component({
    selector: 'map-sidebar',
    templateUrl: './map-sidebar.component.html',
    styleUrls: ['./map-sidebar.component.scss'],
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, DrawerModule, MultiSelectModule, FloatLabelModule, SelectModule],
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapSidebarComponent implements OnDestroy, OnInit {

    @Input() public isVisible = false;
    @Output() public visibleChange: Subject<boolean> = new Subject<boolean>();

    @Output() public changesLanguage: Subject<boolean> = new Subject<boolean>();
    @Output() public changesBaseLayers: Subject<boolean> = new Subject<boolean>();
    @Output() public changesCustomLayers: Subject<boolean> = new Subject<boolean>();

    constructor(
        private _fb: FormBuilder,
        private _mapService: MapService
    ) {
    }
    public form: FormGroup;
    public state: any[] = [];
    public style: string;
    public mapLanguage = { name: 'English', code: 'en' };
    public mapStyle = { name: 'Streets', code: 'streets-v12' };
    private _map: any;
    private _destroy$ = new Subject<boolean>();

    public defaultOpts: any = {
        language: { name: 'English', code: 'en' },
        baseLayer: { name: 'Streets', code: 'streets-v12' },
        customLayers: null
    }

    public languageOptions: { name: string; code: string }[] = [
        { name: 'English', code: 'en' },
        { name: 'العربية', code: 'ar' },
        { name: '中文 (简体)', code: 'zh-Hans' },
        { name: '中文 (繁體)', code: 'zh-Hant' },
        { name: 'Français', code: 'fr' },
        { name: 'Deutsch', code: 'de' },
        { name: 'Italiano', code: 'it' },
        { name: '日本語', code: 'ja' },
        { name: '한국어', code: 'ko' },
        { name: 'Português', code: 'pt' },
        { name: 'Русский', code: 'ru' },
        { name: 'Español', code: 'es' },
        { name: 'Tiếng Việt', code: 'vi' },
        { name: 'Türkçe', code: 'tr' }
    ];

    public stylesOptions: any[] = [
        { name: 'Streets', code: 'streets-v12' },
        { name: 'Satellite', code: 'satellite-streets-v12' },
        { name: 'Light', code: 'light-v11' },
        { name: 'Dark', code: 'dark-v11' },
        { name: 'Outdoors', code: 'outdoors-v12' },
        { name: 'Navigation', code: 'navigation-day-v1' },
        { name: 'Navigation Night', code: 'navigation-night-v1' }
    ];

    private _watchForLoadChanges() {
        this._mapService.load$
            .pipe(
                filter(Boolean),
                takeUntil(this._destroy$),
            )
            .subscribe((data: any) => {
                this._map = data;
                const language = localStorage?.getItem('language');
                const selectedLanguage = (language && JSON.parse(language)) ? JSON.parse(language) : { name: 'English', code: 'en' };
                this.form?.get('language')?.setValue(selectedLanguage, { emitEvent: true, onlySelf: true });
                if (selectedLanguage) {
                    this.mapLanguage = selectedLanguage;

                }
                if (this._map.getStyle()) {
                    this.applyLanguage(this.mapLanguage.code);
                }
            });
    }

    public onVisibleChange(event: any): void {
        this.visibleChange.next(event);
    }

    public ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();
    }
    public ngOnInit(): void {
        this._watchForLoadChanges();
        this._buildForm();

        this.form.get('language')!.valueChanges
            .pipe(
                delay(0)
            )
            .subscribe(langData => {
                localStorage.setItem('language', JSON.stringify(langData));
                this.mapLanguage = langData;
                if (this._map && this._map.getStyle()) {
                    this.applyLanguage(this.mapLanguage.code);
                }
            });


        this.form.get('style')?.valueChanges
            .pipe(delay(100))

            .subscribe((data) => {
                const { code } = data;
                this._map.setStyle('mapbox://styles/mapbox/' + code);
                this.changesBaseLayers.next(data);
                localStorage.setItem('style', JSON.stringify(data));
                const language = localStorage.getItem('language');
                const selectedLanguage = (language && JSON.parse(language)) ? JSON.parse(language) : { name: 'English', code: 'en' };
                this.form.get('language')?.setValue(selectedLanguage, { emitEvent: true, onlySelf: true });
                this._map.once('styledata', () => {
                    this.applyLanguage(this.mapLanguage.code);
                });
            });

    }


    private applyLanguage(code: string) {
        if (!this._map || !this._map.getStyle()) {
            return;
        }

        const expr: any[] = [
            'coalesce',
            ['get', `name_${code}`],
            ['get', 'name_en'],
            ['get', 'name']
        ];

        const layers = this._map.getStyle().layers;
        if (!Array.isArray(layers)) {
            return;
        }

        layers.forEach(layer => {
            if (
                layer.type === 'symbol' &&
                typeof layer.id === 'string' &&
                layer.id.endsWith('-label')
            ) {
                try {
                    this._map.setLayoutProperty(layer.id, 'text-field', expr);
                } catch {
                }
            }
        });
    }

    public onChangeCustomLayers(event: any) {
        this.changesCustomLayers.next(event);
    }

    public onClose(): void {
        this.isVisible = false;
        this.visibleChange.next(this.isVisible);
    }

    private _buildForm(): void {
        const style = localStorage.getItem('style');
        const selectedBaseLayers = (style && JSON.parse(style)) ? JSON.parse(style) : { name: 'Streets', code: 'streets-v12' };
        this.form = this._fb.group({
            language: new FormControl(''),
            style: new FormControl(selectedBaseLayers),
            customLayers: new FormControl(''),
        });
    }

}
