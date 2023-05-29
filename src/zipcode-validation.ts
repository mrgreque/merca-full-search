import axios, { AxiosInstance } from 'axios';

export class ZipCodeValidation {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: 'https://api.mercadolibre.com/countries/BR/zip_codes/',
    });
  }

  async validate(zipcode: string): Promise<any> {
    return await this.axios
      .get(zipcode)
      .then((_) => {
        return true;
      })
      .catch((_) => {
        return false;
      });
  }
}
