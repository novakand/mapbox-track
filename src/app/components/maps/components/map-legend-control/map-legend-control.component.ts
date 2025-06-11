import { CommonModule } from '@angular/common';
import { Component, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'map-legend-control',
  templateUrl: './map-legend-control.component.html',
  styleUrls: ['./map-legend-control.component.scss'],
  imports: [
    CommonModule,
     ButtonModule, 
     TooltipModule, 
     FormsModule,
     CardModule,
     TranslateModule
  ]
})
export class MapLegendControlComponent {

}
