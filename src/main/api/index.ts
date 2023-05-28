import '../config/module-alias';
import { PersonController, type Speaker } from '@/application/controllers';

class Server {
  init(speaker: Speaker): void {
    console.log(speaker.speak('John Doe'));
    console.log(speaker.speak());
  }
}

const server = new Server();
server.init(new PersonController());
