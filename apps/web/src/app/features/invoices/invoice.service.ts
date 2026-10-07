import { inject, Service } from '@angular/core';
import { ApiResponse, Invoice, InvoiceStatus } from '@nestgres/contracts';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BadgeTone } from '../../ui/badge/badge';

@Service()
export class InvoiceService {
  private readonly http = inject(HttpClient);

  public getInvoices(): Observable<ApiResponse<Invoice[]>> {
    return this.http.get<ApiResponse<Invoice[]>>('api/invoices');
  }

  public getInvoiceById(id: number): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`api/invoices/${id}`);
  }

  public readonly badgeMap = new Map<InvoiceStatus, BadgeTone>([
    ['open', 'info'],
    ['paid', 'success'],
    ['overdue', 'danger'],
    ['void', 'neutral'],
  ]);
}
