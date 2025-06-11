import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { PanelModule } from 'primeng/panel';
import { IVehicle } from '../../interfaces/vehicle.interface';
import { ListboxModule } from 'primeng/listbox';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { IsTextOverflowingPipe } from '../../../../pipes/text-overflowing.pipe';
import { DialogService } from "primeng/dynamicdialog";
import { delay } from 'rxjs';
import { VehicleDetailComponent } from '../vehicle-detail/vehicle-detail.component';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { LayoutService } from '../../../../services/layout.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-vehicle-list',
    standalone: true,
    templateUrl: './vehicle-list.component.html',
    styleUrls: ['./vehicle-list.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        TooltipModule,
        ButtonModule,
        IsTextOverflowingPipe,
        ReactiveFormsModule,
        PanelModule,
        ListboxModule,
        VehicleDetailComponent,
        SkeletonModule,
        TranslateModule
    ],
    providers: [DialogService]
})
export class VehicleListComponent implements OnInit {
    public active: any = null;
    public data: IVehicle[] = [];
    public noProgress: boolean;
    public inProgress: boolean;
    public dialog: any;
    public skeletons = Array(5);
    public isSmallScreen: boolean;
    constructor(
        private vehicleService: VehicleService,
        private router: Router,
        public dialogService: DialogService,
        private breakpointObserver: BreakpointObserver,
        public layoutService: LayoutService,
    ) {

        this.breakpointObserver
            .observe(['(min-width: 992px)', '(max-width: 767px)'])
            .pipe(delay(100))
            .subscribe((state: BreakpointState) => {
                this.isSmallScreen = state.breakpoints['(max-width: 767px)'];

            });
    }

    public ngOnInit() {
        this.vehicleService.findAll()
            .pipe(
                delay(50),
            )
            .subscribe({
                next: data => {
                    this.data = data;
                },
                error: err => {
                    console.error(err);
                }
            });
    }

    public onChange({ value }: any): void {
        this.router.navigate(['/vehicle', value.id]);
    }

      public toggleSideBar(): void {
        this.layoutService.toggleSideBar();
    
    }

}
