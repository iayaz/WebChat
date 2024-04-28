import { WsService } from './../../../service/websockets/ws.service';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Chat {
  message: string;
  votes: number;
}
@Component({
  selector: 'app-chatlayout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatlayout.component.html',
  styleUrl: './chatlayout.component.scss',
})
export class ChatlayoutComponent implements AfterViewInit {
  leastchat: any[] = [];
  mediumchat: any[] = [];
  highchat: any[] = [];
  chatMessage: string = '';

  @ViewChildren('chatConatiner') private chatContainers!: QueryList<ElementRef>;


  constructor(private ws:WsService){
    // this.ws.sendUTF("King Kong is boobies")
    
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatContainers.forEach((chatContainer)=>{
        chatContainer.nativeElement.scrollTop =
        chatContainer.nativeElement.scrollHeight;
      })
      
    } catch (err) {}
  }

  upvote(chat: any, source: string) {
    chat.upvote++;
    if (source === 'primary' && chat.upvote > 10) {
      this.mediumchat.push(chat);
      this.leastchat = this.leastchat.filter(({ id }) => {
        id === chat.id;
      });
    }
    if (source === 'secondary' && chat.upvote > 20) {
      this.highchat.push(chat);
      this.mediumchat = this.mediumchat.filter(({ id }) => {
        id === chat.id;
      });
    }
  }
  sendMessage() {
    this.leastchat.push({
      message: this.chatMessage,
      upvote: 0,
    });
    this.chatMessage = '';
    this.scrollToBottom();
  }
}
