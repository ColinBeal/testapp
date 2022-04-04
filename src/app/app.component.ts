import { Component }    from '@angular/core';
import { HttpClient }   from '@angular/common/http'
import { HttpHeaders }  from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
    'Authorization': 'Bearer b0084ba396b1821256dbe44de774889d',
    'Content-Type':  'application/json',
  }),
};

const defaultMembers = [
  {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@yousign.fr",
    "phone": "+33612345678",
    "fileObjects": [
      {
        "file": "/files/", //dummy fileId
        "page": 1,
        "position": "230,499,464,589",
        "mention": "Read and approved",
        "mention2": "Signed by John Doe"
      }
    ]
  },
  {
    "firstname": "Colin",
    "lastname": "BEAL",
    "email": "colinbealwork@gmail.com",
    "phone": "+33786861417",
    "fileObjects": [
      {
        "file": "/files/",
        "page": 1,
        "position": "130,199,164,489",
        "mention": "Read and approved",
        "mention2": "Signed by Colin BEAL"
      }
    ]
  }
]

interface IMemberJson {
  firstname: string,
  lastname:  string,
  email:     string,
  phone:     string,
  fileObjects: Array<{
    file: string,
    page: number,
    position: string,
    mention:  string,
    mention2: string
  }>
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'test-edusign';

  private httpOptions    = httpOptions;
  private defaultMembers = defaultMembers;

  public isReady: boolean = false;
  public base64?: string;
  public members: Array<IMemberJson> = [];
  public file?:   {name: string, content: any};
  public fileId?: string;


  constructor(
    private httpClient: HttpClient
  ) {}

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    if (!!file) {
      this.getBase64(file)
      .then((data: any) => {
        this.file = {
          name: file.name,
          content: data
        }
      });
    }
  }

  getBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      //only returns the pdf content
      reader.onload = () => resolve((<any> reader.result).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

  onFileSubmit() {
    this.httpClient.post('https://staging-api.yousign.com/files', this.file, this.httpOptions).subscribe(res => {
      this.members = this.defaultMembers;
      this.fileId = (<any>res).id
    })
  }

  removeMember(index: number) {
    this.members.splice(index, 1);
  }

  sendPdfToSign(fileId: string) {
    for (let i = 0; i < this.members.length; i++) {
      //replace the dummy filepath and mention with the correct ones
      this.members[i].fileObjects[0].file = fileId;
      this.members[i].fileObjects[0].mention2 = "Signed by " + this.members[i].firstname + ' ' + this.members[i].lastname
    }
    let data = {
      name: "My first procedure",
      description: "Awesome! Here is the description of my first procedure",
      members: this.members
    }

    this.httpClient.post('https://staging-api.yousign.com/procedures', data, this.httpOptions).subscribe(res => {
      console.log("Document envoyé !", res) //so we know it works :)
    })
  }
}
