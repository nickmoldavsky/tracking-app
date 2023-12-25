export interface IParcel {
  id: number;
  title: string;
  trackingNumber: string;
  status?: string;
  origin?: string;
  destination?: string;
  carriers?: string,
  lastState?: object,
  states?: {
    date: string;
    carrier: string;
    status: string;
  };
}

export interface IRequestParams {
  trackingId: string;
  location: string;
  language: string;
}
