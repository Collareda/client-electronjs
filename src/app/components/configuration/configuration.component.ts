import { ElectronService } from 'ngx-electron';
import { ProxyModel } from '../../model/proxy.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  userProxyModel: ProxyModel;
  userProxyForm: FormGroup;
  erro: any;
  typeClient: string;
  activeProxy: boolean;

  constructor(private router: Router, private fb: FormBuilder, private _electronService: ElectronService) {
  }


  ngOnInit(): void {
    this.userProxyModel = this._electronService.ipcRenderer.sendSync('findonebyentity-nedb', ['proxy']);


    if (this.userProxyModel != null) {
      console.log('PROXY encontrada, estamos redirecionando...');
      this.activeProxy = this.userProxyModel.activeProxy;
      this.userProxyForm = this.fb.group({
        inputIpProxy: [this.userProxyModel.ip], inputPortProxy: [this.userProxyModel.port],
        inputUserProxy: [this.userProxyModel.userProxy], inputPassProxy: [this.userProxyModel.passwordProxy],
        activeProxy: [this.userProxyModel.activeProxy]
      });
    } else {
      this.userProxyForm = this.fb.group({
        inputIpProxy: [null], inputPortProxy: [null], inputUserProxy: [null], inputPassProxy: [null],activeProxy: [false]
      })
    }
  }

  onCheckChange(event){
    this.activeProxy = event.target.checked

 }

  handleChange(evt: string) {
    this.typeClient = evt;
  }

  configProxy() {
    if (this.userProxyModel === null) {
      this.userProxyModel = {
        ip: this.userProxyForm.get('inputIpProxy').value,
        port: this.userProxyForm.get('inputPortProxy').value,
        userProxy: this.userProxyForm.get('inputUserProxy').value,
        passwordProxy: this.userProxyForm.get('inputPassProxy').value,
        activeProxy: this.activeProxy,
        entityName: 'proxy'
      };
      this._electronService.ipcRenderer.send('insert-nedb', [this.userProxyModel]);
    } else {
      this.userProxyModel.ip = this.userProxyForm.get('inputIpProxy').value,
        this.userProxyModel.port = this.userProxyForm.get('inputPortProxy').value,
        this.userProxyModel.userProxy = this.userProxyForm.get('inputUserProxy').value,
        this.userProxyModel.passwordProxy = this.userProxyForm.get('inputPassProxy').value,
        this.userProxyModel.activeProxy = this.activeProxy,
        this.userProxyModel.entityName = 'proxy'

      this._electronService.ipcRenderer.send('update-nedb', ['proxy', this.userProxyModel]);

    }

  }

}
