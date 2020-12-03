import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SocketService} from "./socket.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'APEB1FE';
}
