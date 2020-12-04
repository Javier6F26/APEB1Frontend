import {Component, OnInit} from '@angular/core';
import {SocketService} from "../../socket.service";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {
  accountingPerMatrix,
  adminPerMatrix,
  operatorPerMatrix,
  PermCRUD,
  PermMatrix,
  secretaryPerMatrix,
  User
} from "../../interfaces";
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
      this.loading = false
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

  setRolePerMatrix(value: string) {
    switch (value) {
      case 'Administrador':
        this.permFormGroup = new FormGroup({
          users: this.getFormPermCRUD(adminPerMatrix.users),
          invent: this.getFormPermCRUD(adminPerMatrix.invent),
          services: this.getFormPermCRUD(adminPerMatrix.services),
          role: new FormControl(value, [Validators.required]),
        })
        break
      case 'Contabilidad':
        this.permFormGroup = new FormGroup({
          users: this.getFormPermCRUD(accountingPerMatrix.users),
          invent: this.getFormPermCRUD(accountingPerMatrix.invent),
          services: this.getFormPermCRUD(accountingPerMatrix.services),
          role: new FormControl(value, [Validators.required]),
        })
        break
      case 'Operador':
        this.permFormGroup = new FormGroup({
          users: this.getFormPermCRUD(operatorPerMatrix.users),
          invent: this.getFormPermCRUD(operatorPerMatrix.invent),
          services: this.getFormPermCRUD(operatorPerMatrix.services),
          role: new FormControl(value, [Validators.required]),
        })
        break
      case 'secretary':
        this.permFormGroup = new FormGroup({
          users: this.getFormPermCRUD(secretaryPerMatrix.users),
          invent: this.getFormPermCRUD(secretaryPerMatrix.invent),
          services: this.getFormPermCRUD(secretaryPerMatrix.services),
          role: new FormControl(value, [Validators.required]),
        })
        break

    }
  }

  setFormGroup() {
    if (this.user) {
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
          role: new FormControl(this.user.role, [Validators.required]),
        })
      } else
        this.permFormGroup = new FormGroup({
          users: this.getFormPermCRUD(null),
          invent: this.getFormPermCRUD(null),
          services: this.getFormPermCRUD(null),
          role: new FormControl('', [Validators.required]),
        })
    } else {
      this.permFormGroup = new FormGroup({
        users: this.getFormPermCRUD(null),
        invent: this.getFormPermCRUD(null),
        services: this.getFormPermCRUD(null),
        role: new FormControl('', [Validators.required]),
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
      user.role = this.permFormGroup.get('role').value;
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
