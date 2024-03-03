import { Controller, Post, Body } from '@nestjs/common';
import { AlarmGateway } from './alarm.gateway'; 

@Controller()
export class AlarmController {
  constructor(private readonly alarmGateway: AlarmGateway) {}

}
