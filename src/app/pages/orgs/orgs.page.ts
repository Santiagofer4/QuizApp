import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from "../../services/endpoints";
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-orgs',
  templateUrl: './orgs.page.html',
  styleUrls: ['./orgs.page.scss'],
})
export class OrgsPage implements OnInit {
  Quizzes: any = {};
  city: string;
  country: string;
  description: string;
  email: string;
  id: number;
  logo: string;
  name: string;
  schoolQuizzes: any;
  schoolQuizzesBU: any;
  body: any;
  userId: number;
  quizId: number;
  info: any;

  constructor(private storage: Storage,
    private http: HttpClient,
    private endpoints: Endpoints,
    public alertController: AlertController,) { }

  ngOnInit() {
    this.cargarStorage().then(() => {

      this.getOrgQuizzes(this.id)
        .subscribe(async resp => {
          this.Quizzes = await resp
          this.schoolQuizzes = this.Quizzes.quizzes.byId
          this.schoolQuizzesBU = this.Quizzes.quizzes.byId
          console.log("listado", this.schoolQuizzes)

        })
    })
  }

  getOrgQuizzes(id) {
    console.log("se ejecuta get quizzes", this.endpoints.SCHOOL_ENDPOINT + '/' + id + '/quizzes')
    return this.http.get(this.endpoints.SCHOOL_ENDPOINT + '/' + id + '/quizzes')

  }

  searchInputChanged(searchOrg) {
    console.log(this.schoolQuizzesBU)
    if (searchOrg === '') {
      this.schoolQuizzes = this.schoolQuizzesBU
      return
    }
    if (searchOrg !== '') this.schoolQuizzes = this.schoolQuizzesBU.filter((o) => {
      return (o.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchOrg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    })
  }

  async presentAlert(name) {
    switch (name) {
      case "Student":
        name = "Estudiante"
        break;
      case "Teacher":
        name = "Profesor"
        break;
      case "Enrolled":
        name = "Aspirante"
        break;
      case "Fan":
        name = "Seguidor"
        break;
    }
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'QuizApp',
      message: 'Ya eres ' + name + ' de este quiz!',
      buttons: ['OK']
    });

    await alert.present();
  }

  addToFavs(userId, quizId) {
    const body = { UserId: userId, QuizId: quizId }
    console.log("UserID", userId, "QuizId", quizId)
    this.http.post(this.endpoints.ADD_TO_FAVS_ENDPOINT, body).subscribe(data => {
      this.info = data;
      this.presentAlert(this.info.name)
    
    })
  }

  inscriptionQuizApi(userId, quizId) {
    console.log("UserID", userId, "QuizId", quizId)
    const body = { UserId: userId, QuizId: quizId }
    this.http.post(this.endpoints.JOIN_QUIZ_ENDPOINT, body).subscribe(data => {
      this.info = data;
      this.presentAlert(this.info.name)
      console.log("INFO", this.info)
    }
    )
  }

  async cargarStorage() { //Cargo el localStorage
    await this.storage.get('School').then(val => {
      this.id = val.id;
      this.name = val.name;
      this.email = val.email;
      this.logo = val.logo;
      this.description = val.description;
      this.country = val.country;
      this.city = val.city;
      console.log("id2", this.id)
    })
    this.storage.get('User').then(val => {
      this.userId = val.user.id;
    })
  }

}
