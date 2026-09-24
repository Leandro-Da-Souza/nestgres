import { inject, Service } from '@angular/core';
import { ApiResponse, Invoice } from '@nestgres/contracts';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class InvoiceService {
  private readonly http = inject(HttpClient);

  public getInvoices(): Observable<ApiResponse<Invoice[]>> {
    return this.http.get<ApiResponse<Invoice[]>>('api/invoices');
  }
}
