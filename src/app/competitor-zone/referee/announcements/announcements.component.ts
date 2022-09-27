import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { UiService } from 'src/app/services/ui.service';
import { UserService } from 'src/app/services/user.service';
import { MessagesService } from '../../../services/messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss']
})
export class AnnouncementsComponent implements OnInit ,OnDestroy {

  public formMessage: FormGroup;
  private loading = false;
  public announcements: Array<any> = [];
  private subs: Subscription = new Subscription;


  constructor(private formBuilder: FormBuilder, public authService: AuthService, public userSerceice: UserService, private ui: UiService,private messageService: MessagesService) {
    this.formMessage = this.formBuilder.group({
      message: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(500)]]
    });
    const sub = this.messageService.allAnnouncements$.subscribe(val => {
      if (val != null) {
      this.announcements = val;
      this.messageService.updateSeenMessages();
    }
    })
    this.subs.add(sub);
  }

  ngOnInit(): void {
      this.messageService.updateSeenMessages();
  }

  async sendMessage() {
    if(this.isFormMessageValid) {
      this.loading = true;
      const decision = await this.ui.wantToContinue(`Czy wysłać wiadomość do wszystkich użytkowników?`)
    if (decision) {
      this.messageService.addAnnouncements(this.formMessage.get('message')?.value).catch(err => {
      }).then(() => {
        this.ui.showFeedback("succes", `Wysłano wiadomość`, 2);
        this.formMessage.reset();
      }).finally(() => {
        this.loading = false;
      });
    }
    }
  }

  get getAnnouncements() {
    return [...this.announcements].sort((a,b) => new Date(b.czas_nadania).getTime() - new Date(a.czas_nadania).getTime())
  }

  get isFormMessageValid() {
    return this.formMessage.valid;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
