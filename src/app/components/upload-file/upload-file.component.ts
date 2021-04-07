import { UploadFileService } from './../../service/upload-file.service';
import { HttpParams, HttpRequest, HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {

  file: any;

  constructor(private uploadFileService: UploadFileService ,private http: HttpClient) { }

  ngOnInit(): void {
  }

  uploadFile(event){
    this.uploadFileService.inputFileChange(event.target.files[0]);

  }

}
