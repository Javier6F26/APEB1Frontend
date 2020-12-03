import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  formGroup: FormGroup


  constructor(public auth: AuthService, private router: Router) {
    this.formGroup = new FormGroup(
      {
        userName: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required)
      },
    )
  }

  ngOnInit(): void {
    if (!this.auth.isTokenExpired(this.auth.getToken())) {
      this.router.navigateByUrl('/').then()
    }
  }

  login() {
    const val = this.formGroup.value
    if (val.userName) {
      this.auth.login(val.userName)
    }
  }

  verification() {
    const val = this.formGroup.value
    if (val.password)
      this.auth.verification(val.password)
  }


}
