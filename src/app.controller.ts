import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Retorna informações sobre a API' })
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
  @ApiOperation({ summary: 'Verifica o status de saúde da API' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}