import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: 'API de Pedidos - Desafio naPorta',
      version: '1.0.0',
      status: 'online',
      docs: '/api',
      health: '/health',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}