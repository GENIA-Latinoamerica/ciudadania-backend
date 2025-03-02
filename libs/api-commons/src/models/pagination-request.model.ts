export class PaginationRequest {
  page: number;
  quantity: number;
  search?: string;
  order: string;
  key: string;
  filter: any;
  date_from: Date;
  date_to: Date;
}
