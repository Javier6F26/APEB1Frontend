import {Component, OnInit} from '@angular/core';
import {SocketService} from "../../socket.service";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {PermCRUD, PermMatrix, User} from "../../interfaces";
import {ToastrService} from "ngx-toastr";
import {AuthService} from "../../auth.service";
import {ModalDirective} from "angular-bootstrap-md";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  loading = true
  formGroup: FormGroup
  permFormGroup: FormGroup
  user: User;
  users: User[] = []

  constructor(public auth: AuthService, private socketService: SocketService, private toast: ToastrService) {

    this.socketService.IO.on('userEventListener', () => {

      this.toast.success('Exito')
      this.get_users();
    });
    this.socketService.IO.on('errorEventListener', error => {
      if (error.message)
        this.toast.error(error.message)

      this.get_users()
    })
  }


  get_users() {
    this.socketService.IO.emit('get_users', {}, users => {
      this.users = users;
      this.user = null;
      this.loading = false;
    })
  }

  ngOnInit(): void {
    this.setFormGroup()
    this.setPermFormGroup()
    this.get_users()

  }

  setUser(user: User) {
    this.user = user;
    this.setFormGroup();
    this.setPermFormGroup();
  }

  setFormGroup() {
    if (this.user) {
      console.log('update')
      const formGroup = new FormGroup({
        userName: new FormControl(this.user.userName, [Validators.required]),
        displayName: new FormControl(this.user.displayName, [Validators.required]),
        email: new FormControl(this.user.email, [Validators.required]),
        phoneNumber: new FormControl(this.user.phoneNumber, [Validators.required]),
        photoUrl: new FormControl(this.user.photoUrl),
        lastSignIn: new FormControl((this.user.lastSignIn) ? new Date(this.user.lastSignIn).toLocaleString() : 'No ha iniciado sesión', [Validators.required]),
      })
      formGroup.get('userName').disable()
      formGroup.get('lastSignIn').disable()
      this.formGroup = formGroup;
    } else {
      console.log('no update')
      const formGroup = new FormGroup({
        userName: new FormControl('', [Validators.required]),
        displayName: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required]),
        phoneNumber: new FormControl('', [Validators.required]),
        photoUrl: new FormControl(''),
        lastSignIn: new FormControl(''),
      })

      formGroup.get('lastSignIn').disable()
      this.formGroup = formGroup
    }
  }

  setPermFormGroup() {
    if (this.user) {
      if (this.user.permScope) {
        this.permFormGroup = new FormGroup({
          users: this.getFormPermCRUD(this.user.permScope.users),
          invent: this.getFormPermCRUD(this.user.permScope.invent),
          services: this.getFormPermCRUD(this.user.permScope.services),
        })
      } else
        this.permFormGroup = new FormGroup({
          users: this.getFormPermCRUD(null),
          invent: this.getFormPermCRUD(null),
          services: this.getFormPermCRUD(null),
        })
    } else {
      this.permFormGroup = new FormGroup({
        users: this.getFormPermCRUD(null),
        invent: this.getFormPermCRUD(null),
        services: this.getFormPermCRUD(null),
      })
    }
  }

  getFormPermCRUD(permCRUD: PermCRUD): FormGroup {
    if (permCRUD)
      return new FormGroup(
        {
          create: new FormControl(permCRUD.create),
          list: new FormControl(permCRUD.list),
          modify: new FormControl(permCRUD.modify),
          delete: new FormControl(permCRUD.delete)
        }
      )
    else return new FormGroup(
      {
        create: new FormControl(false),
        list: new FormControl(false),
        modify: new FormControl(false),
        delete: new FormControl(false)
      }
    )

  }

  getFormControl(formControl: string) {
    return this.formGroup.get(formControl);
  }

  getPermFormGroup(formGroup: string) {
    return this.permFormGroup.get(formGroup);
  }

  getPermCRUD(formGroup: AbstractControl): PermCRUD {
    return {
      create: formGroup.get('create').value,
      delete: formGroup.get('delete').value,
      list: formGroup.get('list').value,
      modify: formGroup.get('modify').value
    }
  }

  save(modal: ModalDirective) {

    this.formGroup.markAllAsTouched()
    if (this.formGroup.valid) {
      const perms: PermMatrix = {
        users: this.getPermCRUD(this.permFormGroup.get('users')),
        invent: this.getPermCRUD(this.permFormGroup.get('invent')),
        services: this.getPermCRUD(this.permFormGroup.get('services'))
      }

      let user: any = this.user;
      if (!user) user = {}
      user.userName = this.formGroup.get('userName').value.trim().toLowerCase();
      user.permScope = perms;
      user.displayName = this.formGroup.get('displayName').value;
      user.email = this.formGroup.get('email').value;
      user.phoneNumber = this.formGroup.get('phoneNumber').value;
      user.photoUrl = this.formGroup.get('photoUrl').value;

      if (user._id)
        this.socketService.IO.emit('update_user', user)
      else
        this.socketService.IO.emit('add_user', user)
      this.loading = true
      modal.hide()

    }
  }

  deleteUser() {
    this.socketService.IO.emit('delete_user', this.user)
    this.loading = true;
    this.user = null
  }
}
