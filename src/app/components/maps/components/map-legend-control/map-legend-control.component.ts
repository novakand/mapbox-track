import { CommonModule } from '@angular/common';
import { Component, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'map-legend-control',
  templateUrl: './map-legend-control.component.html',
  styleUrls: ['./map-legend-control.component.scss'],
  imports: [
    CommonModule,
     ButtonModule, 
     TooltipModule, 
     FormsModule,
     CardModule
  ]
})
export class MapLegendControlComponent {

}
