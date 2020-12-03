import { Component, OnInit } from '@angular/core';
import {SocketService} from "../socket.service";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  constructor(socketService:SocketService) {
    socketService.connect()
  }

  ngOnInit(): void {

  }

}
