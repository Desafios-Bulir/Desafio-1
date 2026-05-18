import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { WalletResponseDto, TransactionResponseDto } from './dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req: any): Promise<WalletResponseDto> {
    return this.walletService.getBalance(req.user.id);
  }

  @Get('transactions')
  async getTransactionHistory(
    @Request() req: any,
    @Query('limit') limit?: string,
  ): Promise<TransactionResponseDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.walletService.getTransactionHistory(req.user.id, limitNum);
  }

  @Get('transactions/received')
  async getReceivedTransactions(
    @Request() req: any,
    @Query('limit') limit?: string,
  ): Promise<TransactionResponseDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.walletService.getReceivedTransactions(req.user.id, limitNum);
  }

  @Get('transactions/sent')
  async getSentTransactions(
    @Request() req: any,
    @Query('limit') limit?: string,
  ): Promise<TransactionResponseDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.walletService.getSentTransactions(req.user.id, limitNum);
  }
}
