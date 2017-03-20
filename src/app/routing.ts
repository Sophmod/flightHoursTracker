import { Routes, RouterModule } from '@angular/router';

import { MainMenuComponent } from './main-menu/main-menu.component';
import { FlightLogComponent } from './flight-log/flight-log.component';
import { AddFlightComponent } from './add-flight/add-flight.component';

const APP_ROUTES: Routes = [
    {path: '', component: MainMenuComponent},
    {path: 'flight-log', component: FlightLogComponent},
    {path: 'add-flight', component: AddFlightComponent}
]

export const routing = RouterModule.forRoot(APP_ROUTES);

